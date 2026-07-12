const express = require('express');
const router = express.Router();
const {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  getExpiredDrivers,
  getExpiringDrivers,
  suspendDriver,
  activateDriver,
  getDriverMe,
  getDriverCompliance
} = require('../controllers/driverController');
const { protectRoute } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Specific paths must be defined before wildcard parametric paths like /:id
router.get('/me', protectRoute, authorizeRoles('Driver'), getDriverMe);
router.get('/compliance', protectRoute, authorizeRoles('Safety Officer', 'Admin', 'Fleet Manager'), getDriverCompliance);

// Specialized monitoring endpoints (must come before /:id)
router.get('/expired', protectRoute, authorizeRoles('Safety Officer', 'Admin'), getExpiredDrivers);
router.get('/expiring', protectRoute, authorizeRoles('Safety Officer', 'Admin'), getExpiringDrivers);

router.route('/')
  .get(protectRoute, getAllDrivers)
  .post(protectRoute, authorizeRoles('Safety Officer', 'Admin'), createDriver);

router.route('/:id')
  .get(protectRoute, authorizeRoles('Safety Officer', 'Fleet Manager', 'Admin'), getDriverById)
  .put(protectRoute, authorizeRoles('Safety Officer', 'Admin'), updateDriver)
  .delete(protectRoute, authorizeRoles('Admin'), deleteDriver);

// Action modification routes
router.patch('/:id/suspend', protectRoute, authorizeRoles('Safety Officer', 'Admin'), suspendDriver);
router.patch('/:id/activate', protectRoute, authorizeRoles('Safety Officer', 'Admin'), activateDriver);

module.exports = router;
