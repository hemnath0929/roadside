/**
 * server/app.js
 * Pure Express application factory. Does NOT start the server.
 */

require("dotenv").config({ path: "../.env" });

const express = require("express");
const cors    = require("cors");
const morgan  = require("morgan");

const authRoutes     = require("./routes/auth.routes");
const userRoutes     = require("./routes/user.routes");
const mechanicRoutes = require("./routes/mechanic.routes");
const requestRoutes  = require("./routes/request.routes");

const { errorHandler, notFound } = require("./middleware/error.middleware");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(",") || ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "Roadside Assistance API",
    status:  "running",
    time:    new Date().toISOString(),
  });
});

app.use("/api/auth",     authRoutes);
app.use("/api/user",     userRoutes);
app.use("/api/mechanic", mechanicRoutes);
app.use("/api/requests", requestRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
