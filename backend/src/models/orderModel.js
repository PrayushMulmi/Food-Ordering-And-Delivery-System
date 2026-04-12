import { query, pool } from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { CouponModel } from "./couponModel.js";
import { BasketModel } from "./basketModel.js";
import { generateOrderCode } from "../utils/generateOrderCode.js";
import { ORDER_FLOW, ORDER_STATUS } from "../constants/orderStatus.js";
import { DELIVERY_FEE } from "../constants/pricing.js";

const roundMoney = (value) => Number(Number(value || 0).toFixed(2));

const formatCouponLabel = (coupon) => {
  if (!coupon) return null;
  if (coupon.discount_type === "percentage") {
    return `${Number(coupon.discount_value)}% off`;
  }
  return `Rs. ${roundMoney(coupon.discount_value).toFixed(2)} off`;
};

export const OrderModel = {
  async buildPricingPreview(userId, data = {}) {
    const basket = await BasketModel.getDetailedBasket(userId);

    if (!basket.items.length) {
      throw new ApiError(400, "Basket is empty");
    }

    const subtotal = roundMoney(basket.subtotal);
    let discountAmount = 0;
    let coupon = null;

    const couponCode = String(data.coupon_code || "").trim();
    if (couponCode) {
      coupon = await CouponModel.findValidCoupon(
        couponCode,
        basket.restaurant_id,
        subtotal,
      );

      if (!coupon) {
        throw new ApiError(400, "Invalid or expired coupon");
      }

      if (coupon.discount_type === "percentage") {
        discountAmount = (subtotal * Number(coupon.discount_value)) / 100;
      } else {
        discountAmount = Number(coupon.discount_value);
      }

      if (discountAmount > subtotal) discountAmount = subtotal;
    }

    const deliveryFee = DELIVERY_FEE;
    const finalTotal = subtotal - discountAmount + deliveryFee;

    return {
      basket,
      subtotal,
      discount_amount: roundMoney(discountAmount),
      delivery_fee: deliveryFee,
      final_total: roundMoney(finalTotal),
      coupon: coupon ? {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
        label: formatCouponLabel(coupon),
      } : null,
    };
  },

  async previewOrder(userId, data = {}) {
    const pricing = await this.buildPricingPreview(userId, data);
    return {
      subtotal: pricing.subtotal,
      discount_amount: pricing.discount_amount,
      delivery_fee: pricing.delivery_fee,
      final_total: pricing.final_total,
      coupon: pricing.coupon,
    };
  },

  async placeOrder(userId, data) {
    const pricing = await this.buildPricingPreview(userId, data);
    const basket = pricing.basket;
    const orderCode = generateOrderCode();

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `INSERT INTO orders
        (order_code, user_id, restaurant_id, basket_id, coupon_id, subtotal, discount_amount, delivery_fee, final_total, delivery_address, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderCode,
          userId,
          basket.restaurant_id,
          basket.id,
          pricing.coupon?.id || null,
          pricing.subtotal,
          pricing.discount_amount,
          pricing.delivery_fee,
          pricing.final_total,
          data.delivery_address,
          data.notes || null,
          ORDER_STATUS.PENDING,
        ],
      );

      const orderId = result.insertId;

      for (const item of basket.items) {
        await connection.execute(
          `INSERT INTO order_items
          (order_id, menu_item_id, item_name, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.menu_item_id,
            item.name,
            item.quantity,
            item.unit_price,
            item.total_price,
          ],
        );
      }

      await connection.execute(
        `INSERT INTO order_status_logs (order_id, status, changed_by_user_id, note)
         VALUES (?, ?, ?, ?)`,
        [orderId, ORDER_STATUS.PENDING, userId, "Order placed by customer"],
      );

      if (pricing.coupon?.id) {
        await connection.execute(
          `UPDATE coupons SET used_count = used_count + 1 WHERE id = ?`,
          [pricing.coupon.id],
        );
      }

      await connection.execute(`DELETE FROM basket_items WHERE basket_id = ?`, [
        basket.id,
      ]);
      await connection.execute(
        `UPDATE baskets SET restaurant_id = NULL WHERE id = ?`,
        [basket.id],
      );

      await connection.commit();
      return this.findById(orderId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async findById(orderId) {
    const orders = await query(
      `SELECT o.*, r.name AS restaurant_name, r.address AS restaurant_address, u.full_name AS customer_name, c.code AS coupon_code
       FROM orders o
       INNER JOIN restaurants r ON r.id = o.restaurant_id
       INNER JOIN users u ON u.id = o.user_id
       LEFT JOIN coupons c ON c.id = o.coupon_id
       WHERE o.id = ?
       LIMIT 1`,
      [orderId],
    );

    if (!orders[0]) return null;

    const items = await query(
      `SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC`,
      [orderId],
    );

    const statusHistory = await query(
      `SELECT osl.*, u.full_name AS changed_by_name
       FROM order_status_logs osl
       LEFT JOIN users u ON u.id = osl.changed_by_user_id
       WHERE osl.order_id = ?
       ORDER BY osl.created_at ASC`,
      [orderId],
    );

    return { ...orders[0], items, statusHistory };
  },

  async listByUser(userId) {
    return query(
      `SELECT o.*, r.name AS restaurant_name
       FROM orders o
       INNER JOIN restaurants r ON r.id = o.restaurant_id
       WHERE o.user_id = ?
       ORDER BY o.id DESC`,
      [userId],
    );
  },

  async listByRestaurant(restaurantId) {
    return query(
      `SELECT o.*, u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
       FROM orders o
       INNER JOIN users u ON u.id = o.user_id
       WHERE o.restaurant_id = ?
       ORDER BY o.id DESC`,
      [restaurantId],
    );
  },

  async findByRestaurantOrderId(orderId, restaurantId) {
    const order = await this.findById(orderId);
    if (!order || Number(order.restaurant_id) !== Number(restaurantId)) return null;
    return order;
  },

  async cancelOrderByUser(orderId, userId) {
    const order = await query(
      `SELECT * FROM orders WHERE id = ? AND user_id = ? LIMIT 1`,
      [orderId, userId],
    );

    if (!order[0]) {
      throw new ApiError(404, "Order not found");
    }

    const currentStatus = order[0].status;
    const blockedStatuses = [
      ORDER_STATUS.READY_FOR_DISPATCH,
      ORDER_STATUS.OUT_FOR_DELIVERY,
      ORDER_STATUS.DELIVERED,
      ORDER_STATUS.CANCELLED,
      ORDER_STATUS.REFUNDED,
    ];

    if (blockedStatuses.includes(currentStatus)) {
      throw new ApiError(400, "Order can no longer be cancelled");
    }

    await query(`UPDATE orders SET status = ? WHERE id = ?`, [
      ORDER_STATUS.CANCELLED,
      orderId,
    ]);
    await query(
      `INSERT INTO order_status_logs (order_id, status, changed_by_user_id, note)
       VALUES (?, ?, ?, ?)`,
      [orderId, ORDER_STATUS.CANCELLED, userId, "Cancelled by customer"],
    );

    return this.findById(orderId);
  },

  async updateStatusByRestaurant(
    orderId,
    restaurantId,
    newStatus,
    changedByUserId,
  ) {
    const order = await query(
      `SELECT * FROM orders WHERE id = ? AND restaurant_id = ? LIMIT 1`,
      [orderId, restaurantId],
    );

    if (!order[0]) {
      throw new ApiError(404, "Order not found");
    }

    const currentStatus = order[0].status;

    if (
      currentStatus === ORDER_STATUS.CANCELLED ||
      currentStatus === ORDER_STATUS.REFUNDED ||
      currentStatus === ORDER_STATUS.DELIVERED
    ) {
      throw new ApiError(400, "Order status can no longer be changed");
    }

    if (
      ![...ORDER_FLOW, ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED].includes(
        newStatus,
      )
    ) {
      throw new ApiError(400, "Invalid order status");
    }

    await query(`UPDATE orders SET status = ? WHERE id = ?`, [
      newStatus,
      orderId,
    ]);
    await query(
      `INSERT INTO order_status_logs (order_id, status, changed_by_user_id, note)
       VALUES (?, ?, ?, ?)`,
      [orderId, newStatus, changedByUserId, "Updated by restaurant admin"],
    );

    return this.findById(orderId);
  },
};
