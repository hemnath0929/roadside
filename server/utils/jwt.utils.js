/**
 * server/utils/jwt.utils.js
 * JWT sign and verify helpers.
 */

const jwt = require("jsonwebtoken");

const SECRET  = process.env.JWT_SECRET;
const EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

function signToken(payload) {
  if (!SECRET) throw new Error("[JWT] JWT_SECRET is not set.");
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

function verifyToken(token) {
  if (!SECRET) throw new Error("[JWT] JWT_SECRET is not set.");
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };
