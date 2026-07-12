const express = require('express');
const router = express.Router();
const {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle
} = require('../controllers/vehicleController');

const { protectRoute } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Protected routes (available to any logged-in user)
router.get('/', protectRoute, getAllVehicles);
router.get('/:id', protectRoute, getVehicleById);

// Restricted actions (requires specific roles)
router.post('/', protectRoute, authorizeRoles('Admin', 'FleetManager'), createVehicle);
router.put('/:id', protectRoute, authorizeRoles('Admin', 'FleetManager'), updateVehicle);
router.delete('/:id', protectRoute, authorizeRoles('Admin'), deleteVehicle);

module.exports = router;
