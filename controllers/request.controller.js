/**
 * controllers/request.controller.js
 * ───────────────────────────────────
 * Business logic for service requests — create, assign, update status, rate.
 * Integrates with Socket.IO via getIO() to push realtime status updates.
 */

const { validationResult } = require("express-validator");
const ServiceRequest = require("../models/ServiceRequest");
const Mechanic       = require("../models/Mechanic");
const { getIO }      = require("../socket/socketServer");
const { REQUEST_STATUS_LIVE } = require("../socket/socketEvents");

// ── Helper: check validation errors ──────────────────────────────────────────
function checkValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, errors: errors.array() });
    return false;
  }
  return true;
}

// ── Helper: emit status update via Socket.IO ──────────────────────────────────
function broadcastStatus(requestId, status) {
  try {
    const io = getIO();
    io.to(requestId.toString()).emit(REQUEST_STATUS_LIVE, {
      requestId: requestId.toString(),
      status,
      updatedAt: Date.now(),
    });
  } catch (_err) {
    // Socket.IO not ready — silently ignore (REST still works)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/requests
// USER creates a new service request
// ─────────────────────────────────────────────────────────────────────────────
async function createRequest(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;

    const { serviceType, description, lat, lng, address } = req.body;

    const request = await ServiceRequest.create({
      user: req.user._id,
      serviceType,
      description: description || "",
      userLocation: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
        address: address || "",
      },
    });

    console.log(`[Request] Created requestId=${request._id} by userId=${req.user._id}`);

    res.status(201).json({ success: true, request });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/requests/my
// USER gets their own requests (paginated)
// ─────────────────────────────────────────────────────────────────────────────
async function getMyRequests(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      ServiceRequest.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("mechanic", "name phone profilePhoto rating"),
      ServiceRequest.countDocuments({ user: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      requests,
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/requests/:id
// Get a single request (user must own it, or mechanic must be assigned)
// ─────────────────────────────────────────────────────────────────────────────
async function getRequestById(req, res, next) {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate("user",     "name phone profilePhoto")
      .populate("mechanic", "name phone profilePhoto rating vehicleDetails");

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    // Access control
    const isOwner    = request.user._id.toString() === req.user._id.toString();
    const isAssigned = request.mechanic &&
                       request.mechanic._id.toString() === req.user._id.toString();
    const isAdmin    = req.user.role === "admin";

    if (!isOwner && !isAssigned && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.status(200).json({ success: true, request });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/requests/pending
// MECHANIC: get all pending requests (within optional radius)
// ─────────────────────────────────────────────────────────────────────────────
async function getPendingRequests(req, res, next) {
  try {
    const { lat, lng, radius = 10000 } = req.query; // radius in metres

    let filter = { status: "pending" };
    const useGeo = lat && lng;

    // If mechanic provides location, narrow by proximity
    if (useGeo) {
      filter.userLocation = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius),
        },
      };
    }

    // NOTE: Cannot use .sort() with $near — MongoDB does not allow both
    let query = ServiceRequest.find(filter).limit(20).populate("user", "name phone profilePhoto");

    if (!useGeo) {
      query = query.sort({ createdAt: 1 }); // oldest first (FIFO) — only when no geo filter
    }

    const requests = await query;

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/requests/:id/accept
// MECHANIC accepts a pending request
// ─────────────────────────────────────────────────────────────────────────────
async function acceptRequest(req, res, next) {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }
    if (request.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: `Cannot accept a request with status '${request.status}'.`,
      });
    }
    if (!req.user.isAvailable) {
      return res.status(409).json({
        success: false,
        message: "You already have an active job. Complete it first.",
      });
    }

    request.mechanic   = req.user._id;
    request.status     = "accepted";
    request.acceptedAt = new Date();
    await request.save();

    // Lock mechanic
    await Mechanic.findByIdAndUpdate(req.user._id, {
      isAvailable:     false,
      activeRequestId: request._id,
    });

    broadcastStatus(request._id, "accepted");

    console.log(`[Request] Accepted requestId=${request._id} by mechanicId=${req.user._id}`);

    res.status(200).json({ success: true, request });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/requests/:id/status
// MECHANIC updates the status of their active request
// ─────────────────────────────────────────────────────────────────────────────
async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;

    const ALLOWED_TRANSITIONS = {
      accepted:    ["on_the_way", "cancelled"],
      on_the_way:  ["nearby", "arrived", "cancelled"],
      nearby:      ["arrived", "cancelled"],
      arrived:     ["in_progress"],
      in_progress: ["completed"],
    };

    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    // Only the assigned mechanic can update
    if (!request.mechanic || request.mechanic.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not your assigned request." });
    }

    const allowed = ALLOWED_TRANSITIONS[request.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition: '${request.status}' → '${status}'.`,
        allowed,
      });
    }

    // Set semantic timestamps
    if (status === "arrived")   request.arrivedAt   = new Date();
    if (status === "completed") {
      request.completedAt = new Date();
      await Mechanic.findByIdAndUpdate(req.user._id, {
        isAvailable:     true,
        activeRequestId: null,
      });
    }
    if (status === "cancelled") {
      request.cancelledAt         = new Date();
      request.cancellationReason  = req.body.reason || "";
      await Mechanic.findByIdAndUpdate(req.user._id, {
        isAvailable:     true,
        activeRequestId: null,
      });
    }

    request.status = status;
    await request.save();

    broadcastStatus(request._id, status);

    console.log(`[Request] Status updated requestId=${request._id}: ${status}`);

    res.status(200).json({ success: true, request });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/requests/:id/cancel
// USER cancels their own pending request
// ─────────────────────────────────────────────────────────────────────────────
async function cancelRequest(req, res, next) {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }
    if (request.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not your request." });
    }
    if (["completed", "cancelled"].includes(request.status)) {
      return res.status(409).json({
        success: false,
        message: `Request is already ${request.status}.`,
      });
    }

    request.status             = "cancelled";
    request.cancelledAt        = new Date();
    request.cancellationReason = req.body.reason || "Cancelled by user";
    await request.save();

    // Free mechanic if they had already accepted
    if (request.mechanic) {
      await Mechanic.findByIdAndUpdate(request.mechanic, {
        isAvailable:     true,
        activeRequestId: null,
      });
    }

    broadcastStatus(request._id, "cancelled");

    console.log(`[Request] Cancelled requestId=${request._id} by userId=${req.user._id}`);

    res.status(200).json({ success: true, message: "Request cancelled.", request });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/requests/:id/rate
// USER rates the completed service
// ─────────────────────────────────────────────────────────────────────────────
async function rateRequest(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;

    const { score, comment } = req.body;
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }
    if (request.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not your request." });
    }
    if (request.status !== "completed") {
      return res.status(409).json({ success: false, message: "Can only rate completed requests." });
    }
    if (request.rating.score !== null) {
      return res.status(409).json({ success: false, message: "You have already rated this request." });
    }

    request.rating = { score, comment: comment || "", givenAt: new Date() };
    await request.save();

    // Update mechanic's aggregate rating
    if (request.mechanic) {
      const mechanic = await Mechanic.findById(request.mechanic);
      const prevTotal = mechanic.rating.average * mechanic.rating.count;
      mechanic.rating.count   += 1;
      mechanic.rating.average  = (prevTotal + score) / mechanic.rating.count;
      await mechanic.save();
    }

    console.log(`[Request] Rated requestId=${request._id} score=${score}`);

    res.status(200).json({ success: true, message: "Rating submitted.", rating: request.rating });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createRequest,
  getMyRequests,
  getRequestById,
  getPendingRequests,
  acceptRequest,
  updateStatus,
  cancelRequest,
  rateRequest,
};
