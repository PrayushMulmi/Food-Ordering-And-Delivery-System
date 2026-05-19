-- V11 release stabilisation migration
-- Run this against the existing Food Ordering and Delivery System database.
-- MySQL 8.0.29+ supports ADD COLUMN IF NOT EXISTS. If your MySQL version is older,
-- skip any ALTER statement for a column that already exists or rely on the backend auto-migration in src/config/db.js.

USE food_ordering_and_delivery_app;

ALTER TABLE users
  MODIFY role ENUM('customer', 'restaurant_admin', 'super_admin', 'rider') NOT NULL DEFAULT 'customer';

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS restaurant_location_url TEXT NULL;

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS region ENUM('Kathmandu', 'Bhaktapur', 'Lalitpur') NOT NULL DEFAULT 'Kathmandu';

ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS max_discount_amount DECIMAL(10,2) NULL AFTER discount_value;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS assigned_rider_user_id INT NULL;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_latitude DECIMAL(10,7) NULL;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_longitude DECIMAL(10,7) NULL;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS rider_current_latitude DECIMAL(10,7) NULL;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS rider_current_longitude DECIMAL(10,7) NULL;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS rider_location_updated_at TIMESTAMP NULL;

CREATE TABLE IF NOT EXISTS user_saved_locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  label VARCHAR(100) NOT NULL,
  location_input TEXT NULL,
  google_maps_url TEXT NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_location_label (user_id, label),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rider_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  availability_status ENUM('available', 'assigned', 'offline') NOT NULL DEFAULT 'available',
  vehicle_label VARCHAR(100) NULL,
  region ENUM('Kathmandu', 'Bhaktapur', 'Lalitpur') NOT NULL DEFAULT 'Kathmandu',
  current_latitude DECIMAL(10,7) NULL,
  current_longitude DECIMAL(10,7) NULL,
  last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE rider_profiles
  ADD COLUMN IF NOT EXISTS region ENUM('Kathmandu', 'Bhaktapur', 'Lalitpur') NOT NULL DEFAULT 'Kathmandu';

CREATE TABLE IF NOT EXISTS password_reset_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  phone VARCHAR(30) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_password_reset_phone (phone),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rider_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rider_user_id INT NOT NULL,
  order_id INT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rider_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

UPDATE restaurants SET region = 'Kathmandu' WHERE region IS NULL OR region = '';

INSERT IGNORE INTO rider_profiles (user_id, availability_status, vehicle_label, region, current_latitude, current_longitude)
SELECT id, 'available', 'Bike', 'Kathmandu', NULL, NULL
FROM users
WHERE role = 'rider';
