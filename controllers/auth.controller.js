/**
 * controllers/auth.controller.js
 * ────────────────────────────────
 * Handles registration and login for both Users and Mechanics.
 * Returns a JWT on success.
 */

const { validationResult } = require("express-validator");
const User     = require("../models/User");
const Mechanic = require("../models/Mechanic");
const { signToken } = require("../utils/jwt.utils");

// ── Helper: send token response ───────────────────────────────────────────────
function sendToken(account, statusCode, res) {
  const token = signToken({ id: account._id, role: account.role });
  res.status(statusCode).json({
    success: true,
    token,
    user: account,
  });
}

// ── Helper: check validation errors ──────────────────────────────────────────
function checkValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, errors: errors.array() });
    return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register/user
// ─────────────────────────────────────────────────────────────────────────────
async function registerUser(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;

    const { name, email, phone, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }

    const user = await User.create({ name, email, phone, password });
    console.log(`[Auth] New user registered: ${user.email}`);
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login/user
// ─────────────────────────────────────────────────────────────────────────────
async function loginUser(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Your account has been deactivated." });
    }

    console.log(`[Auth] User login: ${user.email}`);
    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register/mechanic
// ─────────────────────────────────────────────────────────────────────────────
async function registerMechanic(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;

    const { name, email, phone, password, specializations, vehicleDetails } = req.body;

    const exists = await Mechanic.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }

    const mechanic = await Mechanic.create({
      name,
      email,
      phone,
      password,
      specializations: specializations || [],
      vehicleDetails:  vehicleDetails  || {},
    });

    console.log(`[Auth] New mechanic registered: ${mechanic.email} (pending approval)`);

    // Don't issue a token yet — must be approved by admin first
    res.status(201).json({
      success: true,
      message: "Mechanic registration submitted. Await admin approval before logging in.",
      mechanicId: mechanic._id,
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login/mechanic
// ─────────────────────────────────────────────────────────────────────────────
async function loginMechanic(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;

    const { email, password } = req.body;

    const mechanic = await Mechanic.findOne({ email }).select("+password");
    if (!mechanic || !(await mechanic.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (!mechanic.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your mechanic account is pending admin approval.",
      });
    }

    if (!mechanic.isActive) {
      return res.status(403).json({ success: false, message: "Your account has been deactivated." });
    }

    console.log(`[Auth] Mechanic login: ${mechanic.email}`);
    sendToken(mechanic, 200, res);
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me   (protected)
// ─────────────────────────────────────────────────────────────────────────────
async function getMe(req, res) {
  res.status(200).json({ success: true, user: req.user });
}

module.exports = {
  registerUser,
  loginUser,
  registerMechanic,
  loginMechanic,
  getMe,
};
