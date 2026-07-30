const express = require('express');
const router = express.Router();
const { generateAgreement } = require('../controllers/agreementController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateAgreement);

module.exports = router;
