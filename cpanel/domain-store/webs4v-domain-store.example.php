<?php

declare(strict_types=1);

return [
    // Generate once with: php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"
    'app_key' => 'REPLACE_WITH_AT_LEAST_32_RANDOM_CHARACTERS',

    'db' => [
        'host' => 'localhost',
        'port' => 3306,
        'name' => 'CPANEL_DATABASE_NAME',
        'user' => 'CPANEL_DATABASE_USER',
        'password' => 'CPANEL_DATABASE_PASSWORD',
        'charset' => 'utf8mb4',
    ],

    'inet_token' => 'INET_RESELLER_TOKEN',
    'telegram_bot_token' => 'TELEGRAM_BOT_TOKEN',
    'telegram_chat_id' => 'TELEGRAM_CHAT_ID',

    'allowed_origins' => [
        'https://webs4v.vn',
        'https://www.webs4v.vn',
    ],

    // Only enable when the origin server is restricted to Cloudflare traffic.
    'trust_cloudflare' => false,

    'hosting_products' => [
        'wordpress-new' => 'Web Hosting WordPress',
        'business' => 'Business Hosting',
        'cloud-hosting' => 'Cloud Hosting',
    ],
];
