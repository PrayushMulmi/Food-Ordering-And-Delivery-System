import { query } from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { normalizeSavedLocationInput } from '../utils/location.js';

function normalizeRow(row) {
  return row ? {
    ...row,
    latitude: row.latitude == null ? null : Number(row.latitude),
    longitude: row.longitude == null ? null : Number(row.longitude),
  } : null;
}

export const SavedLocationModel = {
  async listByUser(userId) {
    const rows = await query(
      `SELECT * FROM user_saved_locations WHERE user_id = ? ORDER BY label ASC, id DESC`,
      [userId],
    );
    return rows.map(normalizeRow);
  },

  async findByIdForUser(id, userId) {
    const rows = await query(
      `SELECT * FROM user_saved_locations WHERE id = ? AND user_id = ? LIMIT 1`,
      [id, userId],
    );
    return normalizeRow(rows[0] || null);
  },

  async create(userId, data) {
    const normalized = normalizeSavedLocationInput(data);
    if (!normalized.label) throw new ApiError(400, 'Location name is required');
    if (!normalized.hasValidCoordinates) {
      throw new ApiError(400, 'Enter a valid Google Maps URL or coordinates in lat,lng format');
    }

    await query(
      `INSERT INTO user_saved_locations (user_id, label, location_input, google_maps_url, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        normalized.label,
        normalized.rawInput || null,
        normalized.googleMapsUrl,
        normalized.latitude,
        normalized.longitude,
      ],
    );

    const rows = await query(`SELECT * FROM user_saved_locations WHERE user_id = ? ORDER BY id DESC LIMIT 1`, [userId]);
    return normalizeRow(rows[0] || null);
  },

  async update(id, userId, data) {
    const existing = await this.findByIdForUser(id, userId);
    if (!existing) throw new ApiError(404, 'Saved location not found');

    const normalized = normalizeSavedLocationInput({
      label: data.label ?? existing.label,
      location_input: data.location_input ?? data.google_maps_url ?? data.coordinates ?? existing.location_input ?? existing.google_maps_url,
      latitude: data.latitude ?? existing.latitude,
      longitude: data.longitude ?? existing.longitude,
    });

    if (!normalized.label) throw new ApiError(400, 'Location name is required');
    if (!normalized.hasValidCoordinates) {
      throw new ApiError(400, 'Enter a valid Google Maps URL or coordinates in lat,lng format');
    }

    await query(
      `UPDATE user_saved_locations
       SET label = ?, location_input = ?, google_maps_url = ?, latitude = ?, longitude = ?
       WHERE id = ? AND user_id = ?`,
      [
        normalized.label,
        normalized.rawInput || null,
        normalized.googleMapsUrl,
        normalized.latitude,
        normalized.longitude,
        id,
        userId,
      ],
    );

    return this.findByIdForUser(id, userId);
  },

  async remove(id, userId) {
    const existing = await this.findByIdForUser(id, userId);
    if (!existing) throw new ApiError(404, 'Saved location not found');
    await query(`DELETE FROM user_saved_locations WHERE id = ? AND user_id = ?`, [id, userId]);
    return true;
  },
};
