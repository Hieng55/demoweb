<?php

declare(strict_types=1);

function create_order(array $payload): array
{
    $customer = is_array($payload['customer'] ?? null) ? $payload['customer'] : [];
    $fullname = clean_text($customer['fullname'] ?? '', 100);
    $phone = clean_text($customer['phone'] ?? '', 30);
    $phoneDigits = preg_replace('/\D+/', '', $phone) ?? '';
    $email = strtolower(clean_text($customer['email'] ?? '', 160));
    $note = clean_text($customer['note'] ?? '', 1500);
    $honeypot = clean_text($payload['website'] ?? '', 120);
    $startedAt = (int) ($payload['startedAt'] ?? 0);
    $elapsed = (int) floor(microtime(true) * 1000) - $startedAt;

    if ($honeypot !== '') {
        return ['code' => 'TM-' . date('ymd-Hi') . '-OK', 'status' => 'pending_manual_review'];
    }
    if ($startedAt <= 0 || $elapsed < 1500 || $elapsed > 7200000) {
        throw new ApiException('invalid_timing');
    }
    if (empty($payload['consent'])) {
        throw new ApiException('consent_required');
    }
    if (strlen($fullname) < 2 || strlen($phoneDigits) < 9 || strlen($phoneDigits) > 15 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new ApiException('invalid_customer');
    }

    $rawItems = $payload['items'] ?? null;
    if (!is_array($rawItems) || $rawItems === [] || count($rawItems) > 10) {
        throw new ApiException('invalid_items');
    }

    $items = normalize_order_items($rawItems);
    enforce_rate_limit('domain-order', 5, 3600);

    $duplicateHash = private_hash($email . '|' . $phoneDigits . '|' . json_encode($items));
    $existing = db()->prepare(
        'SELECT id, order_code, status FROM domain_orders
         WHERE duplicate_hash = :duplicate_hash AND created_at >= UTC_TIMESTAMP() - INTERVAL 10 MINUTE
         ORDER BY id DESC LIMIT 1'
    );
    $existing->execute(['duplicate_hash' => $duplicateHash]);
    $duplicate = $existing->fetch();
    if (is_array($duplicate)) {
        return [
            'id' => (int) $duplicate['id'],
            'code' => $duplicate['order_code'],
            'status' => $duplicate['status'],
            'duplicate' => true,
        ];
    }

    $orderCode = 'TM-' . date('ymd-Hi') . '-' . strtoupper(bin2hex(random_bytes(3)));
    $source = clean_text($payload['source'] ?? 'domain-hosting-page', 80);
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $orderStatement = $pdo->prepare(
            'INSERT INTO domain_orders
             (order_code, fullname, phone, email, note, source, status, client_hash, duplicate_hash, notification_status)
             VALUES
             (:order_code, :fullname, :phone, :email, :note, :source, :status, :client_hash, :duplicate_hash, :notification_status)'
        );
        $orderStatement->execute([
            'order_code' => $orderCode,
            'fullname' => $fullname,
            'phone' => $phone,
            'email' => $email,
            'note' => $note,
            'source' => $source,
            'status' => 'pending_manual_review',
            'client_hash' => private_hash(client_ip()),
            'duplicate_hash' => $duplicateHash,
            'notification_status' => 'pending',
        ]);
        $orderId = (int) $pdo->lastInsertId();

        $itemStatement = $pdo->prepare(
            'INSERT INTO domain_order_items
             (order_id, item_type, item_key, item_name, unit_price, availability_snapshot)
             VALUES
             (:order_id, :item_type, :item_key, :item_name, :unit_price, :availability_snapshot)'
        );
        foreach ($items as $item) {
            $itemStatement->execute([
                'order_id' => $orderId,
                'item_type' => $item['type'],
                'item_key' => $item['key'],
                'item_name' => $item['name'],
                'unit_price' => $item['price'],
                'availability_snapshot' => $item['availability'],
            ]);
        }
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $error;
    }

    notify_order($orderId, $orderCode, $fullname, $phone, $email, $note, $items);
    return ['id' => $orderId, 'code' => $orderCode, 'status' => 'pending_manual_review'];
}
function normalize_order_items(array $rawItems): array
{
    $hostingProducts = app_config()['hosting_products'] ?? [
        'wordpress-new' => 'Web Hosting WordPress',
        'business' => 'Business Hosting',
        'cloud-hosting' => 'Cloud Hosting',
    ];
    $items = [];
    foreach ($rawItems as $rawItem) {
        if (!is_array($rawItem)) throw new ApiException('invalid_items');
        $type = clean_text($rawItem['type'] ?? '', 20);
        $key = clean_text($rawItem['id'] ?? $rawItem['name'] ?? '', 253);

        if ($type === 'domain') {
            $domain = normalize_domain($key);
            if (!valid_domain($domain)) throw new ApiException('invalid_items');
            $cached = cache_get(domain_cache_key('result', $domain)) ?? [];
            $items[] = [
                'type' => 'domain',
                'key' => $domain,
                'name' => $domain,
                'price' => numeric_price($cached['registrationPrice'] ?? $cached['price'] ?? null),
                'availability' => clean_text($cached['availability'] ?? 'unverified', 30),
            ];
            continue;
        }

        if ($type === 'hosting' && is_array($hostingProducts) && isset($hostingProducts[$key])) {
            $items[] = [
                'type' => 'hosting',
                'key' => $key,
                'name' => clean_text($hostingProducts[$key], 253),
                'price' => null,
                'availability' => 'manual_review',
            ];
            continue;
        }
        throw new ApiException('invalid_items');
    }

    $unique = [];
    foreach ($items as $item) {
        $unique[$item['type'] . ':' . $item['key']] = $item;
    }
    if ($unique === []) throw new ApiException('invalid_items');
    return array_values($unique);
}

function numeric_price(mixed $value): ?float
{
    return is_numeric($value) && (float) $value > 0 ? (float) $value : null;
}

function notify_order(int $orderId, string $code, string $fullname, string $phone, string $email, string $note, array $items): void
{
    $lines = [
        '<b>YÊU CẦU TƯ VẤN TÊN MIỀN — WEBS4V</b>',
        '',
        '<b>Mã yêu cầu:</b> ' . html_escape($code),
        '<b>Khách hàng:</b> ' . html_escape($fullname),
        '<b>Điện thoại:</b> ' . html_escape($phone),
        '<b>Email:</b> ' . html_escape($email),
        '<b>Hạng mục:</b>',
    ];
    foreach ($items as $index => $item) {
        $price = $item['price'] !== null ? ' — ' . number_format((float) $item['price'], 0, ',', '.') . 'đ' : '';
        $lines[] = ($index + 1) . '. ' . html_escape($item['name']) . ' (' . html_escape($item['type']) . ')' . $price;
    }
    $lines[] = '<b>Ghi chú:</b> ' . html_escape($note !== '' ? $note : 'Chưa cung cấp');
    $lines[] = '';
    $lines[] = '<i>Yêu cầu tư vấn đã được lưu vào MySQL và đang chờ nhân viên liên hệ báo giá. Chưa phát sinh đơn hàng hoặc nghĩa vụ thanh toán.</i>';

    try {
        telegram_send(implode("\n", $lines));
        $statement = db()->prepare("UPDATE domain_orders SET notification_status = 'sent', notification_error = NULL WHERE id = :id");
        $statement->execute(['id' => $orderId]);
    } catch (Throwable $error) {
        error_log('[webs4v-domain-store] Telegram notification failed for ' . $code . ': ' . $error->getMessage());
        $statement = db()->prepare("UPDATE domain_orders SET notification_status = 'failed', notification_error = :error WHERE id = :id");
        $statement->execute(['id' => $orderId, 'error' => clean_text($error->getMessage(), 500)]);
    }
}
