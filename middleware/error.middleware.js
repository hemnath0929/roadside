/**
 * middleware/error.middleware.js
 * ───────────────────────────────
 * Centralised Express error handler.
 * Catches anything passed to next(err) and returns consistent JSON.
 *
 * Register this LAST in app.js:
 *   app.use(errorHandler);
 */

/**
 * Map Mongoose/Mongo error names to HTTP status codes and human messages.
 */
function classifyError(err) {
  // Mongoose duplicate key (e.g., unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return {
      status: 409,
      message: `An account with this ${field} already exists.`,
    };
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return { status: 422, message: messages.join(". ") };
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return { status: 400, message: `Invalid ID format: ${err.value}` };
  }

  // JWT errors (shouldn't reach here but just in case)
  if (err.name === "JsonWebTokenError") {
    return { status: 401, message: "Invalid authentication token." };
  }
  if (err.name === "TokenExpiredError") {
    return { status: 401, message: "Authentication token has expired." };
  }

  return null; // Unknown — will use err.statusCode or 500
}

/**
 * Global error handling middleware.
 * @param {Error} err
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
function errorHandler(err, req, res, next) {
  const classified = classifyError(err);

  const status  = classified?.status  || err.statusCode || err.status || 500;
  const message = classified?.message || err.message    || "An unexpected error occurred.";

  // Log full error in dev; minimal in prod
  if (process.env.NODE_ENV !== "production") {
    console.error(`[Error] ${req.method} ${req.originalUrl} → ${status}: ${message}`);
    if (status === 500) console.error(err.stack);
  } else {
    console.error(`[Error] ${status}: ${message}`);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && status === 500 && { stack: err.stack }),
  });
}

/**
 * 404 handler — mount BEFORE errorHandler but AFTER all routes.
 */
function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFound };
