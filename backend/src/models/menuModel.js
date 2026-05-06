import { query } from "../config/db.js";

const publicColumns = `
  id, restaurant_id, category, name, description, price,
  CASE WHEN image_blob IS NOT NULL THEN CONCAT('/api/menu/', id, '/image') ELSE image_url END AS image_url,
  is_available, created_at
`;

export const MenuModel = {
  async create(data) {
    const result = await query(
      `INSERT INTO menu_items
      (restaurant_id, category, name, description, price, image_url, image_blob, image_mime, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.restaurant_id,
        data.category || "General",
        data.name,
        data.description || null,
        data.price,
        data.image_blob ? null : (data.image_url || null),
        data.image_blob || null,
        data.image_mime || null,
        data.is_available ? 1 : 0,
      ],
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(`SELECT ${publicColumns} FROM menu_items WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async findRawById(id) {
    const rows = await query(`SELECT * FROM menu_items WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async listByRestaurant(restaurantId) {
    return query(
      `SELECT ${publicColumns} FROM menu_items WHERE restaurant_id = ? ORDER BY category, name`,
      [restaurantId],
    );
  },

  async update(id, data) {
    const hasImageBlob = Boolean(data.image_blob);
    await query(
      `UPDATE menu_items
       SET category = ?, name = ?, description = ?, price = ?, image_url = ?, image_blob = COALESCE(?, image_blob), image_mime = COALESCE(?, image_mime), is_available = ?
       WHERE id = ?`,
      [
        data.category || "General",
        data.name,
        data.description || null,
        data.price,
        hasImageBlob ? null : (data.image_url || null),
        data.image_blob || null,
        data.image_mime || null,
        data.is_available ? 1 : 0,
        id,
      ],
    );

    return this.findById(id);
  },

  async remove(id) {
    await query(`DELETE FROM menu_items WHERE id = ?`, [id]);
    return true;
  },
};
import { query } from "../config/db.js";

const publicColumns = `
  id, restaurant_id, category, name, description, price,
  CASE WHEN image_blob IS NOT NULL THEN CONCAT('/api/menu/', id, '/image') ELSE image_url END AS image_url,
  is_available, created_at
`;

export const MenuModel = {
  async create(data) {
    const result = await query(
      `INSERT INTO menu_items
      (restaurant_id, category, name, description, price, image_url, image_blob, image_mime, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.restaurant_id,
        data.category || "General",
        data.name,
        data.description || null,
        data.price,
        data.image_blob ? null : (data.image_url || null),
        data.image_blob || null,
        data.image_mime || null,
        data.is_available ? 1 : 0,
      ],
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(`SELECT ${publicColumns} FROM menu_items WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async findRawById(id) {
    const rows = await query(`SELECT * FROM menu_items WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async listByRestaurant(restaurantId) {
    return query(
      `SELECT ${publicColumns} FROM menu_items WHERE restaurant_id = ? ORDER BY category, name`,
      [restaurantId],
    );
  },

  async update(id, data) {
    const hasImageBlob = Boolean(data.image_blob);
    await query(
      `UPDATE menu_items
       SET category = ?, name = ?, description = ?, price = ?, image_url = ?, image_blob = COALESCE(?, image_blob), image_mime = COALESCE(?, image_mime), is_available = ?
       WHERE id = ?`,
      [
        data.category || "General",
        data.name,
        data.description || null,
        data.price,
        hasImageBlob ? null : (data.image_url || null),
        data.image_blob || null,
        data.image_mime || null,
        data.is_available ? 1 : 0,
        id,
      ],
    );

    return this.findById(id);
  },

  async remove(id) {
    await query(`DELETE FROM menu_items WHERE id = ?`, [id]);
    return true;
  },
};
