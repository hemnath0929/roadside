/**
 * server/server.js
 * Entry point. Creates HTTP server, attaches Socket.IO, connects MongoDB.
 *
 * Run:  node server.js   (from inside server/)
 * Dev:  nodemon server.js
 */

require("dotenv").config({ path: "../.env" }); // .env lives at repo root

const http = require("http");
const app  = require("./app");

const { connectDB }  = require("./config/db");
const { initSocket } = require("../socket/socketServer"); // socket/ is at repo root

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  const httpServer = http.createServer(app);

  initSocket(httpServer); // Attach Socket.IO before listen

  httpServer.listen(PORT, () => {
    console.log("─────────────────────────────────────────────────");
    console.log("  Roadside Assistance API — server/");
    console.log(`  REST  → http://localhost:${PORT}/api`);
    console.log(`  WS    → ws://localhost:${PORT}`);
    console.log(`  Env   → ${process.env.NODE_ENV || "development"}`);
    console.log("─────────────────────────────────────────────────");
  });

  process.on("SIGTERM", () => {
    console.log("[Server] Shutting down gracefully…");
    httpServer.close(() => process.exit(0));
  });
}

startServer().catch((err) => {
  console.error("[Server] Failed to start:", err);
  process.exit(1);
});
