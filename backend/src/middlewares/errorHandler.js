const { sendError } = require('../utils/response');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

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

  // Default
  const statusCode = err.statusCode || 500;
  return sendError(res, err.message || 'Internal server error', statusCode);
};

module.exports = errorHandler;
