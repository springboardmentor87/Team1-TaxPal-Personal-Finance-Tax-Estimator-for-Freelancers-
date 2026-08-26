const { ApiError } = require('../utils/ApiError');
const { logger } = require('../config/logger');
const { env } = require('../config/env');

/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // SQL / SQLite / MySQL duplicate key error handling
  if (err.code === 'SQLITE_CONSTRAINT' || err.code === 'ER_DUP_ENTRY') {
    statusCode = 400;
    const errMsg = err.message || '';
    if (errMsg.includes('users.email')) {
      message = 'An account with this email address already exists. Please sign in instead.';
    } else if (errMsg.includes('users.username')) {
      message = 'This username is already taken. Please choose another username.';
    } else if (errMsg.includes('budgets.user_id, budgets.category, budgets.month')) {
      message = 'A budget for this category and month already exists.';
    } else {
      message = 'A record with this value already exists';
    }
    errors = [{ message: err.message }];
  }

  // Log error stack trace if internal 500 server error
  if (statusCode === 500) {
    logger.error(`[500 Error] ${req.method} ${req.path} - Details:`, err);
    if (env.NODE_ENV === 'production') {
      message = 'Internal Server Error';
    }
  } else {
    logger.warn(`[${statusCode} Error] ${req.method} ${req.path} - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = {
  errorHandler,
};
