import { query } from "../config/db.js";

export const RestaurantModel = {
  async create(data) {
    const result = await query(
      `INSERT INTO restaurants
      (name, description, cuisine, address, contact_phone, image_url, price_level, rating_average, is_open, status, owner_user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1, 'active', ?)`,
      [
        data.name,
        data.description || null,
        data.cuisine || null,
        data.address || null,
        data.contact_phone || null,
        data.image_url || null,
        data.price_level || "$$",
        data.owner_user_id,
      ],
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(`SELECT * FROM restaurants WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async findByOwnerUserId(ownerUserId) {
    const rows = await query(`SELECT * FROM restaurants WHERE owner_user_id = ? LIMIT 1`, [ownerUserId]);
    return rows[0] || null;
  },

  async list(filters = {}) {
    let sql = `SELECT * FROM restaurants WHERE status = 'active'`;
    const params = [];

    if (filters.search) {
      sql += ` AND (name LIKE ? OR cuisine LIKE ? OR address LIKE ? OR description LIKE ?)`;
      const term = `%${filters.search}%`;
      params.push(term, term, term, term);
    }

    if (filters.cuisine) {
      sql += ` AND cuisine = ?`;
      params.push(filters.cuisine);
    }

    if (filters.price_level) {
      sql += ` AND price_level = ?`;
      params.push(filters.price_level);
    }

    if (filters.location) {
      sql += ` AND address LIKE ?`;
      params.push(`%${filters.location}%`);
    }

    if (filters.is_open !== undefined && filters.is_open !== '') {
      sql += ` AND is_open = ?`;
      params.push(Number(filters.is_open) ? 1 : 0);
    }

    const sort = filters.sort || 'top_rated';
    if (sort === 'newest') sql += ` ORDER BY created_at DESC`;
    else if (sort === 'name') sql += ` ORDER BY name ASC`;
    else sql += ` ORDER BY rating_average DESC, created_at DESC`;

    return query(sql, params);
  },

  async update(id, data) {
    await query(
      `UPDATE restaurants
       SET name = ?, description = ?, cuisine = ?, address = ?, contact_phone = ?, image_url = ?, price_level = ?, is_open = ?
       WHERE id = ?`,
      [
        data.name,
        data.description || null,
        data.cuisine || null,
        data.address || null,
        data.contact_phone || null,
        data.image_url || null,
        data.price_level || "$$",
        data.is_open ? 1 : 0,
        id,
      ],
    );

    return this.findById(id);
  },

  async updateStatus(id, status) {
    await query(`UPDATE restaurants SET status = ? WHERE id = ?`, [status, id]);
    return this.findById(id);
  },

  async permanentDelete(id) {
    await query(`DELETE FROM restaurants WHERE id = ?`, [id]);
    return true;
  },

  async listAllForSuperAdmin() {
    return query(`SELECT * FROM restaurants ORDER BY id DESC`);
  },

  async listFilterOptions() {
    const cuisines = await query(`SELECT DISTINCT cuisine FROM restaurants WHERE status = 'active' AND cuisine IS NOT NULL AND cuisine <> '' ORDER BY cuisine ASC`);
    const locations = await query(`SELECT DISTINCT address FROM restaurants WHERE status = 'active' AND address IS NOT NULL AND address <> '' ORDER BY address ASC`);
    return {
      cuisines: cuisines.map((row) => row.cuisine),
      locations: locations.map((row) => row.address),
      price_levels: ['$', '$$', '$$$'],
      sorts: [
        { value: 'top_rated', label: 'Top Rated' },
        { value: 'newest', label: 'Newest' },
        { value: 'name', label: 'Name' },
      ],
    };
  },
};
