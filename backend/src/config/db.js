import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { normalizeSavedLocationInput, parseCoordinatesFromMapUrl } from '../utils/location.js';

dotenv.config();

const baseConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
};

export const pool = mysql.createPool({
  ...baseConfig,
  database: process.env.DB_NAME,
});

export const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

async function ensureColumn(connection, tableName, columnName, definition) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ? AND column_name = ?`,
    [process.env.DB_NAME, tableName, columnName],
  );

  if (!Number(rows?.[0]?.total || 0)) {
    await connection.query(`ALTER TABLE \`${tableName}\` ADD COLUMN ${definition}`);
  }
}

async function ensureTable(connection, tableName, createSql) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.tables
     WHERE table_schema = ? AND table_name = ?`,
    [process.env.DB_NAME, tableName],
  );

  if (!Number(rows?.[0]?.total || 0)) {
    await connection.query(createSql);
  }
}

async function runMigrations(connection) {
  await connection.query(
    `ALTER TABLE users MODIFY role ENUM('customer', 'restaurant_admin', 'super_admin', 'rider') NOT NULL DEFAULT 'customer'`,
  );

  await ensureColumn(connection, 'restaurants', 'restaurant_location_url', 'restaurant_location_url TEXT NULL');
  await ensureColumn(connection, 'restaurants', 'region', "region ENUM('Kathmandu', 'Bhaktapur', 'Lalitpur') NOT NULL DEFAULT 'Kathmandu'");
  await ensureColumn(connection, 'restaurants', 'latitude', 'latitude DECIMAL(10,7) NULL');
  await ensureColumn(connection, 'restaurants', 'longitude', 'longitude DECIMAL(10,7) NULL');
  await ensureColumn(connection, 'restaurants', 'restaurant_code', 'restaurant_code VARCHAR(50) NULL AFTER id');
  await ensureColumn(connection, 'restaurants', 'image_blob', 'image_blob LONGBLOB NULL');
  await ensureColumn(connection, 'restaurants', 'image_mime', 'image_mime VARCHAR(100) NULL');
  await ensureColumn(connection, 'restaurants', 'cover_photo_blob', 'cover_photo_blob LONGBLOB NULL');
  await ensureColumn(connection, 'restaurants', 'cover_photo_mime', 'cover_photo_mime VARCHAR(100) NULL');
  await ensureColumn(connection, 'menu_items', 'image_blob', 'image_blob LONGBLOB NULL');
  await ensureColumn(connection, 'menu_items', 'image_mime', 'image_mime VARCHAR(100) NULL');
  await ensureColumn(connection, 'coupons', 'max_discount_amount', 'max_discount_amount DECIMAL(10,2) NULL AFTER discount_value');
  await ensureColumn(connection, 'orders', 'assigned_rider_user_id', 'assigned_rider_user_id INT NULL');
  await ensureColumn(connection, 'orders', 'delivery_latitude', 'delivery_latitude DECIMAL(10,7) NULL');
  await ensureColumn(connection, 'orders', 'delivery_longitude', 'delivery_longitude DECIMAL(10,7) NULL');
  await ensureColumn(connection, 'orders', 'rider_current_latitude', 'rider_current_latitude DECIMAL(10,7) NULL');
  await ensureColumn(connection, 'orders', 'rider_current_longitude', 'rider_current_longitude DECIMAL(10,7) NULL');
  await ensureColumn(connection, 'orders', 'rider_location_updated_at', 'rider_location_updated_at TIMESTAMP NULL');

  await ensureTable(connection, 'user_saved_locations', `
    CREATE TABLE user_saved_locations (
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
    )
  `);

  await ensureTable(connection, 'rider_profiles', `
    CREATE TABLE rider_profiles (
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
    )
  `);

  await ensureColumn(connection, 'rider_profiles', 'region', "region ENUM('Kathmandu', 'Bhaktapur', 'Lalitpur') NOT NULL DEFAULT 'Kathmandu'");

  await ensureTable(connection, 'password_reset_codes', `
    CREATE TABLE password_reset_codes (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      phone VARCHAR(30) NOT NULL,
      code_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_password_reset_phone (phone),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await ensureTable(connection, 'rider_notifications', `
    CREATE TABLE rider_notifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      rider_user_id INT NOT NULL,
      order_id INT NULL,
      title VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (rider_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
    )
  `);

  const [fkRows] = await connection.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'assigned_rider_user_id' AND REFERENCED_TABLE_NAME = 'users'`,
    [process.env.DB_NAME],
  );

  if (!Number(fkRows?.[0]?.total || 0)) {
    try {
      await connection.query(
        `ALTER TABLE orders ADD CONSTRAINT fk_orders_assigned_rider FOREIGN KEY (assigned_rider_user_id) REFERENCES users(id) ON DELETE SET NULL`,
      );
    } catch {}
  }

  await connection.query(
    `UPDATE restaurants
     SET restaurant_code = CONCAT('REST-', id, '-', UPPER(SUBSTRING(MD5(CONCAT(id, name, owner_user_id)), 1, 8)))
     WHERE restaurant_code IS NULL OR restaurant_code = ''`
  );
  try {
    await connection.query(`ALTER TABLE restaurants MODIFY restaurant_code VARCHAR(50) NOT NULL`);
  } catch {}
  try {
    await connection.query(`CREATE UNIQUE INDEX uniq_restaurants_code ON restaurants (restaurant_code)`);
  } catch {}

  await connection.query(
    `INSERT IGNORE INTO users (id, full_name, email, password, phone, role, theme, food_preferences, status, force_password_change)
     VALUES
     (43, 'Rider One', 'rider1@annaya.test', 'Rider1Pass!', '9860000043', 'rider', 'light', JSON_ARRAY('On-Time'), 'active', 0),
     (44, 'Rider Two', 'rider2@annaya.test', 'Rider2Pass!', '9860000044', 'rider', 'light', JSON_ARRAY('Safe Ride'), 'active', 0),
     (45, 'Rider Three', 'rider3@annaya.test', 'Rider3Pass!', '9860000045', 'rider', 'light', JSON_ARRAY('Quick Delivery'), 'active', 0)`,
  );

  await connection.query(
    `INSERT IGNORE INTO rider_profiles (user_id, availability_status, vehicle_label, region, current_latitude, current_longitude)
     VALUES
     (43, 'available', 'Bike - BA 01 0001', 'Kathmandu', 27.7172000, 85.3240000),
     (44, 'available', 'Scooter - BA 01 0002', 'Bhaktapur', 27.6710000, 85.4298000),
     (45, 'offline', 'Bike - BA 01 0003', 'Lalitpur', 27.6644000, 85.3188000)`,
  );


  const [restaurantLocationRows] = await connection.query(
    `SELECT id, restaurant_location_url FROM restaurants
     WHERE restaurant_location_url IS NOT NULL
       AND restaurant_location_url <> ''
       AND (latitude IS NULL OR longitude IS NULL)`,
  );

  for (const restaurant of restaurantLocationRows) {
    const coords = parseCoordinatesFromMapUrl(restaurant.restaurant_location_url);
    if (!coords) continue;
    await connection.query(
      `UPDATE restaurants SET latitude = ?, longitude = ? WHERE id = ?`,
      [coords.latitude, coords.longitude, restaurant.id],
    );
  }

  const seedLocations = [
    { user_id: 23, label: 'Home', location_input: '27.7172,85.3240' },
    { user_id: 23, label: 'Office', location_input: 'https://www.openstreetmap.org/?mlat=27.7008&mlon=85.3334#map=16/27.7008/85.3334' },
  ];

  for (const item of seedLocations) {
    const normalized = normalizeSavedLocationInput(item);
    await connection.query(
      `INSERT IGNORE INTO user_saved_locations (user_id, label, location_input, google_maps_url, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        item.user_id,
        normalized.label,
        normalized.rawInput || null,
        normalized.googleMapsUrl,
        normalized.latitude,
        normalized.longitude,
      ],
    );
  }
}

export async function initializeDatabase() {
  const adminPool = mysql.createPool(baseConfig);

  try {
    await adminPool.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);

    const [tables] = await adminPool.query(
      `SELECT COUNT(*) AS total
       FROM information_schema.tables
       WHERE table_schema = ? AND table_name = 'users'`,
      [process.env.DB_NAME],
    );

    const hasUsersTable = Number(tables?.[0]?.total || 0) > 0;

    if (!hasUsersTable) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const schemaPath = path.resolve(__dirname, '../database/schema.sql');
      let schema = await fs.readFile(schemaPath, 'utf8');
      schema = schema.replace(/USE\s+food_ordering_and_delivery_app;/i, `USE ${process.env.DB_NAME};`);
      await adminPool.query(schema);
    }

    const appPool = mysql.createPool({
      ...baseConfig,
      database: process.env.DB_NAME,
    });

    await runMigrations(appPool);

    const [plaintextRows] = await appPool.query(
      `SELECT id, password FROM users WHERE password IS NOT NULL AND password NOT LIKE '$2%'`,
    );

    for (const row of plaintextRows) {
      const hashedPassword = await bcrypt.hash(String(row.password), 10);
      await appPool.query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, row.id]);
    }

    await appPool.end();
  } finally {
    await adminPool.end();
  }
}
