USE food_ordering_and_delivery_app;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NULL,
  role ENUM('customer', 'restaurant_admin', 'super_admin') NOT NULL DEFAULT 'customer',
  theme VARCHAR(30) DEFAULT 'light',
  food_preferences JSON NULL,
  status ENUM('active', 'suspended') DEFAULT 'active',
  force_password_change TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restaurants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  owner_user_id INT NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  cuisine VARCHAR(100) NULL,
  address VARCHAR(255) NULL,
  contact_phone VARCHAR(30) NULL,
  image_url TEXT NULL,
  price_level VARCHAR(10) DEFAULT '$$',
  rating_average DECIMAL(3,2) DEFAULT 0.00,
  is_open TINYINT(1) DEFAULT 1,
  status ENUM('active', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurant_id INT NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  name VARCHAR(150) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT NULL,
  is_available TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS baskets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  restaurant_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS basket_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  basket_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (basket_id) REFERENCES baskets(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS coupons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurant_id INT NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type ENUM('percentage', 'flat') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0.00,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  usage_limit INT NULL,
  used_count INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_code VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  basket_id INT NULL,
  coupon_id INT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  delivery_fee DECIMAL(10,2) DEFAULT 0.00,
  final_total DECIMAL(10,2) NOT NULL,
  delivery_address VARCHAR(255) NOT NULL,
  notes TEXT NULL,
  status ENUM(
    'Pending',
    'Confirmed',
    'Preparing',
    'Ready for Dispatch',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
    'Refunded'
  ) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (basket_id) REFERENCES baskets(id) ON DELETE SET NULL,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  item_name VARCHAR(150) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_status_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  changed_by_user_id INT NULL,
  note VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  rating INT NOT NULL,
  comment TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'system',
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admin_action_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  action_by_user_id INT NOT NULL,
  target_type ENUM('user', 'restaurant') NOT NULL,
  target_id INT NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (action_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (full_name, email, password, role, status)
VALUES (
  'Super Admin',
  'superadmin@example.com',
  '$2a$10$KIXIDT1V3x9P5M1Y7qK5Lu5gD6Gx8yPyBvR5s5xyPjdvVSxGInxBq',
  'super_admin',
  'active'
)
ON DUPLICATE KEY UPDATE email = email;

INSERT INTO users (full_name, email, password, phone, role, status)
SELECT 'Rudra Cafe Admin', 'restaurantadmin@example.com', '$2a$10$KIXIDT1V3x9P5M1Y7qK5Lu5gD6Gx8yPyBvR5s5xyPjdvVSxGInxBq', '9800000001', 'restaurant_admin', 'active'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'restaurantadmin@example.com'
);

INSERT INTO restaurants (owner_user_id, name, description, cuisine, address, contact_phone, image_url, price_level, rating_average, is_open, status)
SELECT u.id, 'Rudra Cafe', 'Fresh burgers, momo, coffee, and quick meals.', 'Cafe, Fast Food', 'Putalisadak, Kathmandu', '9800000001', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80', '$$', 4.60, 1, 'active'
FROM users u
WHERE u.email = 'restaurantadmin@example.com'
  AND NOT EXISTS (SELECT 1 FROM restaurants WHERE name = 'Rudra Cafe');

INSERT INTO menu_items (restaurant_id, category, name, description, price, image_url, is_available)
SELECT r.id, 'Burger', 'Annaya Special Burger', 'Grilled patty burger with cheese and fresh vegetables.', 443.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80', 1
FROM restaurants r
WHERE r.name = 'Rudra Cafe'
  AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Annaya Special Burger');

INSERT INTO menu_items (restaurant_id, category, name, description, price, image_url, is_available)
SELECT r.id, 'Momo', 'Chicken Momo', 'Steamed momo served with spicy achar.', 220.00, 'https://images.unsplash.com/photo-1625944525533-473f1c35fdcf?auto=format&fit=crop&w=1200&q=80', 1
FROM restaurants r
WHERE r.name = 'Rudra Cafe'
  AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Chicken Momo');

INSERT INTO menu_items (restaurant_id, category, name, description, price, image_url, is_available)
SELECT r.id, 'Beverage', 'Cold Coffee', 'Smooth chilled coffee with ice cream topping.', 180.00, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1200&q=80', 1
FROM restaurants r
WHERE r.name = 'Rudra Cafe'
  AND NOT EXISTS (SELECT 1 FROM menu_items WHERE name = 'Cold Coffee');
