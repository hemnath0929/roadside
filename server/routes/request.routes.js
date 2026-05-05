const router = require("express").Router();
const { body } = require("express-validator");
const { protect, restrictTo } = require("../middleware/auth.middleware");
const { createRequest, getMyRequests, getRequestById, getPendingRequests, acceptRequest, updateStatus, cancelRequest, rateRequest } = require("../controllers/request.controller");
const { SERVICE_TYPES, STATUS_FLOW } = require("../models/ServiceRequest");

router.use(protect);

// User routes
router.post("/", restrictTo("user"),
  [
    body("serviceType").isIn(SERVICE_TYPES).withMessage(`serviceType must be one of: ${SERVICE_TYPES.join(", ")}`),
    body("lat").isFloat({ min: -90,  max: 90  }).withMessage("lat must be a valid latitude"),
    body("lng").isFloat({ min: -180, max: 180 }).withMessage("lng must be a valid longitude"),
  ],
  createRequest
);
router.get("/my",        restrictTo("user"), getMyRequests);
router.patch("/:id/cancel", restrictTo("user"), cancelRequest);
router.post("/:id/rate", restrictTo("user"),
  [body("score").isInt({ min: 1, max: 5 }).withMessage("score must be 1–5")],
  rateRequest
);

// Mechanic routes
router.get("/pending",       restrictTo("mechanic"), getPendingRequests);
router.patch("/:id/accept",  restrictTo("mechanic"), acceptRequest);
router.patch("/:id/status",  restrictTo("mechanic"),
  [body("status").isIn(STATUS_FLOW).withMessage(`status must be one of: ${STATUS_FLOW.join(", ")}`)],
  updateStatus
);

// Shared
router.get("/:id", getRequestById);

module.exports = router;
