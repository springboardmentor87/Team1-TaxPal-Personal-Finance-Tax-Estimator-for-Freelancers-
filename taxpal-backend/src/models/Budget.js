const crypto = require('crypto');
const { query, run, get } = require('../config/db');

class Budget {
  static format(row) {
    if (!row) return null;
    return {
      _id: row.id,
      id: row.id,
      userId: row.user_id,
      category: row.category,
      limit: Number(row.limit_amount),
      limitAmount: Number(row.limit_amount),
      month: row.month,
      description: row.description || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findByUserIdAndMonth(userId, month) {
    const rows = await query('SELECT * FROM budgets WHERE user_id = ? AND month = ?', [userId, month]);
    return rows.map(Budget.format);
  }

  static async findByUserId(userId) {
    const rows = await query('SELECT * FROM budgets WHERE user_id = ? ORDER BY month DESC', [userId]);
    return rows.map(Budget.format);
  }

  static async upsert(userId, category, limitAmount, month, description = '') {
    const existing = await get(
      'SELECT * FROM budgets WHERE user_id = ? AND category = ? AND month = ?',
      [userId, category, month]
    );

    if (existing) {
      await run(
        `UPDATE budgets SET
          limit_amount = ?,
          description = ?,
          updated_at = datetime('now')
        WHERE id = ?`,
        [limitAmount, description, existing.id]
      );
      return await Budget.format(await get('SELECT * FROM budgets WHERE id = ?', [existing.id]));
    }

    const id = crypto.randomUUID();
    await run(
      `INSERT INTO budgets (id, user_id, category, limit_amount, month, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, userId, category, limitAmount, month, description]
    );

    return await Budget.format(await get('SELECT * FROM budgets WHERE id = ?', [id]));
  }

  static async deleteByCategory(userId, category, month) {
    let sql = 'DELETE FROM budgets WHERE user_id = ? AND category = ?';
    const params = [userId, category];
    if (month) {
      sql += ' AND month = ?';
      params.push(month);
    }
    const result = await run(sql, params);
    return result.changes > 0;
  }
}

module.exports = Budget;
