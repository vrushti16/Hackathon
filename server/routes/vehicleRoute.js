const express = require('express');
const router = express.Router();
const {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  bulkDeleteVehicles
} = require('../controllers/vehicleController');

const { protectRoute } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Protected routes (available to any logged-in user)
router.get('/', protectRoute, getAllVehicles);
router.get('/:id', protectRoute, getVehicleById);

// Restricted actions (requires specific roles)
router.post('/', protectRoute, authorizeRoles('Admin', 'Fleet Manager'), createVehicle);
router.post('/bulk-delete', protectRoute, authorizeRoles('Admin', 'Fleet Manager'), bulkDeleteVehicles);
router.put('/:id', protectRoute, authorizeRoles('Admin', 'Fleet Manager'), updateVehicle);
router.delete('/:id', protectRoute, authorizeRoles('Admin'), deleteVehicle);

module.exports = router;
