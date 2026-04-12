import { query } from "../config/db.js";

export const CouponModel = {
  async create(data) {
    const result = await query(
      `INSERT INTO coupons
      (restaurant_id, code, discount_type, discount_value, min_order_amount, start_date, end_date, usage_limit, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        data.restaurant_id,
        data.code,
        data.discount_type,
        data.discount_value,
        data.min_order_amount || 0,
        data.start_date,
        data.end_date,
        data.usage_limit || null,
      ],
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(`SELECT * FROM coupons WHERE id = ? LIMIT 1`, [
      id,
    ]);
    return rows[0] || null;
  },

  async findValidCoupon(code, restaurantId, orderAmount) {
    const rows = await query(
      `SELECT * FROM coupons
       WHERE code = ?
       AND restaurant_id = ?
       AND status = 'active'
       AND CURDATE() BETWEEN start_date AND end_date
       LIMIT 1`,
      [code, restaurantId],
    );

    const coupon = rows[0];
    if (!coupon) return null;
    if (Number(orderAmount) < Number(coupon.min_order_amount)) return null;
    if (
      coupon.usage_limit !== null &&
      Number(coupon.used_count) >= Number(coupon.usage_limit)
    )
      return null;

    return coupon;
  },

  async incrementUsage(id) {
    await query(`UPDATE coupons SET used_count = used_count + 1 WHERE id = ?`, [
      id,
    ]);
  },

  async listByRestaurant(restaurantId) {
    return query(
      `SELECT * FROM coupons WHERE restaurant_id = ? ORDER BY id DESC`,
      [restaurantId],
    );
  },

  async update(id, data) {
    await query(
      `UPDATE coupons
       SET code = ?, discount_type = ?, discount_value = ?, min_order_amount = ?, start_date = ?, end_date = ?, usage_limit = ?, status = ?
       WHERE id = ?`,
      [
        data.code,
        data.discount_type,
        data.discount_value,
        data.min_order_amount || 0,
        data.start_date,
        data.end_date,
        data.usage_limit || null,
        data.status || "active",
        id,
      ],
    );

    return this.findById(id);
  },

  async remove(id) {
    await query(`DELETE FROM coupons WHERE id = ?`, [id]);
    return true;
  },
};
