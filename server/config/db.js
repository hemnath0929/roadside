/**
 * server/config/db.js
 * MongoDB connection using Mongoose.
 */

const mongoose = require("mongoose");

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[DB] MongoDB connected ✅ — host: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[DB] Connection failed ❌: ${err.message}`);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("[DB] MongoDB disconnected. Will attempt to reconnect...");
});

module.exports = { connectDB };
