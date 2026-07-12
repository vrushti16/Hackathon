const express = require('express');
const router = express.Router();
const {
  createMaintenance,
  getAllMaintenance,
  closeMaintenance
} = require('../controllers/maintenanceController');

const { protectRoute } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Get all maintenance logs (Authenticated users)
router.get('/', protectRoute, getAllMaintenance);

// Create new maintenance record (FleetManager and Admin)
router.post('/', protectRoute, authorizeRoles('Admin', 'FleetManager'), createMaintenance);

// Close active maintenance log (Supports both POST as per README and PUT as per client frontend)
router.post('/:id/close', protectRoute, authorizeRoles('Admin', 'FleetManager'), closeMaintenance);
router.put('/:id/close', protectRoute, authorizeRoles('Admin', 'FleetManager'), closeMaintenance);

module.exports = router;
