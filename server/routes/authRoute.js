const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, verifyOtp, resetPassword, getCurrentUserProfile } = require('../controllers/authController');
const { protectRoute } = require('../middleware/authMiddleware');

// Public endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Protected endpoints
router.get('/me', protectRoute, getCurrentUserProfile);

module.exports = router;
