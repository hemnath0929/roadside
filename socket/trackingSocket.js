/**
 * trackingSocket.js
 * -----------------
 * Core event handler for the live tracking feature.
 * Registers all Socket.IO listeners for a single connected socket.
 *
 * Called once per new socket connection from socketServer.js.
 */

const {
  JOIN_REQUEST_ROOM,
  LEAVE_REQUEST_ROOM,
  MECHANIC_LOCATION_UPDATE,
  REQUEST_STATUS_UPDATE,
  MECHANIC_ARRIVED,
  SERVICE_COMPLETED,
  MECHANIC_LOCATION_LIVE,
  REQUEST_STATUS_LIVE,
  MECHANIC_ARRIVED_LIVE,
  SERVICE_COMPLETED_LIVE,
  TRACKING_ERROR,
} = require("./socketEvents");

const { setLocation, clearLocation } = require("./locationStore");
const {
  joinRoom,
  leaveRoom,
  removeSocketFromAllRooms,
} = require("./rooms");

// ─────────────────────────────────────────────
// Validation helpers
// ─────────────────────────────────────────────

/**
 * Returns true if lat and lng are valid finite numbers within WGS84 bounds.
 */
function isValidLatLng(lat, lng) {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    isFinite(lat) &&
    isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Returns true if requestId is a non-empty string.
 */
function isValidRequestId(requestId) {
  return typeof requestId === "string" && requestId.trim().length > 0;
}

/**
 * Emit a structured error back to the requesting socket.
 */
function emitError(socket, code, message) {
  socket.emit(TRACKING_ERROR, { code, message, timestamp: Date.now() });
  console.warn(`[TrackingSocket] Error to ${socket.id}: [${code}] ${message}`);
}

// ─────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────

/**
 * Register all tracking event listeners for a single socket connection.
 * @param {import("socket.io").Socket} socket
 * @param {import("socket.io").Server} io
 */
function registerTrackingHandlers(socket, io) {
  console.log(`[TrackingSocket] New connection: socketId=${socket.id}`);

  // ── join-request-room ──────────────────────────────────────────────────
  socket.on(JOIN_REQUEST_ROOM, ({ requestId, userId, role } = {}) => {
    if (!isValidRequestId(requestId)) {
      return emitError(socket, "INVALID_REQUEST_ID", "requestId must be a non-empty string.");
    }
    if (!userId || typeof userId !== "string") {
      return emitError(socket, "INVALID_USER_ID", "userId is required.");
    }
    if (!["user", "mechanic"].includes(role)) {
      return emitError(socket, "INVALID_ROLE", 'role must be "user" or "mechanic".');
    }

    // Register in Socket.IO room
    socket.join(requestId);

    // Register in our memory registry
    joinRoom(requestId, socket.id, { userId, role });

    console.log(
      `[TrackingSocket] ${role.toUpperCase()} ${userId} joined room=${requestId} | socket=${socket.id}`
    );

    // Acknowledge the join
    socket.emit("room-joined", {
      requestId,
      userId,
      role,
      message: `Successfully joined tracking room for request ${requestId}`,
      timestamp: Date.now(),
    });
  });

  // ── leave-request-room ─────────────────────────────────────────────────
  socket.on(LEAVE_REQUEST_ROOM, ({ requestId } = {}) => {
    if (!isValidRequestId(requestId)) {
      return emitError(socket, "INVALID_REQUEST_ID", "requestId must be a non-empty string.");
    }

    socket.leave(requestId);
    leaveRoom(requestId, socket.id);

    console.log(`[TrackingSocket] Socket ${socket.id} explicitly left room=${requestId}`);
  });

  // ── mechanic-location-update ───────────────────────────────────────────
  socket.on(
    MECHANIC_LOCATION_UPDATE,
    ({ requestId, mechanicId, lat, lng, heading = null, speed = null, updatedAt } = {}) => {
      // Validate
      if (!isValidRequestId(requestId)) {
        return emitError(socket, "INVALID_REQUEST_ID", "requestId is required.");
      }
      if (!isValidLatLng(lat, lng)) {
        return emitError(
          socket,
          "INVALID_COORDINATES",
          "lat must be [-90, 90] and lng must be [-180, 180]."
        );
      }
      if (!mechanicId || typeof mechanicId !== "string") {
        return emitError(socket, "INVALID_MECHANIC_ID", "mechanicId is required.");
      }

      const locationPayload = {
        requestId,
        mechanicId,
        lat,
        lng,
        heading,
        speed,
        updatedAt: updatedAt || Date.now(),
      };

      // Persist in memory
      setLocation(requestId, locationPayload);

      // Broadcast to everyone in the request room (including sender)
      io.to(requestId).emit(MECHANIC_LOCATION_LIVE, locationPayload);

      console.log(
        `[TrackingSocket] Location broadcast → room=${requestId} | mechanic=${mechanicId} | (${lat}, ${lng})`
      );
    }
  );

  // ── request-status-update ──────────────────────────────────────────────
  socket.on(REQUEST_STATUS_UPDATE, ({ requestId, status } = {}) => {
    if (!isValidRequestId(requestId)) {
      return emitError(socket, "INVALID_REQUEST_ID", "requestId is required.");
    }
    if (!status || typeof status !== "string") {
      return emitError(socket, "INVALID_STATUS", "status must be a non-empty string.");
    }

    const statusPayload = { requestId, status, updatedAt: Date.now() };

    io.to(requestId).emit(REQUEST_STATUS_LIVE, statusPayload);

    console.log(
      `[TrackingSocket] Status broadcast → room=${requestId} | status=${status}`
    );
  });

  // ── mechanic-arrived ───────────────────────────────────────────────────
  socket.on(MECHANIC_ARRIVED, ({ requestId, mechanicId } = {}) => {
    if (!isValidRequestId(requestId)) {
      return emitError(socket, "INVALID_REQUEST_ID", "requestId is required.");
    }

    const arrivedPayload = {
      requestId,
      mechanicId: mechanicId || "unknown",
      message: "Mechanic has arrived at your location.",
      arrivedAt: Date.now(),
    };

    io.to(requestId).emit(MECHANIC_ARRIVED_LIVE, arrivedPayload);

    console.log(
      `[TrackingSocket] Mechanic arrived → room=${requestId} | mechanic=${mechanicId}`
    );
  });

  // ── service-completed ──────────────────────────────────────────────────
  socket.on(SERVICE_COMPLETED, ({ requestId, mechanicId, summary } = {}) => {
    if (!isValidRequestId(requestId)) {
      return emitError(socket, "INVALID_REQUEST_ID", "requestId is required.");
    }

    const completedPayload = {
      requestId,
      mechanicId: mechanicId || "unknown",
      summary: summary || "Service has been completed.",
      completedAt: Date.now(),
    };

    io.to(requestId).emit(SERVICE_COMPLETED_LIVE, completedPayload);

    // Clean up location from store as the job is done
    clearLocation(requestId);

    console.log(
      `[TrackingSocket] Service completed → room=${requestId} | mechanic=${mechanicId}`
    );
  });

  // ── disconnect ─────────────────────────────────────────────────────────
  socket.on("disconnect", (reason) => {
    console.log(
      `[TrackingSocket] Socket disconnected: ${socket.id} | reason=${reason}`
    );

    // Remove from all rooms and notify remaining room members if needed
    const affectedRooms = removeSocketFromAllRooms(socket.id);

    affectedRooms.forEach((requestId) => {
      // Optionally notify room about the disconnect (useful for UX)
      io.to(requestId).emit("member-disconnected", {
        socketId: socket.id,
        requestId,
        timestamp: Date.now(),
      });
    });
  });
}

module.exports = { registerTrackingHandlers };
