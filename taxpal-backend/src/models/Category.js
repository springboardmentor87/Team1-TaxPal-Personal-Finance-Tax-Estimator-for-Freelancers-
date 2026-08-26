const crypto = require('crypto');
const { query, run, get } = require('../config/db');

class Category {
  static format(row) {
    if (!row) return null;
    return {
      _id: row.id,
      id: row.id,
      userId: row.user_id,
      name: row.name,
      type: row.type,
      color: row.color || '#6366f1',
      icon: row.icon || 'tag',
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findForUser(userId) {
    const rows = await query(
      'SELECT * FROM categories WHERE user_id = ? OR is_default = 1 ORDER BY is_default DESC, name ASC',
      [userId]
    );
    return rows.map(Category.format);
  }

  static async findByType(userId, type) {
    const rows = await query(
      'SELECT * FROM categories WHERE (user_id = ? OR is_default = 1) AND type = ? ORDER BY is_default DESC, name ASC',
      [userId, type]
    );
    return rows.map(Category.format);
  }

  static async findById(id) {
    const row = await get('SELECT * FROM categories WHERE id = ?', [id]);
    return Category.format(row);
  }

  static async create(data) {
    const id = data.id || crypto.randomUUID();
    await run(
      `INSERT INTO categories (id, user_id, name, type, color, icon, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.userId || null,
        data.name,
        data.type,
        data.color || '#6366f1',
        data.icon || 'tag',
        data.isDefault ? 1 : 0,
      ]
    );
    return await Category.findById(id);
  }

  static async updateById(id, userId, data) {
    const existing = await get('SELECT * FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) return null;

    await run(
      `UPDATE categories SET
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        color = COALESCE(?, color),
        icon = COALESCE(?, icon),
        updated_at = datetime('now')
      WHERE id = ? AND user_id = ?`,
      [data.name || null, data.type || null, data.color || null, data.icon || null, id, userId]
    );

    return await Category.findById(id);
  }

  static async deleteById(id, userId) {
    const result = await run('DELETE FROM categories WHERE id = ? AND user_id = ? AND is_default = 0', [id, userId]);
    return result.changes > 0;
  }
}

module.exports = Category;
