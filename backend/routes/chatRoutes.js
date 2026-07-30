const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { sendMessage, getChatHistory, getRecentChats, markAsRead, reportUser, getTotalUnreadCount, editMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const { chatGuardMiddleware } = require('../middleware/chatGuardMiddleware');

// Configure Multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Chat Routes
router.post('/', protect, upload.single('attachment'), chatGuardMiddleware, sendMessage);
router.put('/message/:id', protect, chatGuardMiddleware, editMessage);
router.get('/recent', protect, getRecentChats);
router.get('/unread/count', protect, getTotalUnreadCount);
router.put('/read/:userId', protect, markAsRead);
router.post('/report', protect, reportUser);
router.get('/:userId', protect, getChatHistory);

module.exports = router;
