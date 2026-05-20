-- V22 release database updates
-- Run this after backing up the existing food_ordering_and_delivery_app database.
USE food_ordering_and_delivery_app;

-- Normalize existing user phone values to the project standard 10-digit Nepali mobile format.
-- This makes duplicate checks consistent between +977984xxxxxxx and 984xxxxxxx values.
UPDATE users
SET phone = RIGHT(REPLACE(REPLACE(REPLACE(IFNULL(phone, ''), ' ', ''), '-', ''), '+', ''), 10)
WHERE phone IS NOT NULL AND phone <> '';

-- Track Terms & Conditions acceptance for new signups.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS terms_accepted TINYINT(1) DEFAULT 0 AFTER login_blocked_until,
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP NULL AFTER terms_accepted;

-- Pending signup OTP records. Accounts are created only after the OTP is verified.
CREATE TABLE IF NOT EXISTS signup_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  food_preferences JSON NULL,
  terms_accepted TINYINT(1) NOT NULL DEFAULT 0,
  terms_accepted_at TIMESTAMP NULL,
  code_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_signup_verification_email_phone (email, phone),
  INDEX idx_signup_verification_phone_created (phone, created_at)
);

-- Check for duplicate phone numbers before adding a unique index on an existing database.
-- If this query returns rows, merge/fix the duplicate accounts first.
SELECT phone, COUNT(*) AS duplicate_count
FROM users
WHERE phone IS NOT NULL AND phone <> ''
GROUP BY phone
HAVING COUNT(*) > 1;

-- Recommended after confirming the duplicate check above returns no rows.
-- ALTER TABLE users ADD UNIQUE KEY uniq_users_phone (phone);
