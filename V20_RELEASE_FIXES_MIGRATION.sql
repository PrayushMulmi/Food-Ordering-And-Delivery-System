-- V20 release migration for Food Ordering and Delivery System
-- Run this against an existing database before starting the V20 backend.
-- This migration is idempotent for the fields/tables used by the V20 fixes.

USE food_ordering_and_delivery_app;
SET @db_name := DATABASE();

-- Theme persistence support for PUT /api/auth/me/theme.
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @db_name AND table_name = 'users' AND column_name = 'theme') = 0,
  'ALTER TABLE users ADD COLUMN theme VARCHAR(30) DEFAULT ''light''',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE users SET theme = 'light' WHERE theme IS NULL OR theme NOT IN ('light', 'dark');

-- Restaurant open/closed availability field.
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @db_name AND table_name = 'restaurants' AND column_name = 'is_open') = 0,
  'ALTER TABLE restaurants ADD COLUMN is_open TINYINT(1) DEFAULT 1',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Ensure restaurant suspension states are supported and suspended restaurants cannot appear open.
ALTER TABLE restaurants
  MODIFY status ENUM('active', 'suspended') DEFAULT 'active';

UPDATE restaurants SET status = 'active' WHERE status IS NULL;
UPDATE restaurants SET is_open = 0 WHERE status = 'suspended';

-- Secure WhatsApp OTP password reset storage; OTP values are bcrypt-hashed by the backend.
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  phone VARCHAR(30) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_password_reset_phone (phone),
  INDEX idx_password_reset_user_created (user_id, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @db_name AND table_name = 'password_reset_codes' AND index_name = 'idx_password_reset_user_created') = 0,
  'CREATE INDEX idx_password_reset_user_created ON password_reset_codes (user_id, created_at)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
