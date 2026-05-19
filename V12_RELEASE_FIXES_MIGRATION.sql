USE food_ordering_and_delivery_app;

ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS restaurant_code VARCHAR(50) NULL AFTER id;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS image_blob LONGBLOB NULL;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS image_mime VARCHAR(100) NULL;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS cover_photo_blob LONGBLOB NULL;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS cover_photo_mime VARCHAR(100) NULL;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS restaurant_location_url TEXT NULL;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS region ENUM('Kathmandu', 'Bhaktapur', 'Lalitpur') NOT NULL DEFAULT 'Kathmandu';

UPDATE restaurants
SET restaurant_code = CONCAT('REST-', id, '-', UPPER(SUBSTRING(MD5(CONCAT(id, name, owner_user_id)), 1, 8)))
WHERE restaurant_code IS NULL OR restaurant_code = '';

ALTER TABLE restaurants MODIFY restaurant_code VARCHAR(50) NOT NULL;
CREATE UNIQUE INDEX uniq_restaurants_code ON restaurants (restaurant_code);

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_blob LONGBLOB NULL;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_mime VARCHAR(100) NULL;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_rider_user_id INT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_latitude DECIMAL(10,7) NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_longitude DECIMAL(10,7) NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_current_latitude DECIMAL(10,7) NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_current_longitude DECIMAL(10,7) NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_location_updated_at TIMESTAMP NULL;

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
