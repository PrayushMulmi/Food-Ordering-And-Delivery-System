import { query } from "../config/db.js";

const normalizeCouponPayload = (data = {}) => ({
  restaurant_id: data.restaurant_id,
  code: String(data.code || '').trim().toUpperCase(),
  discount_type: data.discount_type || 'percentage',
  discount_value: Number(data.discount_value ?? data.discount_percentage ?? 0),
  max_discount_amount: data.max_discount_amount === '' || data.max_discount_amount == null ? null : Number(data.max_discount_amount),
  min_order_amount: Number(data.min_order_amount || 0),
  start_date: data.start_date || new Date().toISOString().slice(0, 10),
  end_date: data.end_date || data.expiry_date,
  usage_limit: data.usage_limit === '' || data.usage_limit == null ? null : Number(data.usage_limit),
  status: data.status || 'active',
});

export const CouponModel = {
  async listAll() {
    return query(
      `SELECT c.*, r.name AS restaurant_name
       FROM coupons c
       INNER JOIN restaurants r ON r.id = c.restaurant_id
       ORDER BY c.id DESC`,
    );
  },

  async listActiveByRestaurant(restaurantId) {
    return query(
      `SELECT * FROM coupons
       WHERE restaurant_id = ?
         AND status = 'active'
         AND CURDATE() BETWEEN start_date AND end_date
       ORDER BY end_date ASC, id DESC`,
      [restaurantId],
    );
  },

  async create(data) {
    const payload = normalizeCouponPayload(data);
    const result = await query(
      `INSERT INTO coupons
      (restaurant_id, code, discount_type, discount_value, max_discount_amount, min_order_amount, start_date, end_date, usage_limit, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.restaurant_id,
        payload.code,
        payload.discount_type,
        payload.discount_value,
        payload.max_discount_amount,
        payload.min_order_amount,
        payload.start_date,
        payload.end_date,
        payload.usage_limit,
        payload.status,
      ],
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(`SELECT * FROM coupons WHERE id = ? LIMIT 1`, [id]);
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
      [String(code || '').trim().toUpperCase(), restaurantId],
    );

    const coupon = rows[0];
    if (!coupon) return null;
    if (Number(orderAmount) < Number(coupon.min_order_amount)) return null;
    if (coupon.usage_limit !== null && Number(coupon.used_count) >= Number(coupon.usage_limit)) return null;

    return coupon;
  },

  async incrementUsage(id) {
    await query(`UPDATE coupons SET used_count = used_count + 1 WHERE id = ?`, [id]);
  },

  async listByRestaurant(restaurantId) {
    return query(
      `SELECT * FROM coupons WHERE restaurant_id = ? ORDER BY id DESC`,
      [restaurantId],
    );
  },

  async update(id, data) {
    const current = await this.findById(id);
    const payload = normalizeCouponPayload({ ...current, ...data });
    await query(
      `UPDATE coupons
       SET code = ?, discount_type = ?, discount_value = ?, max_discount_amount = ?, min_order_amount = ?, start_date = ?, end_date = ?, usage_limit = ?, status = ?
       WHERE id = ?`,
      [
        payload.code,
        payload.discount_type,
        payload.discount_value,
        payload.max_discount_amount,
        payload.min_order_amount,
        payload.start_date,
        payload.end_date,
        payload.usage_limit,
        payload.status,
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
