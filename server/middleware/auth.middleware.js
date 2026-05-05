/**
 * server/middleware/auth.middleware.js
 * JWT protect + role-based restrictTo guard.
 */

const { verifyToken } = require("../utils/jwt.utils");
const User     = require("../models/User");
const Mechanic = require("../models/Mechanic");

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authentication required. Please log in." });
    }

    const token   = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    let account = null;
    if (decoded.role === "mechanic") {
      account = await Mechanic.findById(decoded.id).select("-password");
    } else {
      account = await User.findById(decoded.id).select("-password");
    }

    if (!account || !account.isActive) {
      return res.status(401).json({ success: false, message: "Account not found or deactivated." });
    }

    req.user = account;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Session expired. Please log in again." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token." });
    }
    next(err);
  }
}

function restrictTo(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Restricted to: ${roles.join(", ")}.`,
      });
    }
    next();
  };
}

module.exports = { protect, restrictTo };
