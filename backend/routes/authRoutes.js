const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyEmailOtp, resendEmailOtp } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/verify-email-otp', authLimiter, verifyEmailOtp);
router.post('/resend-email-otp', authLimiter, resendEmailOtp);

module.exports = router;
