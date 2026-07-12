const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getVehicleRoi,
  exportRoiCsv
} = require('../controllers/reportController');
const { protectRoute } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Dashboard endpoints (Accessible by all logged-in roles)
router.get('/dashboard', protectRoute, getDashboardMetrics);

// ROI and Export reports (Restricted to Admin and Financial Analyst)
router.get('/roi', protectRoute, authorizeRoles('Admin', 'Financial Analyst'), getVehicleRoi);
router.get('/export/csv', protectRoute, authorizeRoles('Admin', 'Financial Analyst'), exportRoiCsv);

module.exports = router;
