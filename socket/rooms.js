/**
 * rooms.js
 * --------
 * Manages the in-memory registry of request rooms.
 * Tracks which sockets (users / mechanics) have joined which requestId rooms.
 *
 * Room shape:
 * {
 *   [requestId]: {
 *     [socketId]: { userId, role, joinedAt }
 *   }
 * }
 */

const rooms = new Map();

/**
 * Add a socket to a request room.
 * @param {string} requestId
 * @param {string} socketId
 * @param {Object} meta - { userId, role }
 */
function joinRoom(requestId, socketId, meta) {
  if (!rooms.has(requestId)) {
    rooms.set(requestId, new Map());
    console.log(`[Rooms] Created new room for requestId=${requestId}`);
  }
  rooms.get(requestId).set(socketId, {
    ...meta,
    joinedAt: Date.now(),
  });
  console.log(
    `[Rooms] Socket ${socketId} (role=${meta.role}, userId=${meta.userId}) joined room=${requestId}`
  );
}

/**
 * Remove a socket from a specific room.
 * @param {string} requestId
 * @param {string} socketId
 */
function leaveRoom(requestId, socketId) {
  if (!rooms.has(requestId)) return;
  rooms.get(requestId).delete(socketId);
  console.log(`[Rooms] Socket ${socketId} left room=${requestId}`);

  // Auto-clean empty rooms
  if (rooms.get(requestId).size === 0) {
    rooms.delete(requestId);
    console.log(`[Rooms] Room ${requestId} is empty — removed from registry`);
  }
}

/**
 * Remove a socket from ALL rooms it was part of (used on disconnect).
 * @param {string} socketId
 * @returns {string[]} List of requestIds the socket was removed from
 */
function removeSocketFromAllRooms(socketId) {
  const removed = [];
  rooms.forEach((members, requestId) => {
    if (members.has(socketId)) {
      members.delete(socketId);
      removed.push(requestId);
      console.log(
        `[Rooms] Socket ${socketId} auto-removed from room=${requestId} on disconnect`
      );
      if (members.size === 0) {
        rooms.delete(requestId);
        console.log(`[Rooms] Room ${requestId} cleaned up (empty after disconnect)`);
      }
    }
  });
  return removed;
}

/**
 * Get all members of a given request room.
 * @param {string} requestId
 * @returns {Object[]}
 */
function getRoomMembers(requestId) {
  if (!rooms.has(requestId)) return [];
  const result = [];
  rooms.get(requestId).forEach((meta, socketId) => {
    result.push({ socketId, ...meta });
  });
  return result;
}

/**
 * Check if a room exists and has at least one member.
 * @param {string} requestId
 * @returns {boolean}
 */
function roomExists(requestId) {
  return rooms.has(requestId) && rooms.get(requestId).size > 0;
}

/**
 * Return a debug snapshot of all active rooms.
 * @returns {Object}
 */
function debugAllRooms() {
  const snapshot = {};
  rooms.forEach((members, requestId) => {
    snapshot[requestId] = [];
    members.forEach((meta, socketId) => {
      snapshot[requestId].push({ socketId, ...meta });
    });
  });
  return snapshot;
}

module.exports = {
  joinRoom,
  leaveRoom,
  removeSocketFromAllRooms,
  getRoomMembers,
  roomExists,
  debugAllRooms,
};
