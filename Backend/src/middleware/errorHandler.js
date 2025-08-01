// src/middleware/errorHandler.js
import config from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  console.error('❌ ERROR:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `A user with that ${field} already exists.`;
    statusCode = 409; // Conflict
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    message = 'Your session is invalid or has expired. Please log in again.';
    statusCode = 401;
  }

  res.status(statusCode).json({
    message,
    ...(config.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export default errorHandler;
