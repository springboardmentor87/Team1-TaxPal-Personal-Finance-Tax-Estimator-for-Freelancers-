const crypto = require('crypto');
const { query, run, get } = require('../config/db');

class Report {
  static format(row) {
    if (!row) return null;
    const dataObj = typeof row.data === 'string' ? JSON.parse(row.data || '{}') : row.data || {};
    const totalIncome = dataObj.totalIncome !== undefined
      ? Number(dataObj.totalIncome)
      : (dataObj.incomeCategoryBreakdown ? dataObj.incomeCategoryBreakdown.reduce((sum, item) => sum + Number(item.amount || 0), 0) : 0);
    const totalExpenses = dataObj.totalExpenses !== undefined
      ? Number(dataObj.totalExpenses)
      : (dataObj.categoryBreakdown ? dataObj.categoryBreakdown.reduce((sum, item) => sum + Number(item.amount || 0), 0) : 0);
    const netSavings = dataObj.netSavings !== undefined ? Number(dataObj.netSavings) : totalIncome - totalExpenses;

    return {
      _id: row.id,
      id: row.id,
      userId: row.user_id,
      reportType: row.type || row.title,
      type: row.type,
      title: row.title,
      period: row.period || '',
      periodStart: dataObj.periodStart || row.created_at,
      periodEnd: dataObj.periodEnd || row.created_at,
      totalIncome,
      totalExpenses,
      netSavings,
      generatedAt: row.generated_at,
      format: (row.format || 'PDF').toUpperCase(),
      data: dataObj,
      summary: row.summary || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findByUserId(userId) {
    const rows = await query('SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows.map(Report.format);
  }

  static async findById(id, userId) {
    const row = await get('SELECT * FROM reports WHERE id = ? AND user_id = ?', [id, userId]);
    return Report.format(row);
  }

  static async create(data) {
    const id = data.id || crypto.randomUUID();
    const dataJson = typeof data.data === 'object' ? JSON.stringify(data.data) : data.data || '{}';

    await run(
      `INSERT INTO reports (id, user_id, type, title, period, generated_at, format, data, summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.userId,
        data.type,
        data.title,
        data.period || '',
        data.generatedAt || new Date().toISOString(),
        data.format || 'pdf',
        dataJson,
        data.summary || '',
      ]
    );

    return await Report.findById(id, data.userId);
  }

  static async deleteById(id, userId) {
    const result = await run('DELETE FROM reports WHERE id = ? AND user_id = ?', [id, userId]);
    return result.changes > 0;
  }
}

module.exports = Report;
