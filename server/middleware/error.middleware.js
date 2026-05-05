/**
 * server/middleware/error.middleware.js
 * Centralised Express error handler.
 */

function classifyError(err) {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return { status: 409, message: `An account with this ${field} already exists.` };
  }
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return { status: 422, message: messages.join(". ") };
  }
  if (err.name === "CastError" && err.kind === "ObjectId") {
    return { status: 400, message: `Invalid ID format: ${err.value}` };
  }
  if (err.name === "JsonWebTokenError")  return { status: 401, message: "Invalid authentication token." };
  if (err.name === "TokenExpiredError")  return { status: 401, message: "Authentication token has expired." };
  return null;
}

function errorHandler(err, req, res, next) {
  const classified = classifyError(err);
  const status  = classified?.status  || err.statusCode || err.status || 500;
  const message = classified?.message || err.message    || "An unexpected error occurred.";

  console.error(`[Error] ${req.method} ${req.originalUrl} → ${status}: ${message}`);

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && status === 500 && { stack: err.stack }),
  });
}

function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
