/**
 * middleware/auth.middleware.js
 * ─────────────────────────────
 * Express middleware to protect routes with JWT authentication.
 *
 * Usage:
 *   router.get("/profile", protect, getProfile);
 *   router.post("/accept",  protect, restrictTo("mechanic"), acceptRequest);
 */

const { verifyToken } = require("../utils/jwt.utils");
const User     = require("../models/User");
const Mechanic = require("../models/Mechanic");

/**
 * Attach the authenticated user/mechanic to req.user.
 * Requires a valid Bearer token in the Authorization header.
 */
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Fetch fresh record to catch deactivated accounts
    let account = null;
    if (decoded.role === "mechanic") {
      account = await Mechanic.findById(decoded.id).select("-password");
    } else {
      account = await User.findById(decoded.id).select("-password");
    }

    if (!account || !account.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account not found or has been deactivated.",
      });
    }

    req.user = account; // Attach to request for downstream handlers
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

/**
 * Role-based access control. Must come AFTER protect().
 * @param {...string} roles - Allowed roles, e.g. "mechanic", "admin"
 */
function restrictTo(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route is restricted to: ${roles.join(", ")}.`,
      });
    }
    next();
  };
}

module.exports = { protect, restrictTo };
