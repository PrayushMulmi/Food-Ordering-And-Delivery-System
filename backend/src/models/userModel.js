import bcrypt from "bcryptjs";
import { query } from "../config/db.js";

const BCRYPT_PREFIX = "$2";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const parsePreferences = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const UserModel = {
  normalize(row) {
    if (!row) return null;
    return {
      ...row,
      food_preferences: parsePreferences(row.food_preferences),
    };
  },

  async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await query(
      `INSERT INTO users
      (full_name, email, password, phone, role, theme, food_preferences, status, force_password_change)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 0)`,
      [
        data.full_name,
        normalizeEmail(data.email),
        hashedPassword,
        data.phone || null,
        data.role || "customer",
        data.theme || "light",
        data.food_preferences ? JSON.stringify(data.food_preferences) : null,
      ],
    );

    return this.findById(result.insertId);
  },

  async findByEmail(email) {
    const rows = await query(`SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1`, [
      normalizeEmail(email),
    ]);
    return rows[0] || null;
  },

  async findById(id) {
    const rows = await query(
      `SELECT id, full_name, email, phone, role, theme, food_preferences, status, force_password_change, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [id],
    );
    return this.normalize(rows[0] || null);
  },

  async findAuthUserByEmail(email) {
    const rows = await query(`SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1`, [
      normalizeEmail(email),
    ]);
    return rows[0] || null;
  },

  async comparePassword(plain, hashed) {
    if (!hashed || !String(hashed).startsWith(BCRYPT_PREFIX)) return false;
    return bcrypt.compare(String(plain || ''), hashed);
  },

  async migratePlaintextPasswords() {
    const rows = await query(
      `SELECT id, password FROM users WHERE password IS NOT NULL AND password NOT LIKE '$2%'`,
    );

    for (const row of rows) {
      const hashedPassword = await bcrypt.hash(String(row.password), 10);
      await query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, row.id]);
    }

    return rows.length;
  },

  async updateProfile(userId, data) {
    await query(
      `UPDATE users
       SET full_name = ?, phone = ?, theme = ?, food_preferences = ?
       WHERE id = ?`,
      [
        data.full_name,
        data.phone || null,
        data.theme || "light",
        data.food_preferences ? JSON.stringify(data.food_preferences) : null,
        userId,
      ],
    );

    return this.findById(userId);
  },

  async updatePassword(userId, password, forcePasswordChange = false) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await query(
      `UPDATE users SET password = ?, force_password_change = ? WHERE id = ?`,
      [hashedPassword, forcePasswordChange ? 1 : 0, userId],
    );
    return true;
  },

  async listAll() {
    const rows = await query(
      `SELECT id, full_name, email, phone, role, theme, food_preferences, status, created_at
       FROM users
       ORDER BY id DESC`,
    );
    return rows.map((row) => this.normalize(row));
  },

  async updateStatus(id, status) {
    await query(`UPDATE users SET status = ? WHERE id = ?`, [status, id]);
    return this.findById(id);
  },

  async permanentDelete(id) {
    await query(`DELETE FROM users WHERE id = ?`, [id]);
    return true;
  },
};
