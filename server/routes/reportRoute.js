const express = require('express');
const router = express.Router();
const {
    getReportMetrics,
    exportReportCSV,
    exportReportPDF
} = require('../controllers/reportController');
const { protectRoute } = require('../middleware/authMiddleware');

router.get('/metrics', protectRoute, getReportMetrics);
router.get('/export/csv', protectRoute, exportReportCSV);
router.get('/export/pdf', exportReportPDF);

module.exports = router;

