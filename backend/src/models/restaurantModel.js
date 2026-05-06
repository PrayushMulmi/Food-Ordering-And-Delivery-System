import { query } from "../config/db.js";
import { generateRestaurantCode } from "../utils/generateOrderCode.js";
import { normalizeCoordinate, parseCoordinatesFromMapUrl, parseCoordinatesFromText } from "../utils/location.js";

const parseGallery = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value); } catch { return []; }
};


function normalizeRestaurantLocation(data = {}) {
  const rawInput = String(data.restaurant_location_url || data.location_input || '').trim();
  const latitude = normalizeCoordinate(data.latitude ?? data.restaurant_latitude);
  const longitude = normalizeCoordinate(data.longitude ?? data.restaurant_longitude);
  const parsed = parseCoordinatesFromMapUrl(rawInput) || parseCoordinatesFromText(rawInput);
  return {
    restaurant_location_url: rawInput || null,
    latitude: latitude ?? parsed?.latitude ?? null,
    longitude: longitude ?? parsed?.longitude ?? null,
  };
}

const publicColumns = `
  id, restaurant_code, owner_user_id, name, description, cuisine, address, contact_phone,
  CASE WHEN image_blob IS NOT NULL THEN CONCAT('/api/restaurants/', restaurant_code, '/image/logo') ELSE image_url END AS image_url,
  CASE WHEN cover_photo_blob IS NOT NULL THEN CONCAT('/api/restaurants/', restaurant_code, '/image/cover') ELSE cover_photo_url END AS cover_photo_url,
  gallery_images, price_level, restaurant_location_url, latitude, longitude, region, rating_average, is_open, status, created_at
`;

const publicColumnsAliased = `
  r.id, r.restaurant_code, r.owner_user_id, r.name, r.description, r.cuisine, r.address, r.contact_phone,
  CASE WHEN r.image_blob IS NOT NULL THEN CONCAT('/api/restaurants/', r.restaurant_code, '/image/logo') ELSE r.image_url END AS image_url,
  CASE WHEN r.cover_photo_blob IS NOT NULL THEN CONCAT('/api/restaurants/', r.restaurant_code, '/image/cover') ELSE r.cover_photo_url END AS cover_photo_url,
  r.gallery_images, r.price_level, r.restaurant_location_url, r.latitude, r.longitude, r.region, r.rating_average, r.is_open, r.status, r.created_at
`;

export const RestaurantModel = {
  normalize(row) {
    if (!row) return null;
    return {
      ...row,
      gallery_images: parseGallery(row.gallery_images),
      latitude: row.latitude == null ? null : Number(row.latitude),
      longitude: row.longitude == null ? null : Number(row.longitude),
    };
  },

  async create(data) {
    const code = data.restaurant_code || generateRestaurantCode(data.name);
    const location = normalizeRestaurantLocation(data);
    const result = await query(
      `INSERT INTO restaurants
      (restaurant_code, owner_user_id, name, description, cuisine, address, contact_phone, image_url, cover_photo_url, gallery_images, price_level, is_open, status, restaurant_location_url, latitude, longitude, region)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
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
        location.restaurant_location_url,
        location.latitude,
        location.longitude,
        data.region || "Kathmandu",
      ],
    );
    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(`SELECT ${publicColumns} FROM restaurants WHERE id = ? LIMIT 1`, [id]);
    return this.normalize(rows[0] || null);
  },

  async findByPublicCode(code) {
    const rows = await query(`SELECT ${publicColumns} FROM restaurants WHERE restaurant_code = ? AND status = 'active' LIMIT 1`, [String(code || '').trim()]);
    return this.normalize(rows[0] || null);
  },

  async findRawByPublicCode(code) {
    const rows = await query(`SELECT * FROM restaurants WHERE restaurant_code = ? LIMIT 1`, [String(code || '').trim()]);
    return rows[0] || null;
  },

  async findByOwnerUserId(ownerUserId) {
    const rows = await query(`SELECT ${publicColumns} FROM restaurants WHERE owner_user_id = ? LIMIT 1`, [ownerUserId]);
    return this.normalize(rows[0] || null);
  },

  async list(filters = {}) {
    let sql = `SELECT ${publicColumnsAliased} FROM restaurants r WHERE r.status = 'active'`;
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
    const location = normalizeRestaurantLocation(data);
    await query(
      `UPDATE restaurants
       SET name = ?, description = ?, cuisine = ?, address = ?, contact_phone = ?, image_url = ?, cover_photo_url = ?, gallery_images = ?, price_level = ?, is_open = ?, restaurant_location_url = ?, latitude = ?, longitude = ?, region = ?
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
        location.restaurant_location_url,
        location.latitude,
        location.longitude,
        data.region || "Kathmandu",
        id,
      ],
    );
    return this.findById(id);
  },

  async updateImages(id, images = {}) {
    const fields = [];
    const params = [];
    if (images.logo) {
      fields.push('image_blob = ?', 'image_mime = ?', 'image_url = NULL');
      params.push(images.logo.buffer, images.logo.mime);
    }
    if (images.cover) {
      fields.push('cover_photo_blob = ?', 'cover_photo_mime = ?', 'cover_photo_url = NULL');
      params.push(images.cover.buffer, images.cover.mime);
    }
    if (!fields.length) return this.findById(id);
    params.push(id);
    await query(`UPDATE restaurants SET ${fields.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  },

  async getImageByCode(code, kind = 'logo') {
    const column = kind === 'cover' ? 'cover_photo_blob, cover_photo_mime' : 'image_blob, image_mime';
    const rows = await query(`SELECT ${column} FROM restaurants WHERE restaurant_code = ? LIMIT 1`, [code]);
    const row = rows[0];
    if (!row) return null;
    if (kind === 'cover') {
      return row.cover_photo_blob ? { buffer: row.cover_photo_blob, mime: row.cover_photo_mime || 'image/jpeg' } : null;
    }
    return row.image_blob ? { buffer: row.image_blob, mime: row.image_mime || 'image/jpeg' } : null;
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
    const rows = await query(`SELECT ${publicColumnsAliased} FROM restaurants r ORDER BY r.id DESC`);
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

  async recommendForUser(userId, limit = 8) {
    const rows = await query(
      `SELECT ${publicColumnsAliased},
              (IFNULL(user_restaurant.order_count, 0) * 6
               + IFNULL(user_restaurant.user_avg_rating, 0) * 3
               + IFNULL(cuisine_match.match_count, 0) * 2
               + IFNULL(popularity.total_orders, 0) * 0.35
               + IFNULL(r.rating_average, 0) * 1.5) AS recommendation_score,
              IFNULL(user_restaurant.order_count, 0) AS user_order_count,
              IFNULL(user_restaurant.user_avg_rating, 0) AS user_average_rating,
              IFNULL(popularity.total_orders, 0) AS platform_order_count
       FROM restaurants r
       LEFT JOIN (
         SELECT o.restaurant_id, COUNT(*) AS order_count, AVG(rv.rating) AS user_avg_rating
         FROM orders o
         LEFT JOIN reviews rv ON rv.order_id = o.id AND rv.user_id = o.user_id AND rv.restaurant_id = o.restaurant_id
         WHERE o.user_id = ?
         GROUP BY o.restaurant_id
       ) user_restaurant ON user_restaurant.restaurant_id = r.id
       LEFT JOIN (
         SELECT r2.cuisine, COUNT(*) AS match_count
         FROM orders o2
         INNER JOIN restaurants r2 ON r2.id = o2.restaurant_id
         WHERE o2.user_id = ? AND r2.cuisine IS NOT NULL
         GROUP BY r2.cuisine
       ) cuisine_match ON cuisine_match.cuisine = r.cuisine
       LEFT JOIN (
         SELECT restaurant_id, COUNT(*) AS total_orders
         FROM orders
         WHERE status <> 'Cancelled'
         GROUP BY restaurant_id
       ) popularity ON popularity.restaurant_id = r.id
       WHERE r.status = 'active'
       ORDER BY recommendation_score DESC, r.rating_average DESC, r.id ASC
       LIMIT ?`,
      [userId, userId, Number(limit)],
    );

    return rows.map((row) => this.normalize({
      ...row,
      recommendation_score: Number(row.recommendation_score || 0),
      recommendation_reason: Number(row.user_order_count || 0) > 0
        ? 'Based on your order history and ratings'
        : Number(row.platform_order_count || 0) > 0
          ? 'Popular with customers and highly rated'
          : 'Highly rated restaurant fallback',
    }));
  },
};
