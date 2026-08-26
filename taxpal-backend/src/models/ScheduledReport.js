const crypto = require('crypto');
const { query, run, get } = require('../config/db');

class ScheduledReport {
  static format(row) {
    if (!row) return null;
    return {
      _id: row.id,
      id: row.id,
      userId: row.user_id,
      frequency: row.frequency,
      email: row.email,
      format: row.format || 'pdf',
      lastSentAt: row.last_sent_at,
      nextRunAt: row.next_run_at,
      isActive: Boolean(row.is_active !== 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findByUserId(userId) {
    const rows = await query('SELECT * FROM scheduled_reports WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows.map(ScheduledReport.format);
  }

  static async findById(id, userId) {
    const row = await get('SELECT * FROM scheduled_reports WHERE id = ? AND user_id = ?', [id, userId]);
    return ScheduledReport.format(row);
  }

  static async findAllActive() {
    const rows = await query('SELECT * FROM scheduled_reports WHERE is_active = 1');
    return rows.map(ScheduledReport.format);
  }

  static async create(data) {
    const id = data.id || crypto.randomUUID();
    await run(
      `INSERT INTO scheduled_reports (id, user_id, frequency, email, format, next_run_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.userId,
        data.frequency,
        data.email,
        data.format || 'pdf',
        data.nextRunAt || null,
        data.isActive === false ? 0 : 1,
      ]
    );

    return await ScheduledReport.findById(id, data.userId);
  }

  static async updateById(id, data) {
    await run(
      `UPDATE scheduled_reports SET
        frequency = COALESCE(?, frequency),
        email = COALESCE(?, email),
        format = COALESCE(?, format),
        last_sent_at = COALESCE(?, last_sent_at),
        next_run_at = COALESCE(?, next_run_at),
        is_active = COALESCE(?, is_active),
        updated_at = datetime('now')
      WHERE id = ?`,
      [
        data.frequency || null,
        data.email || null,
        data.format || null,
        data.lastSentAt || null,
        data.nextRunAt || null,
        data.isActive !== undefined ? (data.isActive ? 1 : 0) : null,
        id,
      ]
    );

    const row = await get('SELECT * FROM scheduled_reports WHERE id = ?', [id]);
    return ScheduledReport.format(row);
  }

  static async deleteById(id, userId) {
    const result = await run('DELETE FROM scheduled_reports WHERE id = ? AND user_id = ?', [id, userId]);
    return result.changes > 0;
  }
}

module.exports = ScheduledReport;
