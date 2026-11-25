CREATE TABLE IF NOT EXISTS api_rate_limits (
  rate_key VARCHAR(191) NOT NULL,
  request_count INT UNSIGNED NOT NULL DEFAULT 1,
  expires_at DATETIME NOT NULL,
  PRIMARY KEY (rate_key),
  KEY idx_api_rate_limits_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS domain_cache (
  cache_key VARCHAR(191) NOT NULL,
  payload_json MEDIUMTEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (cache_key),
  KEY idx_domain_cache_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS domain_orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_code VARCHAR(40) NOT NULL,
  fullname VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(160) NOT NULL,
  note TEXT NULL,
  source VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'pending_manual_review',
  client_hash CHAR(64) NOT NULL,
  duplicate_hash CHAR(64) NOT NULL,
  notification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  notification_error VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_domain_orders_order_code (order_code),
  KEY idx_domain_orders_duplicate_created (duplicate_hash, created_at),
  KEY idx_domain_orders_status_created (status, created_at),
  KEY idx_domain_orders_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS domain_order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  item_type VARCHAR(20) NOT NULL,
  item_key VARCHAR(253) NOT NULL,
  item_name VARCHAR(253) NOT NULL,
  unit_price DECIMAL(14,2) NULL,
  availability_snapshot VARCHAR(30) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_domain_order_items_order_id (order_id),
  CONSTRAINT fk_domain_order_items_order
    FOREIGN KEY (order_id) REFERENCES domain_orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS domain_consents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  purpose VARCHAR(80) NOT NULL,
  policy_version VARCHAR(20) NOT NULL,
  consent_text TEXT NOT NULL,
  source VARCHAR(80) NOT NULL,
  granted TINYINT(1) NOT NULL DEFAULT 1,
  consented_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_domain_consents_order_id (order_id),
  KEY idx_domain_consents_consented_at (consented_at),
  CONSTRAINT fk_domain_consents_order
    FOREIGN KEY (order_id) REFERENCES domain_orders (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
