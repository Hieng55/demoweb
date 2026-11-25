<?php

declare(strict_types=1);

require_once __DIR__ . '/_internal/bootstrap.php';
require_once __DIR__ . '/_internal/domains.php';
require_once __DIR__ . '/_internal/orders.php';

run_api(static fn (array $payload): array => create_order($payload));
