-- V18 release fixes migration
-- Adds per-user chatbot message history storage. Existing installations can run this safely.

CREATE TABLE IF NOT EXISTS chatbot_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  role ENUM('user','assistant') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chatbot_messages_user_created (user_id, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- The users.phone and restaurants.contact_phone columns are reused.
-- V18 application validation requires 10 numeric digits for mobile numbers.
