import 'dotenv/config';
import app       from './app.js';
import connectDB from './config/db.js';
import logger    from './utils/logger.js';

const PORT = Number(process.env.PORT) || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  logger.info(`API docs → http://localhost:${PORT}/api/v1/docs`);
});
connectDB();
const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled rejection: ${err.message}`);
  shutdown('unhandledRejection');
});
