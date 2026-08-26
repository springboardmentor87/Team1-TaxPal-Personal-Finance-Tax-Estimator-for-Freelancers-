const crypto = require('crypto');
const { query, run, get } = require('../config/db');

class Chat {
  static format(row) {
    if (!row) return null;
    return {
      _id: row.id,
      id: row.id,
      userId: row.user_id,
      title: row.title || 'Financial Assistant Chat',
      messages: typeof row.messages === 'string' ? JSON.parse(row.messages || '[]') : row.messages || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findByUserId(userId) {
    const rows = await query('SELECT * FROM chats WHERE user_id = ? ORDER BY updated_at DESC', [userId]);
    return rows.map(Chat.format);
  }

  static async findById(id, userId) {
    const row = await get('SELECT * FROM chats WHERE id = ? AND user_id = ?', [id, userId]);
    return Chat.format(row);
  }

  static async create(data) {
    const id = data.id || crypto.randomUUID();
    const messages = Array.isArray(data.messages) ? JSON.stringify(data.messages) : data.messages || '[]';

    await run(
      `INSERT INTO chats (id, user_id, title, messages)
       VALUES (?, ?, ?, ?)`,
      [id, data.userId, data.title || 'Financial Assistant Chat', messages]
    );

    return await Chat.findById(id, data.userId);
  }

  static async updateMessages(id, userId, messages) {
    const messagesJson = Array.isArray(messages) ? JSON.stringify(messages) : messages;
    await run(
      `UPDATE chats SET messages = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?`,
      [messagesJson, id, userId]
    );
    return await Chat.findById(id, userId);
  }

  static async deleteById(id, userId) {
    const result = await run('DELETE FROM chats WHERE id = ? AND user_id = ?', [id, userId]);
    return result.changes > 0;
  }
}

module.exports = Chat;
