const router = require("express").Router();
const { protect, restrictTo } = require("../middleware/auth.middleware");
const { getProfile, updateProfile, toggleAvailability, getJobHistory } = require("../controllers/mechanic.controller");

router.use(protect, restrictTo("mechanic"));
router.get("/profile",         getProfile);
router.patch("/profile",       updateProfile);
router.patch("/availability",  toggleAvailability);
router.get("/jobs",            getJobHistory);

module.exports = router;
