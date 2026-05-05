/**
 * controllers/mechanic.controller.js
 * ────────────────────────────────────
 * Profile management and availability toggle for mechanics.
 */

const Mechanic = require("../models/Mechanic");
const ServiceRequest = require("../models/ServiceRequest");

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mechanic/profile   (mechanic only)
// ─────────────────────────────────────────────────────────────────────────────
async function getProfile(req, res, next) {
  try {
    res.status(200).json({ success: true, mechanic: req.user });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/mechanic/profile  (mechanic only)
// ─────────────────────────────────────────────────────────────────────────────
async function updateProfile(req, res, next) {
  try {
    const allowed = ["name", "phone", "specializations", "vehicleDetails", "profilePhoto"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const mechanic = await Mechanic.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, mechanic });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/mechanic/availability  (mechanic only)
// Body: { isAvailable: true | false }
// ─────────────────────────────────────────────────────────────────────────────
async function toggleAvailability(req, res, next) {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be a boolean.",
      });
    }

    // Don't allow going offline mid-job
    if (!isAvailable && req.user.activeRequestId) {
      return res.status(409).json({
        success: false,
        message: "Cannot go offline while you have an active job.",
      });
    }

    const mechanic = await Mechanic.findByIdAndUpdate(
      req.user._id,
      { isAvailable },
      { new: true }
    );

    console.log(`[Mechanic] ${mechanic.email} set availability → ${isAvailable}`);
    res.status(200).json({ success: true, isAvailable: mechanic.isAvailable });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mechanic/jobs  (mechanic only)
// Mechanic's own job history
// ─────────────────────────────────────────────────────────────────────────────
async function getJobHistory(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      ServiceRequest.find({ mechanic: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name phone"),
      ServiceRequest.countDocuments({ mechanic: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      jobs,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, toggleAvailability, getJobHistory };
