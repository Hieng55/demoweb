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
