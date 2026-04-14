import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field || 'Field'} already exists`;
    statusCode = 409;
  }
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map((e) => e.message).join(', ');
    statusCode = 400;
  }
  if (err.name === 'CastError') {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }

  logger.error(`${statusCode} ${message} — ${req.method} ${req.originalUrl} | ${err.stack || err}`);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack, detail: err.message }),
  });
};

export default errorHandler;
