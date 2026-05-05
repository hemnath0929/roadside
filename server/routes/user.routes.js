const router = require("express").Router();
const { protect, restrictTo } = require("../middleware/auth.middleware");
const { getProfile, updateProfile } = require("../controllers/user.controller");

router.use(protect, restrictTo("user"));
router.get("/profile",   getProfile);
router.patch("/profile", updateProfile);

module.exports = router;
