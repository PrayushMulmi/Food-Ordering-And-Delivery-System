ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_latitude DECIMAL(10,7) NULL,
  ADD COLUMN IF NOT EXISTS delivery_longitude DECIMAL(10,7) NULL,
  ADD COLUMN IF NOT EXISTS rider_current_latitude DECIMAL(10,7) NULL,
  ADD COLUMN IF NOT EXISTS rider_current_longitude DECIMAL(10,7) NULL,
  ADD COLUMN IF NOT EXISTS rider_location_updated_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS assigned_rider_user_id INT NULL;

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
  CONSTRAINT fk_user_saved_locations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
