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

    const items = await query(
      `SELECT bi.id, bi.quantity, bi.unit_price, bi.total_price,
              mi.id AS menu_item_id, mi.name, mi.description, mi.category, mi.image_url,
              r.id AS restaurant_id, r.name AS restaurant_name
       FROM basket_items bi
       INNER JOIN menu_items mi ON mi.id = bi.menu_item_id
       INNER JOIN baskets b ON b.id = bi.basket_id
       INNER JOIN restaurants r ON r.id = b.restaurant_id
       WHERE bi.basket_id = ?`,
      [basket.id],
    );

    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.total_price),
      0,
    );

    return {
      ...basket,
      items,
      subtotal,
    };
  },

  async addItem(userId, menuItemId, quantity) {
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
        `SELECT * FROM menu_items WHERE id = ? AND is_available = 1 LIMIT 1`,
        [menuItemId],
      );
      const menuItem = menuRows[0];

      if (!menuItem) {
        throw new ApiError(404, "Menu item not found or unavailable");
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
        const newQty = Number(existingRows[0].quantity) + Number(quantity);
        const totalPrice = newQty * Number(menuItem.price);

        await connection.execute(
          `UPDATE basket_items SET quantity = ?, unit_price = ?, total_price = ? WHERE id = ?`,
          [newQty, menuItem.price, totalPrice, existingRows[0].id],
        );
      } else {
        const totalPrice = Number(quantity) * Number(menuItem.price);
        await connection.execute(
          `INSERT INTO basket_items (basket_id, menu_item_id, quantity, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?)`,
          [basket.id, menuItemId, quantity, menuItem.price, totalPrice],
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

    const totalPrice = Number(quantity) * Number(items[0].price);

    await query(
      `UPDATE basket_items SET quantity = ?, unit_price = ?, total_price = ? WHERE id = ?`,
      [quantity, items[0].price, totalPrice, basketItemId],
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
