const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { ApiError } = require('../utils/ApiError');
const User = require('../models/User');

/**
 * Middleware to authenticate requests via JWT access token
 */
const authenticate = async (req, res, next) => {
  try {
    let token = '';

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new ApiError(401, 'Authentication token missing');
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);

      const userExists = await User.findById(decoded.id);
      if (!userExists) {
        throw new ApiError(401, 'User account no longer exists');
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || userExists.role,
      };

      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Access token has expired');
      }
      throw new ApiError(401, 'Unauthorized: Access token is invalid');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access to specific roles
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Access denied: Role '${req.user.role}' is not authorized to access this resource`)
      );
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
};
