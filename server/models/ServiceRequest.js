const mongoose = require("mongoose");

const SERVICE_TYPES = ["flat_tyre","battery_jump","fuel_delivery","towing","lockout","engine_trouble","accident_support","other"];
const STATUS_FLOW   = ["pending","accepted","on_the_way","nearby","arrived","in_progress","completed","cancelled"];

const serviceRequestSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User",     required: [true, "User is required"] },
    mechanic:    { type: mongoose.Schema.Types.ObjectId, ref: "Mechanic", default: null },
    serviceType: { type: String, enum: SERVICE_TYPES, required: [true, "Service type is required"] },
    description: { type: String, trim: true, maxlength: [500, "Description cannot exceed 500 characters"], default: "" },

    userLocation: {
      type:        { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: [true, "User location coordinates are required"] },
      address:     { type: String, default: "" },
    },

    status:        { type: String, enum: STATUS_FLOW, default: "pending" },
    statusHistory: [
      {
        status:    { type: String, enum: STATUS_FLOW },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: String, default: "system" },
        note:      { type: String, default: "" },
      },
    ],

    estimatedCost:      { type: Number, default: null },
    finalCost:          { type: Number, default: null },
    acceptedAt:         { type: Date,   default: null },
    arrivedAt:          { type: Date,   default: null },
    completedAt:        { type: Date,   default: null },
    cancelledAt:        { type: Date,   default: null },
    cancellationReason: { type: String, default: "" },

    rating: {
      score:   { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, default: "" },
      givenAt: { type: Date,   default: null },
    },
  },
  { timestamps: true, versionKey: false }
);

serviceRequestSchema.index({ userLocation: "2dsphere" });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ user: 1, status: 1 });
serviceRequestSchema.index({ mechanic: 1, status: 1 });

serviceRequestSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusHistory.push({ status: this.status, changedAt: new Date() });
  }
  next();
});

const ServiceRequest = mongoose.model("ServiceRequest", serviceRequestSchema);
module.exports = ServiceRequest;
module.exports.SERVICE_TYPES = SERVICE_TYPES;
module.exports.STATUS_FLOW   = STATUS_FLOW;
