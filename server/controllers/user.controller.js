const User = require("../models/User");

async function getProfile(req, res) {
  res.status(200).json({ success: true, user: req.user });
}

async function updateProfile(req, res, next) {
  try {
    const allowed = ["name", "phone", "profilePhoto"];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
}

module.exports = { getProfile, updateProfile };
