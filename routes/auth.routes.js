/**
 * routes/auth.routes.js
 * ──────────────────────
 * POST /api/auth/register/user
 * POST /api/auth/login/user
 * POST /api/auth/register/mechanic
 * POST /api/auth/login/mechanic
 * GET  /api/auth/me            (protected)
 */

const router = require("express").Router();
const { body } = require("express-validator");

const {
  registerUser,
  loginUser,
  registerMechanic,
  loginMechanic,
  getMe,
} = require("../controllers/auth.controller");

const { protect } = require("../middleware/auth.middleware");

// ── Shared validators ─────────────────────────────────────────────────────────
const emailValidator    = body("email").isEmail().withMessage("Valid email required").normalizeEmail();
const passwordValidator = body("password").isLength({ min: 6 }).withMessage("Password must be ≥ 6 characters");
const nameValidator     = body("name").trim().notEmpty().withMessage("Name is required");
const phoneValidator    = body("phone")
  .matches(/^\+?[0-9]{10,15}$/)
  .withMessage("Valid phone number required");

// ── Routes ────────────────────────────────────────────────────────────────────

// User auth
router.post(
  "/register/user",
  [nameValidator, emailValidator, passwordValidator, phoneValidator],
  registerUser
);
router.post(
  "/login/user",
  [emailValidator, passwordValidator],
  loginUser
);

// Mechanic auth
router.post(
  "/register/mechanic",
  [nameValidator, emailValidator, passwordValidator, phoneValidator],
  registerMechanic
);
router.post(
  "/login/mechanic",
  [emailValidator, passwordValidator],
  loginMechanic
);

// Who am I?
router.get("/me", protect, getMe);

module.exports = router;
