const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../controllers/dashboardController');
const { protectRoute } = require('../middleware/authMiddleware');

router.get('/metrics', protectRoute, getDashboardMetrics);

module.exports = router;
