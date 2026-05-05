/**
 * config/db.js
 * ─────────────
 * MongoDB connection using Mongoose.
 * Call connectDB() once at server startup.
 */

const mongoose = require("mongoose");

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These are the recommended Mongoose 8 options
    });
    console.log(`[DB] MongoDB connected ✅ — host: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[DB] Connection failed ❌: ${err.message}`);
    process.exit(1); // Exit so process manager restarts the app
  }
}

// Log future disconnects for debugging
mongoose.connection.on("disconnected", () => {
  console.warn("[DB] MongoDB disconnected. Will attempt to reconnect...");
});

module.exports = { connectDB };
