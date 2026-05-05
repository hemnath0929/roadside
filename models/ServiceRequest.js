/**
 * models/ServiceRequest.js
 * ─────────────────────────
 * The core entity of the application.
 * Created when a user requests roadside assistance.
 * Linked to a User and eventually assigned to a Mechanic.
 */

const mongoose = require("mongoose");

const SERVICE_TYPES = [
  "flat_tyre",
  "battery_jump",
  "fuel_delivery",
  "towing",
  "lockout",
  "engine_trouble",
  "accident_support",
  "other",
];

const STATUS_FLOW = [
  "pending",      // Created, waiting for a mechanic
  "accepted",     // Mechanic accepted the job
  "on_the_way",   // Mechanic is en-route
  "nearby",       // Mechanic is close (optional intermediary)
  "arrived",      // Mechanic reached user location
  "in_progress",  // Service is being performed
  "completed",    // Job done
  "cancelled",    // Cancelled by user or mechanic
];

const serviceRequestSchema = new mongoose.Schema(
  {
    // ── Parties ──────────────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    mechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mechanic",
      default: null,
    },

    // ── Service details ───────────────────────────────────────────────────
    serviceType: {
      type: String,
      enum: SERVICE_TYPES,
      required: [true, "Service type is required"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    // ── Location ──────────────────────────────────────────────────────────
    userLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: [true, "User location coordinates are required"],
      },
      address: {
        type: String,
        default: "",
      },
    },

    // ── Status ────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: STATUS_FLOW,
      default: "pending",
    },

    statusHistory: [
      {
        status:    { type: String, enum: STATUS_FLOW },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: String, default: "system" }, // "user" | "mechanic" | "system"
        note:      { type: String, default: "" },
      },
    ],

    // ── Pricing (optional; filled after completion) ───────────────────────
    estimatedCost: {
      type: Number,
      default: null,
    },

    finalCost: {
      type: Number,
      default: null,
    },

    // ── Timestamps for SLA tracking ───────────────────────────────────────
    acceptedAt:   { type: Date, default: null },
    arrivedAt:    { type: Date, default: null },
    completedAt:  { type: Date, default: null },
    cancelledAt:  { type: Date, default: null },

    cancellationReason: {
      type: String,
      default: "",
    },

    // ── Rating ────────────────────────────────────────────────────────────
    rating: {
      score:   { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, default: "" },
      givenAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Geospatial index for "find requests near mechanic" queries
serviceRequestSchema.index({ userLocation: "2dsphere" });

// ── Index status for fast filtering
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ user: 1, status: 1 });
serviceRequestSchema.index({ mechanic: 1, status: 1 });

// ── Auto-push status to history on every status change
serviceRequestSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusHistory.push({
      status:    this.status,
      changedAt: new Date(),
    });
  }
  next();
});

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);
module.exports.SERVICE_TYPES = SERVICE_TYPES;
module.exports.STATUS_FLOW   = STATUS_FLOW;
