const crypto = require('crypto');
const { query, run, get } = require('../config/db');

class Alert {
  static format(row) {
    if (!row) return null;
    return {
      _id: row.id,
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      isRead: Boolean(row.is_read),
      readAt: row.read_at,
      severity: row.severity || 'info',
      actionUrl: row.action_url || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findByUserId(userId) {
    const rows = await query('SELECT * FROM alerts WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows.map(Alert.format);
  }

  static async findById(id, userId) {
    const row = await get('SELECT * FROM alerts WHERE id = ? AND user_id = ?', [id, userId]);
    return Alert.format(row);
  }

  static async create(data) {
    const id = data.id || crypto.randomUUID();
    await run(
      `INSERT INTO alerts (id, user_id, type, title, message, is_read, read_at, severity, action_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.userId,
        data.type,
        data.title,
        data.message,
        data.isRead ? 1 : 0,
        data.readAt || null,
        data.severity || 'info',
        data.actionUrl || '',
      ]
    );
    return await Alert.findById(id, data.userId);
  }

  static async markAsRead(id, userId) {
    await run(
      `UPDATE alerts SET is_read = 1, read_at = datetime('now'), updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    return await Alert.findById(id, userId);
  }

  static async markAllAsRead(userId) {
    await run(
      `UPDATE alerts SET is_read = 1, read_at = datetime('now'), updated_at = datetime('now')
       WHERE user_id = ? AND is_read = 0`,
      [userId]
    );
  }

  static async deleteById(id, userId) {
    const result = await run('DELETE FROM alerts WHERE id = ? AND user_id = ?', [id, userId]);
    return result.changes > 0;
  }
}

module.exports = Alert;
