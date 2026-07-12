const express = require('express');
const router = express.Router();
const { getReportMetrics } = require('../controllers/reportController');
const { protectRoute } = require('../middleware/authMiddleware');

router.get('/metrics', protectRoute, getReportMetrics);

module.exports = router;
