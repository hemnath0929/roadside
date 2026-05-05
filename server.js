/**
 * server.js
 * ──────────
 * Entry point. Creates the HTTP server, attaches Socket.IO,
 * connects to MongoDB, then starts listening.
 *
 * Run:  node server.js
 * Dev:  nodemon server.js
 */

require("dotenv").config();

const http = require("http");
const app  = require("./app");

const { connectDB }  = require("./config/db");
const { initSocket } = require("./socket/socketServer");

const PORT = process.env.PORT || 5000;

async function startServer() {
  // 1. Connect to MongoDB first
  await connectDB();

  // 2. Wrap Express in an HTTP server so Socket.IO can share it
  const httpServer = http.createServer(app);

  // 3. Attach Socket.IO (must be done before listen)
  initSocket(httpServer);

  // 4. Start listening
  httpServer.listen(PORT, () => {
    console.log("─────────────────────────────────────────────────");
    console.log(`  Roadside Assistance API`);
    console.log(`  REST  → http://localhost:${PORT}/api`);
    console.log(`  WS    → ws://localhost:${PORT}`);
    console.log(`  Env   → ${process.env.NODE_ENV || "development"}`);
    console.log("─────────────────────────────────────────────────");
  });

  // 5. Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("[Server] SIGTERM received — shutting down gracefully.");
    httpServer.close(() => {
      console.log("[Server] HTTP server closed.");
      process.exit(0);
    });
  });
}

startServer().catch((err) => {
  console.error("[Server] Failed to start:", err);
  process.exit(1);
});
