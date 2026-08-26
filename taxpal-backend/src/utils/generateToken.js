const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

/**
 * Generate a JWT Access Token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES,
  });
};

/**
 * Generate a JWT Refresh Token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.REFRESH_SECRET, {
    expiresIn: env.REFRESH_EXPIRES,
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
