const app = require('./app');
const { connectDB } = require('./config/db');
const { env } = require('./config/env');
const { logger } = require('./config/logger');
const { ScheduleService } = require('./services/schedule.service');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

// Connect SQL Database (SQLite / MySQL) and start HTTP server
connectDB()
  .then(() => {
    const server = app.listen(env.PORT, () => {
      logger.info(`TaxPal Backend API started in ${env.NODE_ENV} mode on port ${env.PORT}`);

      // Start Scheduled Reports heartbeat
      ScheduleService.runScheduledTask().catch((err) =>
        logger.error('Schedule worker startup scan error:', err)
      );

      setInterval(() => {
        ScheduleService.runScheduledTask().catch((err) =>
          logger.error('Schedule worker periodic scan error:', err)
        );
      }, 3600 * 1000);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! Closing server...', err);
      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((err) => {
    logger.error('Failed to initialize database connection:', err);
    process.exit(1);
  });
