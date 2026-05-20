USE food_ordering_and_delivery_app;

-- V21: login rate limiting support.
SET @db_name := DATABASE();

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @db_name AND table_name = 'users' AND column_name = 'failed_login_attempts') = 0,
  'ALTER TABLE users ADD COLUMN failed_login_attempts INT NOT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = @db_name AND table_name = 'users' AND column_name = 'login_blocked_until') = 0,
  'ALTER TABLE users ADD COLUMN login_blocked_until TIMESTAMP NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- V21: allow rider-side Delivery Failed status after dispatch.
ALTER TABLE orders
  MODIFY status ENUM('Pending','Confirmed','Preparing','Ready for Dispatch','Out for Delivery','Delivered','Delivery Failed','Cancelled','Refunded') DEFAULT 'Pending';
