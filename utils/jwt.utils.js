/**
 * utils/jwt.utils.js
 * ──────────────────
 * Helpers for signing and verifying JSON Web Tokens.
 */

const jwt = require("jsonwebtoken");

const SECRET  = process.env.JWT_SECRET;
const EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Sign a JWT for an authenticated user or mechanic.
 * @param {Object} payload - e.g. { id, role }
 * @returns {string} Signed JWT
 */
function signToken(payload) {
  if (!SECRET) throw new Error("[JWT] JWT_SECRET is not set in environment variables.");
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

/**
 * Verify and decode a JWT.
 * Throws JsonWebTokenError or TokenExpiredError on failure.
 * @param {string} token
 * @returns {Object} Decoded payload
 */
function verifyToken(token) {
  if (!SECRET) throw new Error("[JWT] JWT_SECRET is not set in environment variables.");
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };
