const crypto = require('crypto');
const { query, run, get } = require('../config/db');

class Transaction {
  static format(row) {
    if (!row) return null;
    const typeFormatted = row.type && row.type.toLowerCase() === 'income' ? 'Income' : 'Expense';
    return {
      _id: row.id,
      id: row.id,
      userId: row.user_id,
      type: typeFormatted,
      amount: Number(row.amount),
      category: row.category,
      customCategory: row.custom_category || null,
      description: row.description,
      transactionDate: row.transaction_date,
      notes: row.notes || '',
      receiptUrl: row.receipt_url || '',
      receiptFileId: row.receipt_file_id || '',
      isDeductible: Boolean(row.is_deductible !== 0),
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : row.tags || [],
      isRecurring: Boolean(row.is_recurring),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findById(id) {
    const row = await get('SELECT * FROM transactions WHERE id = ?', [id]);
    return Transaction.format(row);
  }

  static async findByUserId(userId, filters = {}) {
    let sql = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [userId];

    if (filters.type) {
      sql += ' AND LOWER(type) = LOWER(?)';
      params.push(filters.type);
    }
    if (filters.category) {
      sql += ' AND category = ?';
      params.push(filters.category);
    }
    if (filters.startDate) {
      sql += ' AND transaction_date >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      sql += ' AND transaction_date <= ?';
      params.push(filters.endDate);
    }
    if (filters.search) {
      sql += ' AND (description LIKE ? OR notes LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    sql += ' ORDER BY transaction_date DESC, created_at DESC';

    const rows = await query(sql, params);
    return rows.map(Transaction.format);
  }

  static async create(data) {
    const id = data.id || crypto.randomUUID();
    const tags = Array.isArray(data.tags) ? JSON.stringify(data.tags) : data.tags || '[]';
    const normalizedType = (data.type || 'expense').toLowerCase();

    await run(
      `INSERT INTO transactions (
        id, user_id, type, amount, category, custom_category, description,
        transaction_date, notes, receipt_url, receipt_file_id, is_deductible, tags, is_recurring
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.userId,
        normalizedType,
        data.amount,
        data.category,
        data.customCategory || null,
        data.description,
        data.transactionDate || new Date().toISOString(),
        data.notes || '',
        data.receiptUrl || '',
        data.receiptFileId || '',
        data.isDeductible === false ? 0 : 1,
        tags,
        data.isRecurring ? 1 : 0,
      ]
    );

    return await Transaction.findById(id);
  }

  static async updateById(id, userId, data) {
    const existing = await get('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) return null;

    const tags = data.tags !== undefined
      ? (Array.isArray(data.tags) ? JSON.stringify(data.tags) : data.tags)
      : existing.tags;
    const normalizedType = data.type ? data.type.toLowerCase() : null;

    await run(
      `UPDATE transactions SET
        type = COALESCE(?, type),
        amount = COALESCE(?, amount),
        category = COALESCE(?, category),
        custom_category = ?,
        description = COALESCE(?, description),
        transaction_date = COALESCE(?, transaction_date),
        notes = ?,
        receipt_url = ?,
        receipt_file_id = ?,
        is_deductible = COALESCE(?, is_deductible),
        tags = ?,
        is_recurring = COALESCE(?, is_recurring),
        updated_at = datetime('now')
      WHERE id = ? AND user_id = ?`,
      [
        normalizedType,
        data.amount !== undefined ? data.amount : null,
        data.category || null,
        data.customCategory !== undefined ? data.customCategory : existing.custom_category,
        data.description || null,
        data.transactionDate || null,
        data.notes !== undefined ? data.notes : existing.notes,
        data.receiptUrl !== undefined ? data.receiptUrl : existing.receipt_url,
        data.receiptFileId !== undefined ? data.receiptFileId : existing.receipt_file_id,
        data.isDeductible !== undefined ? (data.isDeductible ? 1 : 0) : null,
        tags,
        data.isRecurring !== undefined ? (data.isRecurring ? 1 : 0) : null,
        id,
        userId,
      ]
    );

    return await Transaction.findById(id);
  }

  static async deleteById(id, userId) {
    const result = await run('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
    return result.changes > 0;
  }
}

module.exports = Transaction;
