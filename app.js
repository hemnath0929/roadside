/**
 * app.js
 * ───────
 * Pure Express application factory.
 * Does NOT start the server — server.js does that.
 * This separation allows easy testing without binding to a port.
 */

require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const morgan  = require("morgan");

const authRoutes     = require("./routes/auth.routes");
const userRoutes     = require("./routes/user.routes");
const mechanicRoutes = require("./routes/mechanic.routes");
const requestRoutes  = require("./routes/request.routes");

const { errorHandler, notFound } = require("./middleware/error.middleware");

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") || ["http://localhost:5173"],
    credentials: true,
  })
);

// ── Request parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ── HTTP logging (dev only) ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ── Health check (no auth needed) ────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "Roadside Assistance API",
    status:  "running",
    time:    new Date().toISOString(),
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/user",     userRoutes);
app.use("/api/mechanic", mechanicRoutes);
app.use("/api/requests", requestRoutes);

// ── 404 & error handling (must be last) ──────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
