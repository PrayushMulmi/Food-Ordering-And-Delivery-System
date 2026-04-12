import { query } from "../config/db.js";

export const AdminActionLogModel = {
  async create(data) {
    const result = await query(
      `INSERT INTO admin_action_logs
      (action_by_user_id, target_type, target_id, action_type, reason)
      VALUES (?, ?, ?, ?, ?)`,
      [
        data.action_by_user_id,
        data.target_type,
        data.target_id,
        data.action_type,
        data.reason || null,
      ],
    );

    return result.insertId;
  },
};
