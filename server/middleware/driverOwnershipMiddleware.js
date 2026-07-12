const Driver = require('../models/Driver');
const Trip = require('../models/Trip');

const verifyAssignedDriver = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Find the driver profile linked to this user's email
    const driver = await Driver.findOne({ email: req.user.email.toLowerCase() });
    if (!driver) {
      return res.status(403).json({
        success: false,
        message: 'Driver profile not found'
      });
    }

    req.driverProfile = driver;

    // If a Trip ID is present in the route parameters, verify ownership
    if (req.params.id) {
      const trip = await Trip.findById(req.params.id);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found'
        });
      }

      // Check ownership
      if (trip.driver.toString() !== driver._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You cannot access another driver's trip"
        });
      }

      req.trip = trip;
    }

    next();
  } catch (error) {
    console.error('Driver ownership validation error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during driver verification.'
    });
  }
};

module.exports = { verifyAssignedDriver };
