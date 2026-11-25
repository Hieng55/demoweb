<?php

declare(strict_types=1);

ini_set('display_errors', '0');
date_default_timezone_set('Asia/Ho_Chi_Minh');

final class ApiException extends RuntimeException
{
    public function __construct(
        public readonly string $errorCode,
        public readonly int $httpStatus = 400,
        string $message = ''
    ) {
        parent::__construct($message ?: $errorCode);
    }
}
function app_config(): array
{
    static $config;
    if (is_array($config)) {
        return $config;
    }

    $configuredPath = getenv('WEBS4V_CONFIG_FILE');
    $documentRoot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''), '/\\');
    $defaultPath = dirname($documentRoot) . DIRECTORY_SEPARATOR . 'webs4v-domain-store.php';
    $path = is_string($configuredPath) && $configuredPath !== '' ? $configuredPath : $defaultPath;

    if (!is_file($path)) {
        throw new RuntimeException('Missing backend configuration file.');
    }

    $loaded = require $path;
    if (!is_array($loaded)) {
        throw new RuntimeException('Backend configuration must return an array.');
    }

    foreach (['app_key', 'inet_token', 'db'] as $key) {
        if (empty($loaded[$key])) {
            throw new RuntimeException('Missing required backend setting: ' . $key);
        }
    }
    if (strlen((string) $loaded['app_key']) < 32) {
        throw new RuntimeException('The backend app_key must contain at least 32 characters.');
    }

    $config = $loaded;
    return $config;
}

function db(): PDO
{
    static $pdo;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $database = app_config()['db'];
    $host = (string) ($database['host'] ?? 'localhost');
    $port = (int) ($database['port'] ?? 3306);
    $name = (string) ($database['name'] ?? '');
    $charset = (string) ($database['charset'] ?? 'utf8mb4');
    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset={$charset}";

    $pdo = new PDO($dsn, (string) ($database['user'] ?? ''), (string) ($database['password'] ?? ''), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $pdo->exec("SET time_zone = '+00:00'");
    return $pdo;
}

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, max-age=0');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function api_security_headers(): void
{
    header_remove('X-Powered-By');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: no-referrer');
    header("Content-Security-Policy: default-src 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'none'");
}

function run_api(callable $handler): void
{
    api_security_headers();
    try {
        $config = app_config();
        guard_origin($config);

        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
            header('Access-Control-Allow-Methods: POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type');
            header('Access-Control-Max-Age: 600');
            http_response_code(204);
            exit;
        }
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
            throw new ApiException('method_not_allowed', 405);
        }

        $result = $handler(read_json_body());
        json_response(['ok' => true] + $result);
    } catch (ApiException $error) {
        json_response(['ok' => false, 'error' => $error->errorCode], $error->httpStatus);
    } catch (Throwable $error) {
        error_log('[webs4v-domain-store] ' . $error->getMessage());
        json_response(['ok' => false, 'error' => 'server_error'], 500);
    }
}

function guard_origin(array $config): void
{
    $origin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
    if ($origin === '') {
        return;
    }

    $allowedOrigins = $config['allowed_origins'] ?? ['https://webs4v.vn'];
    if (!is_array($allowedOrigins) || !in_array($origin, $allowedOrigins, true)) {
        throw new ApiException('origin_not_allowed', 403);
    }

    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}

function read_json_body(): array
{
    $length = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($length > 65536) {
        throw new ApiException('payload_too_large', 413);
    }

    $contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
    if (!str_starts_with($contentType, 'application/json')) {
        throw new ApiException('json_required', 415);
    }

    $raw = file_get_contents('php://input');
    try {
        $payload = json_decode((string) $raw, true, 32, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        throw new ApiException('invalid_json');
    }
    if (!is_array($payload)) {
        throw new ApiException('invalid_json');
    }
    return $payload;
}

function clean_text(mixed $value, int $maximumLength): string
{
    $text = trim((string) $value);
    $text = preg_replace('/[\x00-\x1F\x7F]/u', ' ', $text) ?? '';
    return function_exists('mb_substr')
        ? mb_substr($text, 0, $maximumLength, 'UTF-8')
        : substr($text, 0, $maximumLength);
}

function client_ip(): string
{
    $config = app_config();
    if (!empty($config['trust_cloudflare']) && !empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        $candidate = trim((string) $_SERVER['HTTP_CF_CONNECTING_IP']);
        if (filter_var($candidate, FILTER_VALIDATE_IP)) {
            return $candidate;
        }
    }

    $remoteAddress = trim((string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'));
    return filter_var($remoteAddress, FILTER_VALIDATE_IP) ? $remoteAddress : '0.0.0.0';
}

function private_hash(string $value): string
{
    return hash_hmac('sha256', $value, (string) app_config()['app_key']);
}

function enforce_rate_limit(string $scope, int $maximum, int $windowSeconds): void
{
    $rateKey = $scope . ':' . private_hash(client_ip());
    $expiresAt = gmdate('Y-m-d H:i:s', time() + $windowSeconds);
    $statement = db()->prepare(
        'INSERT INTO api_rate_limits (rate_key, request_count, expires_at)
         VALUES (:rate_key, 1, :expires_at)
         ON DUPLICATE KEY UPDATE
           request_count = IF(expires_at <= UTC_TIMESTAMP(), 1, request_count + 1),
           expires_at = IF(expires_at <= UTC_TIMESTAMP(), VALUES(expires_at), expires_at)'
    );
    $statement->execute(['rate_key' => $rateKey, 'expires_at' => $expiresAt]);

    $lookup = db()->prepare('SELECT request_count FROM api_rate_limits WHERE rate_key = :rate_key');
    $lookup->execute(['rate_key' => $rateKey]);
    if ((int) $lookup->fetchColumn() > $maximum) {
        throw new ApiException('rate_limited', 429);
    }

    if (random_int(1, 100) === 1) {
        db()->exec('DELETE FROM api_rate_limits WHERE expires_at < UTC_TIMESTAMP()');
    }
}

function cache_get(string $key): ?array
{
    $statement = db()->prepare(
        'SELECT payload_json FROM domain_cache WHERE cache_key = :cache_key AND expires_at > UTC_TIMESTAMP()'
    );
    $statement->execute(['cache_key' => $key]);
    $payload = $statement->fetchColumn();
    if (!is_string($payload)) {
        return null;
    }

    $decoded = json_decode($payload, true);
    return is_array($decoded) ? $decoded : null;
}

function cache_put(string $key, array $payload, int $ttlSeconds): void
{
    $statement = db()->prepare(
        'INSERT INTO domain_cache (cache_key, payload_json, expires_at)
         VALUES (:cache_key, :payload_json, :expires_at)
         ON DUPLICATE KEY UPDATE
           payload_json = VALUES(payload_json),
           expires_at = VALUES(expires_at),
           updated_at = UTC_TIMESTAMP()'
    );
    $statement->execute([
        'cache_key' => $key,
        'payload_json' => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        'expires_at' => gmdate('Y-m-d H:i:s', time() + $ttlSeconds),
    ]);
    if (random_int(1, 100) === 1) {
        db()->exec('DELETE FROM domain_cache WHERE expires_at < UTC_TIMESTAMP()');
    }
}

function curl_handle(array $request): CurlHandle
{
    $method = strtoupper((string) ($request['method'] ?? 'GET'));
    $headers = ['Accept: application/json'];
    foreach (($request['headers'] ?? []) as $name => $value) {
        $headers[] = $name . ': ' . $value;
    }

    $handle = curl_init((string) $request['url']);
    curl_setopt_array($handle, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 12,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_USERAGENT => 'Webs4V-Domain-Store/1.0',
    ]);
    if (defined('CURLOPT_PROTOCOLS') && defined('CURLPROTO_HTTPS')) {
        curl_setopt($handle, CURLOPT_PROTOCOLS, CURLPROTO_HTTPS);
    }
    if (array_key_exists('json', $request)) {
        $headers[] = 'Content-Type: application/json';
        curl_setopt($handle, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($handle, CURLOPT_POSTFIELDS, json_encode($request['json'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }
    return $handle;
}

function http_json_many(array $requests): array
{
    $multi = curl_multi_init();
    $handles = [];
    foreach ($requests as $index => $request) {
        $handle = curl_handle($request);
        $handles[$index] = $handle;
        curl_multi_add_handle($multi, $handle);
    }

    do {
        $status = curl_multi_exec($multi, $running);
        if ($running) {
            curl_multi_select($multi, 1.0);
        }
    } while ($running && $status === CURLM_OK);

    $responses = [];
    foreach ($handles as $index => $handle) {
        $body = curl_multi_getcontent($handle);
        $error = curl_error($handle);
        $httpStatus = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
        $decoded = is_string($body) ? json_decode($body, true) : null;
        $responses[$index] = [
            'status' => $httpStatus,
            'data' => is_array($decoded) ? $decoded : null,
            'error' => $error,
        ];
        curl_multi_remove_handle($multi, $handle);
        curl_close($handle);
    }
    curl_multi_close($multi);
    ksort($responses);
    return array_values($responses);
}

function http_json(array $request): array
{
    return http_json_many([$request])[0];
}

function telegram_send(string $message): void
{
    $config = app_config();
    $token = trim((string) ($config['telegram_bot_token'] ?? ''));
    $chatId = trim((string) ($config['telegram_chat_id'] ?? ''));
    if ($token === '' || $chatId === '') {
        throw new RuntimeException('Telegram is not configured.');
    }
    if (!preg_match('/^\d+:[A-Za-z0-9_-]+$/', $token)) {
        throw new RuntimeException('Telegram bot token has an invalid format.');
    }

    $response = http_json([
        'url' => 'https://api.telegram.org/bot' . $token . '/sendMessage',
        'method' => 'POST',
        'json' => [
            'chat_id' => $chatId,
            'text' => $message,
            'parse_mode' => 'HTML',
            'disable_web_page_preview' => true,
        ],
    ]);
    if ($response['status'] < 200 || $response['status'] >= 300 || empty($response['data']['ok'])) {
        throw new RuntimeException('Telegram rejected the notification.');
    }
}

function html_escape(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
