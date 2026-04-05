import { query } from "../config/db.js";

export const MenuModel = {
  async create(data) {
    const result = await query(
      `INSERT INTO menu_items
      (restaurant_id, category, name, description, price, image_url, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.restaurant_id,
        data.category || "General",
        data.name,
        data.description || null,
        data.price,
        data.image_url || null,
        data.is_available ? 1 : 0,
      ],
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(`SELECT * FROM menu_items WHERE id = ? LIMIT 1`, [
      id,
    ]);
    return rows[0] || null;
  },

  async listByRestaurant(restaurantId) {
    return query(
      `SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY category, name`,
      [restaurantId],
    );
  },

  async update(id, data) {
    await query(
      `UPDATE menu_items
       SET category = ?, name = ?, description = ?, price = ?, image_url = ?, is_available = ?
       WHERE id = ?`,
      [
        data.category || "General",
        data.name,
        data.description || null,
        data.price,
        data.image_url || null,
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
