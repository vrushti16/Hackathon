const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getCurrentUserProfile } = require('../controllers/authController');
const { protectRoute } = require('../middleware/authMiddleware');

// Public endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected endpoints
router.get('/me', protectRoute, getCurrentUserProfile);

module.exports = router;
