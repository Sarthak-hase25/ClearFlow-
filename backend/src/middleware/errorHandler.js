'use strict';

/**
 * Centralized error handler middleware.
 * Must be registered AFTER all routes.
 *
 * Produces a consistent JSON response shape:
 *   { success: false, message: "..." }
 *
 * Security & Production Hardening:
 * - Stack traces are strictly excluded in production.
 * - Internal 500 error messages are sanitized to prevent information disclosure.
 * - Sensitive strings (e.g. database credentials or tokens) are never leaked.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Determine HTTP status code
  let statusCode = err.statusCode || err.status || 500;

  // Mongoose validation error → 400
  if (err.name === 'ValidationError') {
    statusCode = 400;
  }

  // Mongoose bad ObjectId → 400
  if (err.name === 'CastError') {
    statusCode = 400;
    err.message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose duplicate key → 409
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    err.message = field
      ? `Duplicate value for field: ${field}`
      : 'Duplicate key error';
  }

  const isDev = process.env.NODE_ENV !== 'production';

  // Sanitize message to prevent credential/internal leaks
  let safeMessage = err.message || 'Internal server error';

  if (!isDev && statusCode === 500) {
    safeMessage = 'An unexpected server error occurred. Please try again later.';
  } else if (safeMessage.includes('mongodb://') || safeMessage.includes('mongodb+srv://') || safeMessage.includes('password') || safeMessage.includes('key')) {
    safeMessage = 'A database or configuration error occurred.';
  }

  const payload = {
    success: false,
    message: safeMessage,
  };

  // Include stack trace only during development
  if (isDev && err.stack) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}

module.exports = errorHandler;
