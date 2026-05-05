/**
 * models/Mechanic.js
 * ──────────────────
 * Mongoose schema for a MECHANIC who accepts and fulfils roadside requests.
 * Separate from User to allow different profile fields and approval workflow.
 */

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const mechanicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [80, "Name cannot exceed 80 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    phone: {
      type: String,
      required: [true, "Phone is required"],
      match: [/^\+?[0-9]{10,15}$/, "Enter a valid phone number"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    role: {
      type: String,
      default: "mechanic",
      immutable: true,
    },

    profilePhoto: {
      type: String,
      default: null,
    },

    specializations: {
      // e.g. ["flat_tyre", "battery", "fuel_delivery", "towing"]
      type: [String],
      default: [],
    },

    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count:   { type: Number, default: 0 },
    },

    isAvailable: {
      type: Boolean,
      default: true, // Goes false when actively on a job
    },

    isApproved: {
      type: Boolean,
      default: false, // Admin must approve before mechanic can go live
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    currentLocation: {
      // Updated via socket mechanic-location-update; also stored here for persistence
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },

    vehicleDetails: {
      type: {
        type: String,
        trim: true,
        default: "",
      },
      plateNumber: {
        type: String,
        trim: true,
        default: "",
      },
    },

    activeRequestId: {
      // The request this mechanic is currently servicing (null if idle)
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ── Geospatial index for "find nearest mechanic" queries
mechanicSchema.index({ currentLocation: "2dsphere" });

// ── Hash password before saving
mechanicSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare plain password against hash
mechanicSchema.methods.matchPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// ── Never expose password in JSON responses
mechanicSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("Mechanic", mechanicSchema);
