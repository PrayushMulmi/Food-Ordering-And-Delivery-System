import { query, pool } from "../config/db.js";
import ApiError from "../utils/ApiError.js";

export const BasketModel = {
  async getOrCreateBasket(userId) {
    const existing = await query(
      `SELECT * FROM baskets WHERE user_id = ? LIMIT 1`,
      [userId],
    );

    if (existing[0]) return existing[0];

    const result = await query(
      `INSERT INTO baskets (user_id, restaurant_id) VALUES (?, NULL)`,
      [userId],
    );
    const basket = await query(`SELECT * FROM baskets WHERE id = ?`, [
      result.insertId,
    ]);
    return basket[0];
  },

  async getDetailedBasket(userId) {
    const basket = await this.getOrCreateBasket(userId);

    const restaurantRows = basket.restaurant_id
      ? await query(
          `SELECT id, name FROM restaurants WHERE id = ? LIMIT 1`,
          [basket.restaurant_id],
        )
      : [];
    const restaurant = restaurantRows[0] || null;

    const items = await query(
      `SELECT bi.id, bi.quantity, bi.unit_price, bi.total_price,
              mi.id AS menu_item_id, mi.name, mi.description, mi.category, mi.image_url,
              mi.restaurant_id AS restaurant_id, r.name AS restaurant_name
       FROM basket_items bi
       INNER JOIN menu_items mi ON mi.id = bi.menu_item_id
       INNER JOIN restaurants r ON r.id = mi.restaurant_id
       WHERE bi.basket_id = ?
       ORDER BY bi.id ASC`,
      [basket.id],
    );

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.total_price),
      0,
    );

    const firstItemRestaurant = items.find((item) => item.restaurant_name);

    return {
      ...basket,
      restaurant_name: restaurant?.name || firstItemRestaurant?.restaurant_name || null,
      items,
      subtotal,
    };
  },

  async addItem(userId, menuItemId, quantity) {
    const normalizedQuantity = Number(quantity);
    if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1 || normalizedQuantity > 99) {
      throw new ApiError(400, "Quantity must be between 1 and 99");
    }
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [basketRows] = await connection.execute(
        `SELECT * FROM baskets WHERE user_id = ? LIMIT 1`,
        [userId],
      );
      let basket = basketRows[0];

      if (!basket) {
        const [created] = await connection.execute(
          `INSERT INTO baskets (user_id, restaurant_id) VALUES (?, NULL)`,
          [userId],
        );
        const [newBasketRows] = await connection.execute(
          `SELECT * FROM baskets WHERE id = ?`,
          [created.insertId],
        );
        basket = newBasketRows[0];
      }

      const [menuRows] = await connection.execute(
        `SELECT mi.*, r.is_open AS restaurant_is_open, r.status AS restaurant_status
         FROM menu_items mi
         INNER JOIN restaurants r ON r.id = mi.restaurant_id
         WHERE mi.id = ? AND mi.is_available = 1 AND r.status = 'active'
         LIMIT 1`,
        [menuItemId],
      );
      const menuItem = menuRows[0];

      if (!menuItem) {
        throw new ApiError(404, "Menu item not found or unavailable");
      }

      if (Number(menuItem.restaurant_is_open) !== 1) {
        throw new ApiError(400, "This restaurant is currently closed");
      }

      if (
        basket.restaurant_id &&
        Number(basket.restaurant_id) !== Number(menuItem.restaurant_id)
      ) {
        throw new ApiError(
          400,
          "Basket can contain items from only one restaurant",
        );
      }

      if (!basket.restaurant_id) {
        await connection.execute(
          `UPDATE baskets SET restaurant_id = ? WHERE id = ?`,
          [menuItem.restaurant_id, basket.id],
        );
      }

      const [existingRows] = await connection.execute(
        `SELECT * FROM basket_items WHERE basket_id = ? AND menu_item_id = ? LIMIT 1`,
        [basket.id, menuItemId],
      );

      if (existingRows[0]) {
        const newQty = Number(existingRows[0].quantity) + normalizedQuantity;
        if (newQty > 99) throw new ApiError(400, "Quantity cannot exceed 99");
        const totalPrice = newQty * Number(menuItem.price);

        await connection.execute(
          `UPDATE basket_items SET quantity = ?, unit_price = ?, total_price = ? WHERE id = ?`,
          [newQty, menuItem.price, totalPrice, existingRows[0].id],
        );
      } else {
        const totalPrice = normalizedQuantity * Number(menuItem.price);
        await connection.execute(
          `INSERT INTO basket_items (basket_id, menu_item_id, quantity, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?)`,
          [basket.id, menuItemId, normalizedQuantity, menuItem.price, totalPrice],
        );
      }

      await connection.commit();
      return this.getDetailedBasket(userId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async updateItemQuantity(userId, basketItemId, quantity) {
    const normalizedQuantity = Number(quantity);
    if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1 || normalizedQuantity > 99) {
      throw new ApiError(400, "Quantity must be between 1 and 99");
    }
    const basket = await this.getOrCreateBasket(userId);

    const items = await query(
      `SELECT bi.*, mi.price
       FROM basket_items bi
       INNER JOIN menu_items mi ON mi.id = bi.menu_item_id
       WHERE bi.id = ? AND bi.basket_id = ? LIMIT 1`,
      [basketItemId, basket.id],
    );

    if (!items[0]) {
      throw new ApiError(404, "Basket item not found");
    }

    const totalPrice = normalizedQuantity * Number(items[0].price);

    await query(
      `UPDATE basket_items SET quantity = ?, unit_price = ?, total_price = ? WHERE id = ?`,
      [normalizedQuantity, items[0].price, totalPrice, basketItemId],
    );

    return this.getDetailedBasket(userId);
  },

  async removeItem(userId, basketItemId) {
    const basket = await this.getOrCreateBasket(userId);
    await query(`DELETE FROM basket_items WHERE id = ? AND basket_id = ?`, [
      basketItemId,
      basket.id,
    ]);

    const remaining = await query(
      `SELECT COUNT(*) AS total FROM basket_items WHERE basket_id = ?`,
      [basket.id],
    );
    if (Number(remaining[0].total) === 0) {
      await query(`UPDATE baskets SET restaurant_id = NULL WHERE id = ?`, [
        basket.id,
      ]);
    }

    return this.getDetailedBasket(userId);
  },

  async clearBasket(userId) {
    const basket = await this.getOrCreateBasket(userId);
    await query(`DELETE FROM basket_items WHERE basket_id = ?`, [basket.id]);
    await query(`UPDATE baskets SET restaurant_id = NULL WHERE id = ?`, [
      basket.id,
    ]);
    return true;
  },
};
