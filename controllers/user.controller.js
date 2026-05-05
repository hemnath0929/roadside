/**
 * controllers/user.controller.js
 * ────────────────────────────────
 * Profile management for regular users.
 */

const User = require("../models/User");

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/user/profile  (user only)
// ─────────────────────────────────────────────────────────────────────────────
async function getProfile(req, res) {
  res.status(200).json({ success: true, user: req.user });
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/user/profile  (user only)
// ─────────────────────────────────────────────────────────────────────────────
async function updateProfile(req, res, next) {
  try {
    const allowed = ["name", "phone", "profilePhoto"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
