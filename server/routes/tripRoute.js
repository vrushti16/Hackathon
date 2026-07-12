const express = require('express');
const router = express.Router();
const {
  createTrip,
  getAllTrips,
  dispatchTrip,
  completeTrip,
  cancelTrip
} = require('../controllers/tripController');

const { protectRoute } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');


router.get('/', protectRoute, getAllTrips);
router.post('/', protectRoute, authorizeRoles('Driver', 'Admin'), createTrip);
router.post('/:id/dispatch', protectRoute, authorizeRoles('Driver', 'Admin'), dispatchTrip);
router.post('/:id/complete', protectRoute, authorizeRoles('Driver', 'Admin'), completeTrip);
router.post('/:id/cancel', protectRoute, authorizeRoles('Driver', 'Admin'), cancelTrip);

module.exports = router;
