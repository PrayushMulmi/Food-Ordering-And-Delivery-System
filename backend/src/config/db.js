import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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

export async function initializeDatabase() {
  const adminPool = mysql.createPool(baseConfig);
  await adminPool.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const schemaPath = path.resolve(__dirname, '../database/schema.sql');
  let schema = await fs.readFile(schemaPath, 'utf8');
  schema = schema.replace(/USE\s+food_ordering_and_delivery_app;/i, `USE ${process.env.DB_NAME};`);
  await adminPool.query(schema);
  await adminPool.end();
}
