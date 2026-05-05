const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: [true, "Name is required"], trim: true, maxlength: [80, "Name cannot exceed 80 characters"] },
    email:    { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"] },
    phone:    { type: String, required: [true, "Phone number is required"], match: [/^\+?[0-9]{10,15}$/, "Enter a valid phone number"] },
    password: { type: String, required: [true, "Password is required"], minlength: [6, "Password must be at least 6 characters"], select: false },
    role:     { type: String, enum: ["user", "admin"], default: "user" },
    profilePhoto: { type: String, default: null },
    location: {
      type:        { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

userSchema.index({ location: "2dsphere" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
