import { query } from "../config/db.js";

const parseGallery = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value); } catch { return []; }
};

export const RestaurantModel = {
  normalize(row) {
    if (!row) return null;
    return { ...row, gallery_images: parseGallery(row.gallery_images) };
  },

  async create(data) {
    const result = await query(
      `INSERT INTO restaurants
      (owner_user_id, name, description, cuisine, address, contact_phone, image_url, cover_photo_url, gallery_images, price_level, is_open, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.owner_user_id,
        data.name,
        data.description || null,
        data.cuisine || null,
        data.address || null,
        data.contact_phone || null,
        data.image_url || null,
        data.cover_photo_url || null,
        JSON.stringify(data.gallery_images || []),
        data.price_level || "$$",
        data.is_open ? 1 : 0,
        data.status || "active",
      ],
    );
    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(`SELECT * FROM restaurants WHERE id = ? LIMIT 1`, [id]);
    return this.normalize(rows[0] || null);
  },

  async findByOwnerUserId(ownerUserId) {
    const rows = await query(`SELECT * FROM restaurants WHERE owner_user_id = ? LIMIT 1`, [ownerUserId]);
    return this.normalize(rows[0] || null);
  },

  async list(filters = {}) {
    let sql = `SELECT * FROM restaurants r WHERE r.status = 'active'`;
    const params = [];

    if (filters.search) {
      sql += ` AND (
        r.name LIKE ?
        OR r.cuisine LIKE ?
        OR r.address LIKE ?
        OR EXISTS (
          SELECT 1
          FROM menu_items mi
          WHERE mi.restaurant_id = r.id
            AND mi.is_available = 1
            AND (
              mi.name LIKE ?
              OR mi.description LIKE ?
              OR mi.category LIKE ?
            )
        )
      )`;
      const needle = `%${filters.search}%`;
      params.push(needle, needle, needle, needle, needle, needle);
    }
    if (filters.cuisine) { sql += ` AND r.cuisine = ?`; params.push(filters.cuisine); }
    if (filters.location) { sql += ` AND r.address = ?`; params.push(filters.location); }
    if (filters.price_level) { sql += ` AND r.price_level = ?`; params.push(filters.price_level); }
    if (filters.min_rating) { sql += ` AND r.rating_average >= ?`; params.push(Number(filters.min_rating)); }
    if (String(filters.open_now || '') === '1') { sql += ` AND r.is_open = 1`; }

    const sort = filters.sort || 'top_rated';
    if (sort === 'newest') sql += ` ORDER BY r.created_at DESC`;
    else if (sort === 'name') sql += ` ORDER BY r.name ASC`;
    else if (sort === 'fast_delivery') sql += ` ORDER BY r.is_open DESC, r.rating_average DESC, r.created_at ASC`;
    else if (sort === 'best_quality') sql += ` ORDER BY r.rating_average DESC, r.price_level DESC`;
    else sql += ` ORDER BY r.rating_average DESC, r.created_at DESC`;

    const rows = await query(sql, params);
    return rows.map((row) => this.normalize(row));
  },

  async update(id, data) {
    await query(
      `UPDATE restaurants
       SET name = ?, description = ?, cuisine = ?, address = ?, contact_phone = ?, image_url = ?, cover_photo_url = ?, gallery_images = ?, price_level = ?, is_open = ?
       WHERE id = ?`,
      [
        data.name,
        data.description || null,
        data.cuisine || null,
        data.address || null,
        data.contact_phone || null,
        data.image_url || null,
        data.cover_photo_url || null,
        JSON.stringify(data.gallery_images || []),
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
    const rows = await query(`SELECT * FROM restaurants ORDER BY id DESC`);
    return rows.map((row) => this.normalize(row));
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
        { value: 'fast_delivery', label: 'Fast Delivery' },
        { value: 'best_quality', label: 'Best Quality' },
        { value: 'newest', label: 'Newest' },
        { value: 'name', label: 'Name' },
      ],
    };
  },
};
