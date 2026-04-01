import { query } from "../config/db.js";

export const DashboardModel = {
  async restaurantDashboard(restaurantId) {
    const [summary] = await query(
      `SELECT
        COUNT(*) AS total_orders,
        SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) AS delivered_orders,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_orders,
        IFNULL(SUM(CASE WHEN status = 'Delivered' THEN final_total ELSE 0 END), 0) AS total_sales
       FROM orders
       WHERE restaurant_id = ?`,
      [restaurantId],
    );

    const topItems = await query(
      `SELECT item_name, SUM(quantity) AS total_quantity
       FROM order_items oi
       INNER JOIN orders o ON o.id = oi.order_id
       WHERE o.restaurant_id = ?
       GROUP BY item_name
       ORDER BY total_quantity DESC
       LIMIT 5`,
      [restaurantId],
    );

    const recentReviews = await query(
      `SELECT rating, comment, created_at
       FROM reviews
       WHERE restaurant_id = ?
       ORDER BY id DESC
       LIMIT 5`,
      [restaurantId],
    );

    return { summary, topItems, recentReviews };
  },

  async superAdminDashboard() {
    const [counts] = await query(
      `SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'customer') AS total_customers,
        (SELECT COUNT(*) FROM users WHERE role = 'restaurant_admin') AS total_restaurant_admins,
        (SELECT COUNT(*) FROM restaurants) AS total_restaurants,
        (SELECT COUNT(*) FROM orders) AS total_orders,
        (SELECT IFNULL(SUM(final_total), 0) FROM orders WHERE status = 'Delivered') AS delivered_revenue`,
    );

    const recentActions = await query(
      `SELECT aal.*, sa.full_name AS action_by_name
       FROM admin_action_logs aal
       LEFT JOIN users sa ON sa.id = aal.action_by_user_id
       ORDER BY aal.id DESC
       LIMIT 10`,
    );

    return { counts, recentActions };
  },
};
