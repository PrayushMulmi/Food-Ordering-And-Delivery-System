import bcrypt from "bcryptjs";
import { query } from "../config/db.js";

export const UserModel = {
  async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await query(
      `INSERT INTO users
      (full_name, email, password, phone, role, theme, food_preferences, status, force_password_change)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 0)`,
      [
        data.full_name,
        data.email,
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
    const rows = await query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [
      email,
    ]);
    return rows[0] || null;
  },

  async findById(id) {
    const rows = await query(
      `SELECT id, full_name, email, phone, role, theme, food_preferences, status, force_password_change, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [id],
    );
    return rows[0] || null;
  },

  async findAuthUserByEmail(email) {
    const rows = await query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [
      email,
    ]);
    return rows[0] || null;
  },

  async comparePassword(plain, hashed) {
    return bcrypt.compare(plain, hashed);
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
    return query(
      `SELECT id, full_name, email, phone, role, status, created_at
       FROM users
       ORDER BY id DESC`,
    );
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
