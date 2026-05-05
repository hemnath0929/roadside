/**
 * routes/request.routes.js
 * ─────────────────────────
 * POST   /api/requests              → create (user)
 * GET    /api/requests/my           → user's own history (user)
 * GET    /api/requests/pending      → all pending (mechanic)
 * GET    /api/requests/:id          → single request (user | mechanic)
 * PATCH  /api/requests/:id/accept   → mechanic accepts (mechanic)
 * PATCH  /api/requests/:id/status   → update status (mechanic)
 * PATCH  /api/requests/:id/cancel   → cancel (user)
 * POST   /api/requests/:id/rate     → rate completed (user)
 */

const router = require("express").Router();
const { body } = require("express-validator");
const { protect, restrictTo } = require("../middleware/auth.middleware");

const {
  createRequest,
  getMyRequests,
  getRequestById,
  getPendingRequests,
  acceptRequest,
  updateStatus,
  cancelRequest,
  rateRequest,
} = require("../controllers/request.controller");

const { SERVICE_TYPES, STATUS_FLOW } = require("../models/ServiceRequest");

// ── All routes require auth ───────────────────────────────────────────────────
router.use(protect);

// ── User routes ───────────────────────────────────────────────────────────────
router.post(
  "/",
  restrictTo("user"),
  [
    body("serviceType")
      .isIn(SERVICE_TYPES)
      .withMessage(`serviceType must be one of: ${SERVICE_TYPES.join(", ")}`),
    body("lat")
      .isFloat({ min: -90, max: 90 })
      .withMessage("lat must be a valid latitude"),
    body("lng")
      .isFloat({ min: -180, max: 180 })
      .withMessage("lng must be a valid longitude"),
  ],
  createRequest
);

router.get("/my",  restrictTo("user"), getMyRequests);

router.patch(
  "/:id/cancel",
  restrictTo("user"),
  cancelRequest
);

router.post(
  "/:id/rate",
  restrictTo("user"),
  [
    body("score")
      .isInt({ min: 1, max: 5 })
      .withMessage("score must be an integer between 1 and 5"),
  ],
  rateRequest
);

// ── Mechanic routes ───────────────────────────────────────────────────────────
router.get("/pending", restrictTo("mechanic"), getPendingRequests);

router.patch("/:id/accept", restrictTo("mechanic"), acceptRequest);

router.patch(
  "/:id/status",
  restrictTo("mechanic"),
  [
    body("status")
      .isIn(STATUS_FLOW)
      .withMessage(`status must be one of: ${STATUS_FLOW.join(", ")}`),
  ],
  updateStatus
);

// ── Shared ────────────────────────────────────────────────────────────────────
router.get("/:id", getRequestById);

module.exports = router;
