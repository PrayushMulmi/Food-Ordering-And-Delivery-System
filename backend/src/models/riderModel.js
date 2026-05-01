import { query } from "../config/db.js";
import { calculateDistanceMeters } from "../utils/location.js";

export const RiderModel = {
  async findAvailableRider() {
    const rows = await query(
      `SELECT u.id, u.full_name, u.email, rp.availability_status
       FROM users u
       INNER JOIN rider_profiles rp ON rp.user_id = u.id
       WHERE u.role = 'rider' AND u.status = 'active' AND rp.availability_status = 'available'
       ORDER BY rp.last_active_at DESC, u.id ASC
       LIMIT 1`
    );
    return rows[0] || null;
  },

  async assignOrder(orderId, riderUserId) {
    await query(`UPDATE orders SET assigned_rider_user_id = ? WHERE id = ?`, [riderUserId, orderId]);
    await query(
      `UPDATE rider_profiles SET availability_status = 'assigned', last_active_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [riderUserId],
    );
  },

  async releaseRider(riderUserId, coordinates = null) {
    if (!riderUserId) return;
    await query(
      `UPDATE rider_profiles
       SET availability_status = 'available',
           current_latitude = COALESCE(?, current_latitude),
           current_longitude = COALESCE(?, current_longitude),
           last_active_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [coordinates?.lat ?? null, coordinates?.lng ?? null, riderUserId],
    );
  },

  async createNotification(riderUserId, title, message, orderId = null) {
    await query(
      `INSERT INTO rider_notifications (rider_user_id, order_id, title, message)
       VALUES (?, ?, ?, ?)`,
      [riderUserId, orderId, title, message],
    );
  },

  async getDashboard(userId) {
    const [summary] = await query(
      `SELECT
        COUNT(*) AS total_orders,
        IFNULL(SUM(CASE WHEN status = 'Delivered' THEN delivery_fee ELSE 0 END), 0) AS total_earnings,
        IFNULL(SUM(CASE WHEN status = 'Delivered' AND DATE(created_at) = CURDATE() THEN delivery_fee ELSE 0 END), 0) AS daily_earnings,
        IFNULL(SUM(CASE WHEN status = 'Delivered' AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1) THEN delivery_fee ELSE 0 END), 0) AS weekly_earnings,
        IFNULL(SUM(CASE WHEN status = 'Delivered' AND YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE()) THEN delivery_fee ELSE 0 END), 0) AS monthly_earnings,
        SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) AS completed_orders,
        SUM(CASE WHEN status IN ('Preparing','Ready for Dispatch','Out for Delivery') THEN 1 ELSE 0 END) AS active_orders
       FROM orders
       WHERE assigned_rider_user_id = ?`,
      [userId],
    );

    const notifications = await query(
      `SELECT * FROM rider_notifications WHERE rider_user_id = ? ORDER BY id DESC LIMIT 10`,
      [userId],
    );

    const [profile] = await query(
      `SELECT rp.*, u.full_name, u.email, u.phone
       FROM rider_profiles rp
       INNER JOIN users u ON u.id = rp.user_id
       WHERE rp.user_id = ? LIMIT 1`,
      [userId],
    );

    return { summary, notifications, profile };
  },

  async listOrders(userId) {
    return query(
      `SELECT o.*, r.name AS restaurant_name, r.address AS restaurant_address, u.full_name AS customer_name
       FROM orders o
       INNER JOIN restaurants r ON r.id = o.restaurant_id
       INNER JOIN users u ON u.id = o.user_id
       WHERE o.assigned_rider_user_id = ?
       ORDER BY o.id DESC`,
      [userId],
    );
  },

  async getOrderDetail(orderId, userId) {
    const rows = await query(
      `SELECT o.*, r.name AS restaurant_name, r.address AS restaurant_address, r.restaurant_location_url,
              u.full_name AS customer_name, u.phone AS customer_phone,
              rp.current_latitude AS rider_current_latitude, rp.current_longitude AS rider_current_longitude,
              rp.availability_status AS rider_availability_status
       FROM orders o
       INNER JOIN restaurants r ON r.id = o.restaurant_id
       INNER JOIN users u ON u.id = o.user_id
       LEFT JOIN rider_profiles rp ON rp.user_id = o.assigned_rider_user_id
       WHERE o.id = ? AND o.assigned_rider_user_id = ?
       LIMIT 1`,
      [orderId, userId],
    );
    if (!rows[0]) return null;
    const items = await query(`SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC`, [orderId]);
    return { ...rows[0], items };
  },

  async updateLocation(userId, payload) {
    const latitude = Number(payload.latitude);
    const longitude = Number(payload.longitude);

    const [profile] = await query(
      `SELECT current_latitude, current_longitude FROM rider_profiles WHERE user_id = ? LIMIT 1`,
      [userId],
    );

    const previous = profile?.current_latitude != null && profile?.current_longitude != null
      ? { latitude: Number(profile.current_latitude), longitude: Number(profile.current_longitude) }
      : null;
    const next = { latitude, longitude };
    const distanceMeters = previous ? calculateDistanceMeters(previous, next) : null;
    const changed = !previous || distanceMeters > 0.5;

    if (!changed) {
      return { updated: false, latitude, longitude, distance_meters: 0, active_order_id: payload.activeOrderId || null };
    }

    await query(
      `UPDATE rider_profiles
       SET current_latitude = ?, current_longitude = ?, last_active_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [latitude, longitude, userId],
    );

    let activeOrder = null;
    if (payload.activeOrderId) {
      const rows = await query(
        `SELECT id FROM orders
         WHERE id = ? AND assigned_rider_user_id = ? AND status IN ('Preparing', 'Ready for Dispatch', 'Out for Delivery')
         LIMIT 1`,
        [payload.activeOrderId, userId],
      );
      activeOrder = rows[0] || null;
    }

    if (!activeOrder) {
      const rows = await query(
        `SELECT id FROM orders
         WHERE assigned_rider_user_id = ? AND status IN ('Preparing', 'Ready for Dispatch', 'Out for Delivery')
         ORDER BY id DESC LIMIT 1`,
        [userId],
      );
      activeOrder = rows[0] || null;
    }

    if (activeOrder?.id) {
      await query(
        `UPDATE orders
         SET rider_current_latitude = ?, rider_current_longitude = ?, rider_location_updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [latitude, longitude, activeOrder.id],
      );
    }

    return {
      updated: true,
      latitude,
      longitude,
      distance_meters: distanceMeters == null ? null : Number(distanceMeters.toFixed(2)),
      active_order_id: activeOrder?.id || null,
      accuracy_meters: payload.accuracyMeters == null ? null : Number(payload.accuracyMeters),
    };
  },

  async updateAvailability(userId, availabilityStatus) {
    await query(
      `UPDATE rider_profiles SET availability_status = ?, last_active_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [availabilityStatus, userId],
    );

    const rows = await query(`SELECT * FROM rider_profiles WHERE user_id = ? LIMIT 1`, [userId]);
    return rows[0] || null;
  },
};
