/**
 * socketEvents.js
 * ---------------
 * Single source of truth for all Socket.IO event name constants.
 * Import this file in both server-side handlers and your React frontend
 * to avoid string typos across the codebase.
 */

// ─────────────────────────────────────────────
// CLIENT → SERVER events
// ─────────────────────────────────────────────

/** User or mechanic joins the tracking room for a specific request */
const JOIN_REQUEST_ROOM = "join-request-room";

/** User or mechanic leaves the tracking room explicitly */
const LEAVE_REQUEST_ROOM = "leave-request-room";

/** Mechanic sends their live GPS coords (every ~3 sec) */
const MECHANIC_LOCATION_UPDATE = "mechanic-location-update";

/** Any party updates the high-level request status */
const REQUEST_STATUS_UPDATE = "request-status-update";

/** Mechanic signals they have physically arrived at the user's location */
const MECHANIC_ARRIVED = "mechanic-arrived";

/** Mechanic signals that the service has been completed */
const SERVICE_COMPLETED = "service-completed";

// ─────────────────────────────────────────────
// SERVER → CLIENT events
// ─────────────────────────────────────────────

/** Broadcast latest mechanic GPS coords to all room members */
const MECHANIC_LOCATION_LIVE = "mechanic-location-live";

/** Broadcast request status change to all room members */
const REQUEST_STATUS_LIVE = "request-status-live";

/** Notify room that mechanic has arrived */
const MECHANIC_ARRIVED_LIVE = "mechanic-arrived-live";

/** Notify room that the service is complete */
const SERVICE_COMPLETED_LIVE = "service-completed-live";

/** Sent to a single socket when validation or server logic fails */
const TRACKING_ERROR = "tracking-error";

// ─────────────────────────────────────────────

module.exports = {
  // Client → Server
  JOIN_REQUEST_ROOM,
  LEAVE_REQUEST_ROOM,
  MECHANIC_LOCATION_UPDATE,
  REQUEST_STATUS_UPDATE,
  MECHANIC_ARRIVED,
  SERVICE_COMPLETED,

  // Server → Client
  MECHANIC_LOCATION_LIVE,
  REQUEST_STATUS_LIVE,
  MECHANIC_ARRIVED_LIVE,
  SERVICE_COMPLETED_LIVE,
  TRACKING_ERROR,
};
