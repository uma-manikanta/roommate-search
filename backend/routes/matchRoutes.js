const express = require('express');
const router = express.Router();
const { updateLifestyle, getMatches } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.put('/lifestyle', protect, updateLifestyle);
router.get('/', protect, getMatches);

module.exports = router;
