const express = require('express');
const router = express.Router();
const {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver
} = require('../controllers/driverController');
const { protectRoute } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protectRoute, getAllDrivers)
  .post(protectRoute, authorizeRoles('SafetyOfficer', 'Admin'), createDriver);

router.route('/:id')
  .get(protectRoute, getDriverById)
  .put(protectRoute, authorizeRoles('SafetyOfficer', 'Admin'), updateDriver)
  .delete(protectRoute, authorizeRoles('SafetyOfficer', 'Admin'), deleteDriver);

module.exports = router;
