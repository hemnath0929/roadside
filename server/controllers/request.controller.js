/**
 * server/controllers/request.controller.js
 * ─────────────────────────────────────────
 * NOTE: socket/ lives at repo root, so we go up TWO levels (../../socket/)
 */

const { validationResult } = require("express-validator");
const ServiceRequest = require("../models/ServiceRequest");
const Mechanic       = require("../models/Mechanic");
const { getIO }                = require("../../socket/socketServer"); // ← repo root
const { REQUEST_STATUS_LIVE }  = require("../../socket/socketEvents"); // ← repo root

function checkValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(422).json({ success: false, errors: errors.array() }); return false; }
  return true;
}

function broadcastStatus(requestId, status) {
  try {
    const io = getIO();
    io.to(requestId.toString()).emit(REQUEST_STATUS_LIVE, {
      requestId: requestId.toString(), status, updatedAt: Date.now(),
    });
  } catch (_err) { /* Socket.IO not ready — REST still works */ }
}

// POST /api/requests
async function createRequest(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;
    const { serviceType, description, lat, lng, address } = req.body;
    const request = await ServiceRequest.create({
      user: req.user._id, serviceType, description: description || "",
      userLocation: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)], address: address || "" },
    });
    console.log(`[Request] Created requestId=${request._id} by userId=${req.user._id}`);
    res.status(201).json({ success: true, request });
  } catch (err) { next(err); }
}

// GET /api/requests/my
async function getMyRequests(req, res, next) {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;
    const [requests, total] = await Promise.all([
      ServiceRequest.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("mechanic", "name phone profilePhoto rating"),
      ServiceRequest.countDocuments({ user: req.user._id }),
    ]);
    res.status(200).json({ success: true, page, totalPages: Math.ceil(total / limit), total, requests });
  } catch (err) { next(err); }
}

// GET /api/requests/:id
async function getRequestById(req, res, next) {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate("user", "name phone profilePhoto")
      .populate("mechanic", "name phone profilePhoto rating vehicleDetails");
    if (!request) return res.status(404).json({ success: false, message: "Request not found." });
    const isOwner    = request.user._id.toString() === req.user._id.toString();
    const isAssigned = request.mechanic && request.mechanic._id.toString() === req.user._id.toString();
    const isAdmin    = req.user.role === "admin";
    if (!isOwner && !isAssigned && !isAdmin) return res.status(403).json({ success: false, message: "Access denied." });
    res.status(200).json({ success: true, request });
  } catch (err) { next(err); }
}

// GET /api/requests/pending
async function getPendingRequests(req, res, next) {
  try {
    const { lat, lng, radius = 10000 } = req.query;
    const useGeo = lat && lng;
    const filter = { status: "pending" };
    if (useGeo) {
      filter.userLocation = {
        $near: { $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] }, $maxDistance: parseInt(radius) },
      };
    }
    let query = ServiceRequest.find(filter).limit(20).populate("user", "name phone profilePhoto");
    if (!useGeo) query = query.sort({ createdAt: 1 });
    const requests = await query;
    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (err) { next(err); }
}

// PATCH /api/requests/:id/accept
async function acceptRequest(req, res, next) {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found." });
    if (request.status !== "pending") return res.status(409).json({ success: false, message: `Cannot accept a '${request.status}' request.` });
    if (!req.user.isAvailable) return res.status(409).json({ success: false, message: "You already have an active job." });
    request.mechanic = req.user._id; request.status = "accepted"; request.acceptedAt = new Date();
    await request.save();
    await Mechanic.findByIdAndUpdate(req.user._id, { isAvailable: false, activeRequestId: request._id });
    broadcastStatus(request._id, "accepted");
    console.log(`[Request] Accepted requestId=${request._id} by mechanicId=${req.user._id}`);
    res.status(200).json({ success: true, request });
  } catch (err) { next(err); }
}

// PATCH /api/requests/:id/status
async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const ALLOWED = { accepted: ["on_the_way","cancelled"], on_the_way: ["nearby","arrived","cancelled"], nearby: ["arrived","cancelled"], arrived: ["in_progress"], in_progress: ["completed"] };
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found." });
    if (!request.mechanic || request.mechanic.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: "Not your assigned request." });
    const allowed = ALLOWED[request.status] || [];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: `Invalid transition: '${request.status}' → '${status}'.`, allowed });
    if (status === "arrived")   request.arrivedAt = new Date();
    if (status === "completed") { request.completedAt = new Date(); await Mechanic.findByIdAndUpdate(req.user._id, { isAvailable: true, activeRequestId: null }); }
    if (status === "cancelled") { request.cancelledAt = new Date(); request.cancellationReason = req.body.reason || ""; await Mechanic.findByIdAndUpdate(req.user._id, { isAvailable: true, activeRequestId: null }); }
    request.status = status; await request.save();
    broadcastStatus(request._id, status);
    console.log(`[Request] Status updated requestId=${request._id}: ${status}`);
    res.status(200).json({ success: true, request });
  } catch (err) { next(err); }
}

// PATCH /api/requests/:id/cancel
async function cancelRequest(req, res, next) {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found." });
    if (request.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: "Not your request." });
    if (["completed","cancelled"].includes(request.status)) return res.status(409).json({ success: false, message: `Request is already ${request.status}.` });
    request.status = "cancelled"; request.cancelledAt = new Date(); request.cancellationReason = req.body.reason || "Cancelled by user";
    await request.save();
    if (request.mechanic) await Mechanic.findByIdAndUpdate(request.mechanic, { isAvailable: true, activeRequestId: null });
    broadcastStatus(request._id, "cancelled");
    res.status(200).json({ success: true, message: "Request cancelled.", request });
  } catch (err) { next(err); }
}

// POST /api/requests/:id/rate
async function rateRequest(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;
    const { score, comment } = req.body;
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found." });
    if (request.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: "Not your request." });
    if (request.status !== "completed") return res.status(409).json({ success: false, message: "Can only rate completed requests." });
    if (request.rating.score !== null)  return res.status(409).json({ success: false, message: "Already rated." });
    request.rating = { score, comment: comment || "", givenAt: new Date() };
    await request.save();
    if (request.mechanic) {
      const mechanic = await Mechanic.findById(request.mechanic);
      const prevTotal = mechanic.rating.average * mechanic.rating.count;
      mechanic.rating.count += 1;
      mechanic.rating.average = (prevTotal + score) / mechanic.rating.count;
      await mechanic.save();
    }
    console.log(`[Request] Rated requestId=${request._id} score=${score}`);
    res.status(200).json({ success: true, message: "Rating submitted.", rating: request.rating });
  } catch (err) { next(err); }
}

module.exports = { createRequest, getMyRequests, getRequestById, getPendingRequests, acceptRequest, updateStatus, cancelRequest, rateRequest };
