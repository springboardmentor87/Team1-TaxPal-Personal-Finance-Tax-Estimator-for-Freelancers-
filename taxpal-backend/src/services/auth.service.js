const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const { env } = require('../config/env');

class AuthService {
  static async register(userData, reqContext = {}) {
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    if (userData.username) {
      const existingUsername = await User.findByUsername(userData.username);
      if (existingUsername) {
        throw new ApiError(400, 'Username is already taken');
      }
    }

    const user = await User.create({
      email: userData.email,
      password: userData.password,
      role: userData.role || 'freelancer',
      fullName: userData.fullName,
      username: userData.username,
      phone: userData.phone || '',
      country: userData.country || 'US',
      state: userData.state || '',
      city: userData.city || '',
    });

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await User.updateById(user.id, { refreshToken });

    const deviceName = reqContext.deviceName || 'Web Browser';
    const ipAddress = reqContext.ipAddress || '127.0.0.1';
    await User.addSession({
      userId: user.id,
      refreshToken,
      ip: ipAddress,
      userAgent: deviceName,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        username: user.username,
        phone: user.phone,
        country: user.country,
        state: user.state,
        city: user.city,
        autoCategorizeEnabled: user.autoCategorizeEnabled,
        categoryMappings: user.categoryMappings,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(identifier, password, reqContext = {}) {
    const trimmed = (identifier || '').trim();
    let user = await User.findByEmail(trimmed);
    if (!user) {
      user = await User.findByUsername(trimmed);
    }
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await User.updateById(user.id, { refreshToken });

    const deviceName = reqContext.deviceName || 'Web Browser';
    const ipAddress = reqContext.ipAddress || '127.0.0.1';
    await User.addSession({
      userId: user.id,
      refreshToken,
      ip: ipAddress,
      userAgent: deviceName,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        username: user.username,
        phone: user.phone,
        country: user.country,
        state: user.state,
        city: user.city,
        autoCategorizeEnabled: user.autoCategorizeEnabled,
        categoryMappings: user.categoryMappings,
      },
      accessToken,
      refreshToken,
    };
  }

  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    const { password, ...safeUser } = user;
    return safeUser;
  }

  static async updateProfile(userId, data) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (data.email && data.email !== user.email) {
      const emailExists = await User.findByEmail(data.email);
      if (emailExists) {
        throw new ApiError(400, 'Email is already taken by another user');
      }
    }

    if (data.username && data.username !== user.username) {
      const usernameExists = await User.findByUsername(data.username);
      if (usernameExists) {
        throw new ApiError(400, 'Username is already taken');
      }
    }

    const updated = await User.updateById(userId, data);
    const { password, ...safeUser } = updated;
    return safeUser;
  }

  static async logout(userId, refreshToken) {
    if (refreshToken) {
      const sessions = await User.findSessions(userId);
      const matched = sessions.find((s) => s.refreshToken === refreshToken);
      if (matched) {
        await User.removeSession(matched.id);
      }
    }
    await User.updateById(userId, { refreshToken: null });
  }

  static async refreshTokens(refreshToken) {
    let decodedPayload;
    try {
      decodedPayload = jwt.verify(refreshToken, env.REFRESH_SECRET);
    } catch (error) {
      throw new ApiError(401, 'Refresh token is expired or invalid');
    }

    const user = await User.findById(decodedPayload.id);
    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(401, 'Refresh token has been revoked or is invalid');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await User.updateById(user.id, { refreshToken: newRefreshToken });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isMatch = await User.comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw new ApiError(400, 'Invalid current password');
    }

    await User.updateById(userId, { password: newPassword });
  }

  static async getSessions(userId) {
    const sessions = await User.findSessions(userId);
    return sessions.map((s) => ({
      id: s.id,
      deviceName: s.userAgent || 'Web Browser',
      ipAddress: s.ip || '127.0.0.1',
      loginTime: s.createdAt,
      token: s.refreshToken,
    }));
  }

  static async logoutOtherSessions(userId, currentRefreshToken) {
    await User.removeAllSessionsExcept(userId, currentRefreshToken);
  }
}

module.exports = {
  AuthService,
};
