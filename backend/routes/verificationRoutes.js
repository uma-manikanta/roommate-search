const express = require('express');
const router = express.Router();
const { sendEmailOTP, verifyEmailOTP, verifyAadhaarEKYC, initiateDigiLocker, verifyDigiLocker } = require('../controllers/verificationController');
const { protect } = require('../middleware/authMiddleware');
const { verifyLimiter } = require('../middleware/rateLimiter');

// Email verification
router.post('/email/send', protect, verifyLimiter, sendEmailOTP);
router.post('/email/confirm', protect, verifyLimiter, verifyEmailOTP);
router.post('/ekyc', protect, verifyAadhaarEKYC);

// Sandbox DigiLocker / Aadhaar verification
router.post('/digilocker/initiate', protect, verifyLimiter, initiateDigiLocker);
router.post('/digilocker', protect, verifyLimiter, verifyDigiLocker);

module.exports = router;
