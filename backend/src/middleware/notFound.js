/**
 * 404 handler for unknown API routes.
 * Must be registered AFTER all valid routes but BEFORE the errorHandler.
 */
function notFound(req, res, next) {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}

module.exports = notFound;
