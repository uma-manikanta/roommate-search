const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { chatGuardMiddleware } = require('../middleware/chatGuardMiddleware');

router.post('/', protect, chatGuardMiddleware, sendMessage);
router.get('/:userId', protect, getChatHistory);

module.exports = router;
