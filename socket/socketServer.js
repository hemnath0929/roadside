/**
 * socketServer.js
 * ---------------
 * Entry point for the Socket.IO layer.
 * Call initSocket(httpServer) from your Express server.js to attach Socket.IO.
 *
 * Usage in server.js:
 * ─────────────────────────────────────────
 * const http = require("http");
 * const app  = require("./app"); // your Express app
 * const { initSocket } = require("./socket/socketServer");
 *
 * const httpServer = http.createServer(app);
 * initSocket(httpServer);
 * httpServer.listen(5000, () => console.log("Server running on port 5000"));
 * ─────────────────────────────────────────
 */

const { Server } = require("socket.io");
const { registerTrackingHandlers } = require("./trackingSocket");

let ioInstance = null;

/**
 * Initialise and attach Socket.IO to the given HTTP server.
 * @param {import("http").Server} httpServer
 * @returns {import("socket.io").Server} The Socket.IO server instance
 */
function initSocket(httpServer) {
  if (ioInstance) {
    console.warn("[SocketServer] initSocket() called more than once — returning existing instance.");
    return ioInstance;
  }

  ioInstance = new Server(httpServer, {
    cors: {
      // Allow both the Vite dev server and production origin
      origin: [
        "http://localhost:5173",  // Vite default
        "http://localhost:3000",  // CRA / any alternative frontend
        "http://127.0.0.1:5500", // Live Server (for testClient.html)
        "null",                   // file:// origin (for testClient.html opened locally)
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    // How long (ms) the server waits before closing a disconnecting socket
    pingTimeout: 20000,
    pingInterval: 10000,
  });

  console.log("[SocketServer] Socket.IO server initialised ✅");

  ioInstance.on("connection", (socket) => {
    console.log(
      `[SocketServer] Client connected: socketId=${socket.id} | transport=${socket.conn.transport.name}`
    );

    // Delegate all tracking event handling to the dedicated module
    registerTrackingHandlers(socket, ioInstance);
  });

  return ioInstance;
}

/**
 * Get the already-initialised Socket.IO instance (useful in other modules).
 * Will throw if called before initSocket().
 * @returns {import("socket.io").Server}
 */
function getIO() {
  if (!ioInstance) {
    throw new Error(
      "[SocketServer] Socket.IO not initialised yet. Call initSocket(httpServer) first."
    );
  }
  return ioInstance;
}

module.exports = { initSocket, getIO };
