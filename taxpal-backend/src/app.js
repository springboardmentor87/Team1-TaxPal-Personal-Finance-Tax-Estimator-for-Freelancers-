const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const transactionRoutes = require('./routes/transaction.routes');
const budgetRoutes = require('./routes/budget.routes');
const categoryRoutes = require('./routes/category.routes');
const taxEstimateRoutes = require('./routes/taxEstimate.routes');
const alertRoutes = require('./routes/alert.routes');
const reportRoutes = require('./routes/report.routes');
const receiptRoutes = require('./routes/receipt.routes');
const chatRoutes = require('./routes/chat.routes');

const { errorHandler } = require('./middleware/error.middleware');
const { ApiError } = require('./utils/ApiError');
const { env } = require('./config/env');

const app = express();

// Security HTTP headers
app.use(helmet());

// Enable CORS with credentials
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Morgan HTTP request logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tax-estimates', taxEstimateRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaxPal Backend API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to TaxPal: Personal Finance & Tax Estimator Backend API (Express.js & SQL)',
  });
});

// Catch-all route handler for 404
app.use((req, res, next) => {
  next(new ApiError(404, `Endpoint not found: ${req.method} ${req.originalUrl}`));
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
