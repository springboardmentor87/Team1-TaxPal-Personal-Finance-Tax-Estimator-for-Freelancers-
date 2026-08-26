const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { query, run, get } = require('../config/db');

class User {
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  static async comparePassword(plain, hashed) {
    return await bcrypt.compare(plain, hashed);
  }

  static formatUser(row) {
    if (!row) return null;
    return {
      _id: row.id,
      id: row.id,
      email: row.email,
      password: row.password,
      fullName: row.full_name,
      username: row.username,
      phone: row.phone || '',
      country: row.country || 'US',
      state: row.state || '',
      city: row.city || '',
      avatar: row.avatar || '',
      role: row.role || 'freelancer',
      isEmailVerified: Boolean(row.is_email_verified),
      emailVerificationToken: row.email_verification_token,
      emailVerificationExpires: row.email_verification_expires,
      passwordResetOtp: row.password_reset_otp,
      passwordResetExpires: row.password_reset_expires,
      refreshToken: row.refresh_token,
      categoryMappings: typeof row.category_mappings === 'string' ? JSON.parse(row.category_mappings || '{}') : row.category_mappings || {},
      autoCategorizeEnabled: Boolean(row.auto_categorize_enabled !== 0),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static async findById(id) {
    const row = await get('SELECT * FROM users WHERE id = ?', [id]);
    return User.formatUser(row);
  }

  static async findByEmail(email) {
    const row = await get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
    return User.formatUser(row);
  }

  static async findByUsername(username) {
    const row = await get('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [username]);
    return User.formatUser(row);
  }

  static async create(userData) {
    const id = userData.id || crypto.randomUUID();
    const hashedPassword = userData.password.startsWith('$2')
      ? userData.password
      : await User.hashPassword(userData.password);

    const categoryMappings = typeof userData.categoryMappings === 'object'
      ? JSON.stringify(userData.categoryMappings)
      : userData.categoryMappings || '{}';

    await run(
      `INSERT INTO users (
        id, email, password, full_name, username, phone, country, state, city,
        avatar, role, is_email_verified, refresh_token, category_mappings, auto_categorize_enabled
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userData.email,
        hashedPassword,
        userData.fullName,
        userData.username || null,
        userData.phone || '',
        userData.country || 'US',
        userData.state || '',
        userData.city || '',
        userData.avatar || '',
        userData.role || 'freelancer',
        userData.isEmailVerified ? 1 : 0,
        userData.refreshToken || null,
        categoryMappings,
        userData.autoCategorizeEnabled === false ? 0 : 1,
      ]
    );

    return await User.findById(id);
  }

  static async updateById(id, updateData) {
    const existing = await get('SELECT * FROM users WHERE id = ?', [id]);
    if (!existing) return null;

    let password = existing.password;
    if (updateData.password && !updateData.password.startsWith('$2')) {
      password = await User.hashPassword(updateData.password);
    }

    const categoryMappings = updateData.categoryMappings !== undefined
      ? (typeof updateData.categoryMappings === 'object' ? JSON.stringify(updateData.categoryMappings) : updateData.categoryMappings)
      : existing.category_mappings;

    await run(
      `UPDATE users SET
        email = COALESCE(?, email),
        password = ?,
        full_name = COALESCE(?, full_name),
        username = COALESCE(?, username),
        phone = COALESCE(?, phone),
        country = COALESCE(?, country),
        state = COALESCE(?, state),
        city = COALESCE(?, city),
        avatar = COALESCE(?, avatar),
        role = COALESCE(?, role),
        is_email_verified = COALESCE(?, is_email_verified),
        password_reset_otp = COALESCE(?, password_reset_otp),
        password_reset_expires = COALESCE(?, password_reset_expires),
        refresh_token = COALESCE(?, refresh_token),
        category_mappings = ?,
        auto_categorize_enabled = COALESCE(?, auto_categorize_enabled),
        updated_at = datetime('now')
      WHERE id = ?`,
      [
        updateData.email || null,
        password,
        updateData.fullName || null,
        updateData.username || null,
        updateData.phone !== undefined ? updateData.phone : null,
        updateData.country || null,
        updateData.state !== undefined ? updateData.state : null,
        updateData.city !== undefined ? updateData.city : null,
        updateData.avatar !== undefined ? updateData.avatar : null,
        updateData.role || null,
        updateData.isEmailVerified !== undefined ? (updateData.isEmailVerified ? 1 : 0) : null,
        updateData.passwordResetOtp !== undefined ? updateData.passwordResetOtp : null,
        updateData.passwordResetExpires !== undefined ? updateData.passwordResetExpires : null,
        updateData.refreshToken !== undefined ? updateData.refreshToken : null,
        categoryMappings,
        updateData.autoCategorizeEnabled !== undefined ? (updateData.autoCategorizeEnabled ? 1 : 0) : null,
        id,
      ]
    );

    return await User.findById(id);
  }

  static async findSessions(userId) {
    const rows = await query('SELECT * FROM user_sessions WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows.map((r) => ({
      _id: r.id,
      id: r.id,
      userId: r.user_id,
      refreshToken: r.refresh_token,
      ip: r.ip,
      userAgent: r.user_agent,
      createdAt: r.created_at,
    }));
  }

  static async addSession({ userId, refreshToken, ip = '', userAgent = '' }) {
    const id = crypto.randomUUID();
    await run(
      'INSERT INTO user_sessions (id, user_id, refresh_token, ip, user_agent) VALUES (?, ?, ?, ?, ?)',
      [id, userId, refreshToken, ip, userAgent]
    );
    return { id, userId, refreshToken, ip, userAgent };
  }

  static async removeSession(id) {
    await run('DELETE FROM user_sessions WHERE id = ?', [id]);
  }

  static async removeAllSessionsExcept(userId, currentRefreshToken) {
    await run('DELETE FROM user_sessions WHERE user_id = ? AND refresh_token != ?', [userId, currentRefreshToken]);
  }
}

module.exports = User;
