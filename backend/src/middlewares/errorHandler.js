const { sendError } = require('../utils/response');

/**
 * Global error handler middleware
 * In production, generic messages are sent for 500 errors to avoid leaking internals.
 */
const errorHandler = (err, req, res, next) => {
  // Always log the full error server-side
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return sendError(res, messages.join('. '), 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, `${field} already exists.`, 409);
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, 'Invalid ID format.', 400);
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token.', 401);
  }

  // Token expired
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired. Please log in again.', 401);
  }

  // Default — hide internal details in production
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  return sendError(res, message, statusCode);
};

module.exports = errorHandler;
