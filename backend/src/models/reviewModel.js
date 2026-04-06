import { query } from "../config/db.js";
import ApiError from "../utils/ApiError.js";

export const ReviewModel = {
  async createForDeliveredOrder(userId, data) {
    const eligibleRows = await query(
      `SELECT oi.id AS order_item_id, o.id AS order_id, o.restaurant_id, oi.menu_item_id
       FROM orders o
       INNER JOIN order_items oi ON oi.order_id = o.id
       WHERE o.id = ?
       AND o.user_id = ?
       AND o.status = 'Delivered'
       AND oi.menu_item_id = ?
       LIMIT 1`,
      [data.order_id, userId, data.menu_item_id],
    );

    const eligible = eligibleRows[0];
    if (!eligible) {
      throw new ApiError(400, "Review allowed only for delivered ordered items");
    }

    const existing = await query(
      `SELECT id FROM reviews
       WHERE order_id = ? AND user_id = ? AND menu_item_id = ?
       LIMIT 1`,
      [data.order_id, userId, data.menu_item_id],
    );

    if (existing[0]) {
      throw new ApiError(400, "Review already submitted for this item in this order");
    }

    const result = await query(
      `INSERT INTO reviews
      (order_id, user_id, restaurant_id, menu_item_id, rating, comment)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.order_id,
        userId,
        eligible.restaurant_id,
        data.menu_item_id,
        data.rating,
        data.comment || null,
      ],
    );

    await this.refreshRestaurantRating(eligible.restaurant_id);
    return this.findById(result.insertId);
  },

  async refreshRestaurantRating(restaurantId) {
    await query(
      `UPDATE restaurants
       SET rating_average = (
         SELECT IFNULL(AVG(rating), 0) FROM reviews WHERE restaurant_id = ?
       )
       WHERE id = ?`,
      [restaurantId, restaurantId],
    );
  },

  async findById(id) {
    const rows = await query(
      `SELECT r.*, u.full_name AS customer_name, m.name AS menu_item_name, o.order_code, rs.name AS restaurant_name
       FROM reviews r
       INNER JOIN users u ON u.id = r.user_id
       INNER JOIN menu_items m ON m.id = r.menu_item_id
       INNER JOIN orders o ON o.id = r.order_id
       INNER JOIN restaurants rs ON rs.id = r.restaurant_id
       WHERE r.id = ?
       LIMIT 1`,
      [id],
    );
    return rows[0] || null;
  },

  async listByRestaurant(restaurantId) {
    return query(
      `SELECT r.*, u.full_name AS customer_name, m.name AS menu_item_name, o.order_code, rs.name AS restaurant_name
       FROM reviews r
       INNER JOIN users u ON u.id = r.user_id
       INNER JOIN menu_items m ON m.id = r.menu_item_id
       INNER JOIN orders o ON o.id = r.order_id
       INNER JOIN restaurants rs ON rs.id = r.restaurant_id
       WHERE r.restaurant_id = ?
       ORDER BY r.id DESC`,
      [restaurantId],
    );
  },

  async listByUser(userId) {
    return query(
      `SELECT r.*, m.name AS menu_item_name, rs.name AS restaurant_name, o.order_code
       FROM reviews r
       INNER JOIN menu_items m ON m.id = r.menu_item_id
       INNER JOIN restaurants rs ON rs.id = r.restaurant_id
       INNER JOIN orders o ON o.id = r.order_id
       WHERE r.user_id = ?
       ORDER BY r.id DESC`,
      [userId],
    );
  },

  async listReviewableItemsByUser(userId) {
    return query(
      `SELECT o.id AS order_id, o.order_code, o.created_at, rs.name AS restaurant_name,
              oi.menu_item_id, oi.item_name,
              EXISTS(
                SELECT 1 FROM reviews r
                WHERE r.order_id = o.id AND r.user_id = o.user_id AND r.menu_item_id = oi.menu_item_id
              ) AS already_reviewed
       FROM orders o
       INNER JOIN restaurants rs ON rs.id = o.restaurant_id
       INNER JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = ? AND o.status = 'Delivered'
       ORDER BY o.id DESC, oi.id ASC`,
      [userId],
    );
  },
};
