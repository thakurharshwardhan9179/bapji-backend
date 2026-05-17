const express = require("express");
const { sendOtp, verifyOtp } = require("../controllers/otpController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send", protect ,sendOtp);
router.post("/verify", protect , verifyOtp);

module.exports = router;