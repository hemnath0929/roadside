const { validationResult } = require("express-validator");
const User       = require("../models/User");
const Mechanic   = require("../models/Mechanic");
const { signToken } = require("../utils/jwt.utils");

function sendToken(account, statusCode, res) {
  const token = signToken({ id: account._id, role: account.role });
  res.status(statusCode).json({ success: true, token, user: account });
}

function checkValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(422).json({ success: false, errors: errors.array() }); return false; }
  return true;
}

async function registerUser(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;
    const { name, email, phone, password } = req.body;
    if (await User.findOne({ email })) return res.status(409).json({ success: false, message: "Email already registered." });
    const user = await User.create({ name, email, phone, password });
    console.log(`[Auth] New user registered: ${user.email}`);
    sendToken(user, 201, res);
  } catch (err) { next(err); }
}

async function loginUser(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ success: false, message: "Invalid email or password." });
    if (!user.isActive) return res.status(403).json({ success: false, message: "Your account has been deactivated." });
    console.log(`[Auth] User login: ${user.email}`);
    sendToken(user, 200, res);
  } catch (err) { next(err); }
}

async function registerMechanic(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;
    const { name, email, phone, password, specializations, vehicleDetails } = req.body;
    if (await Mechanic.findOne({ email })) return res.status(409).json({ success: false, message: "Email already registered." });
    const mechanic = await Mechanic.create({ name, email, phone, password, specializations: specializations || [], vehicleDetails: vehicleDetails || {} });
    console.log(`[Auth] New mechanic registered: ${mechanic.email} (pending approval)`);
    res.status(201).json({ success: true, message: "Registration submitted. Await admin approval.", mechanicId: mechanic._id });
  } catch (err) { next(err); }
}

async function loginMechanic(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;
    const { email, password } = req.body;
    const mechanic = await Mechanic.findOne({ email }).select("+password");
    if (!mechanic || !(await mechanic.matchPassword(password))) return res.status(401).json({ success: false, message: "Invalid email or password." });
    if (!mechanic.isApproved) return res.status(403).json({ success: false, message: "Your account is pending admin approval." });
    if (!mechanic.isActive)   return res.status(403).json({ success: false, message: "Your account has been deactivated." });
    console.log(`[Auth] Mechanic login: ${mechanic.email}`);
    sendToken(mechanic, 200, res);
  } catch (err) { next(err); }
}

async function getMe(req, res) {
  res.status(200).json({ success: true, user: req.user });
}

module.exports = { registerUser, loginUser, registerMechanic, loginMechanic, getMe };
