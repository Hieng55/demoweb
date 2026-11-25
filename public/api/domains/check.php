<?php

declare(strict_types=1);

require_once __DIR__ . '/../_internal/bootstrap.php';
require_once __DIR__ . '/../_internal/domains.php';

run_api(static function (array $payload): array {
    enforce_rate_limit('domain-check', 30, 60);
    $domains = $payload['domains'] ?? null;
    if (!is_array($domains)) {
        throw new ApiException('invalid_domain');
    }
    return ['results' => check_domains($domains)];
});
