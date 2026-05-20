import bcrypt from "bcryptjs";
import { query } from "../config/db.js";

const BCRYPT_PREFIX = "$2";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const normalizePhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "").slice(-10);
  return digits || null;
};
const normalizedPhoneSql = "RIGHT(REPLACE(REPLACE(REPLACE(IFNULL(phone, ''), ' ', ''), '-', ''), '+', ''), 10)";
const validatePhone = (phone) => phone == null || /^\d{10}$/.test(String(phone));
const normalizeTheme = (theme) => theme === "dark" ? "dark" : "light";
const normalizeId = (id) => {
  const numericId = Number(id);
  return Number.isInteger(numericId) && numericId > 0 ? numericId : null;
};
const invalidUserIdError = () => {
  const error = new Error("Invalid authenticated user");
  error.statusCode = 401;
  return error;
};

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
      (full_name, email, password, phone, role, theme, food_preferences, status, force_password_change, terms_accepted, terms_accepted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 0, ?, ?)`,
      [
        data.full_name,
        normalizeEmail(data.email),
        hashedPassword,
        normalizePhone(data.phone),
        data.role || "customer",
        normalizeTheme(data.theme),
        data.food_preferences ? JSON.stringify(data.food_preferences) : null,
        data.terms_accepted ? 1 : 0,
        data.terms_accepted_at || (data.terms_accepted ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null),
      ],
    );

    return this.findById(result.insertId);
  },

  async createWithHashedPassword(data) {
    const result = await query(
      `INSERT INTO users
      (full_name, email, password, phone, role, theme, food_preferences, status, force_password_change, terms_accepted, terms_accepted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 0, ?, ?)`,
      [
        data.full_name,
        normalizeEmail(data.email),
        data.password_hash,
        normalizePhone(data.phone),
        data.role || "customer",
        normalizeTheme(data.theme),
        data.food_preferences ? JSON.stringify(data.food_preferences) : null,
        data.terms_accepted ? 1 : 0,
        data.terms_accepted_at || (data.terms_accepted ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null),
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

  async findByPhone(phone) {
    const normalized = normalizePhone(phone);
    if (!normalized) return null;
    const rows = await query(
      `SELECT * FROM users WHERE ${normalizedPhoneSql} = ? LIMIT 1`,
      [normalized],
    );
    return rows[0] || null;
  },

  async findById(id) {
    const userId = normalizeId(id);
    if (!userId) return null;
    const rows = await query(
      `SELECT id, full_name, email, phone, role, theme, food_preferences, status, force_password_change, terms_accepted, terms_accepted_at, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [userId],
    );
    const user = this.normalize(rows[0] || null);
    if (!user) return null;

    const locations = await query(
      `SELECT id, label, location_input, google_maps_url, latitude, longitude, created_at, updated_at
       FROM user_saved_locations WHERE user_id = ? ORDER BY label ASC, id DESC`,
      [userId],
    );
    return {
      ...user,
      saved_locations: locations.map((row) => ({
        ...row,
        latitude: row.latitude == null ? null : Number(row.latitude),
        longitude: row.longitude == null ? null : Number(row.longitude),
      })),
    };
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

  async recordFailedLogin(userId, maxAttempts = 7, blockMinutes = 10) {
    const rows = await query(
      `SELECT failed_login_attempts, login_blocked_until FROM users WHERE id = ? LIMIT 1`,
      [userId],
    );
    const user = rows[0];
    if (!user) return { blocked: false, attempts: 0 };

    const blockedUntilTime = user.login_blocked_until ? new Date(user.login_blocked_until).getTime() : 0;
    if (blockedUntilTime && blockedUntilTime > Date.now()) {
      return { blocked: true, attempts: Number(user.failed_login_attempts || 0), blocked_until: user.login_blocked_until };
    }

    const nextAttempts = (blockedUntilTime && blockedUntilTime <= Date.now() ? 0 : Number(user.failed_login_attempts || 0)) + 1;
    const shouldBlock = nextAttempts >= maxAttempts;
    const blockedUntil = shouldBlock
      ? new Date(Date.now() + blockMinutes * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
      : null;

    await query(
      `UPDATE users SET failed_login_attempts = ?, login_blocked_until = ? WHERE id = ?`,
      [nextAttempts, blockedUntil, userId],
    );

    return { blocked: shouldBlock, attempts: nextAttempts, blocked_until: blockedUntil };
  },

  async resetLoginFailures(userId) {
    await query(
      `UPDATE users SET failed_login_attempts = 0, login_blocked_until = NULL WHERE id = ?`,
      [userId],
    );
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

  async updateProfile(userId, data = {}) {
    const normalizedUserId = normalizeId(userId);
    if (!normalizedUserId) throw invalidUserIdError();
    const current = await this.findById(normalizedUserId);
    if (!current) return null;

    const nextPhone = Object.prototype.hasOwnProperty.call(data, "phone")
      ? normalizePhone(data.phone)
      : current.phone;

    if (!validatePhone(nextPhone)) {
      const error = new Error("Mobile number must be exactly 10 digits");
      error.statusCode = 400;
      throw error;
    }

    const nextPreferences = Object.prototype.hasOwnProperty.call(data, "food_preferences")
      ? data.food_preferences
      : current.food_preferences;

    await query(
      `UPDATE users
       SET full_name = ?, phone = ?, theme = ?, food_preferences = ?
       WHERE id = ?`,
      [
        String(data.full_name ?? current.full_name ?? "").trim(),
        nextPhone,
        normalizeTheme(data.theme ?? current.theme),
        nextPreferences?.length ? JSON.stringify(nextPreferences) : null,
        normalizedUserId,
      ],
    );

    return this.findById(normalizedUserId);
  },

  async updateTheme(userId, theme) {
    const normalizedUserId = normalizeId(userId);
    if (!normalizedUserId) throw invalidUserIdError();
    await query(`UPDATE users SET theme = ? WHERE id = ?`, [normalizeTheme(theme), normalizedUserId]);
    return this.findById(normalizedUserId);
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
      `SELECT id, full_name, email, phone, role, theme, food_preferences, status, terms_accepted, terms_accepted_at, created_at
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
