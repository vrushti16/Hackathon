const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getVehicleRoi,
  exportRoiCsv,
  exportRoiPdf,
  getReportMetrics,
  exportReportPDF,
  getFuelEfficiencyReport,
  getExpenseSummaryReport,
  getTripSummaryReport
} = require('../controllers/reportController');
const { protectRoute } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Dashboard endpoints (Accessible by all logged-in roles)
router.get('/dashboard', protectRoute, getDashboardMetrics);

// ROI and Export reports (Restricted to Admin and Financial Analyst)
router.get('/roi', protectRoute, authorizeRoles('Admin', 'Financial Analyst'), getVehicleRoi);
router.get('/export/csv', protectRoute, authorizeRoles('Admin', 'Financial Analyst'), exportRoiCsv);

// New report types
router.get('/fuel-efficiency', protectRoute, authorizeRoles('Admin', 'Fleet Manager', 'Financial Analyst'), getFuelEfficiencyReport);
router.get('/expense-summary', protectRoute, authorizeRoles('Admin', 'Financial Analyst'), getExpenseSummaryReport);
router.get('/trip-summary', protectRoute, authorizeRoles('Admin', 'Fleet Manager', 'Financial Analyst'), getTripSummaryReport);

// Keep remote endpoints for compatibility
router.get('/metrics', protectRoute, getReportMetrics);
router.get('/export/pdf', protectRoute, authorizeRoles('Admin', 'Financial Analyst'), exportRoiPdf);

module.exports = router;
