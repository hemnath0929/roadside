const router = require("express").Router();
const { body } = require("express-validator");
const { registerUser, loginUser, registerMechanic, loginMechanic, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const emailV    = body("email").isEmail().withMessage("Valid email required").normalizeEmail();
const passwordV = body("password").isLength({ min: 6 }).withMessage("Password must be ≥ 6 characters");
const nameV     = body("name").trim().notEmpty().withMessage("Name is required");
const phoneV    = body("phone").matches(/^\+?[0-9]{10,15}$/).withMessage("Valid phone number required");

router.post("/register/user",     [nameV, emailV, passwordV, phoneV], registerUser);
router.post("/login/user",        [emailV, passwordV],                  loginUser);
router.post("/register/mechanic", [nameV, emailV, passwordV, phoneV], registerMechanic);
router.post("/login/mechanic",    [emailV, passwordV],                  loginMechanic);
router.get("/me", protect, getMe);

module.exports = router;
