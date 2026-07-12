const Driver = require('../models/Driver');
const User = require('../models/User');
const Trip = require('../models/Trip');

const createDriver = async (req, res) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, user: userId, email, safetyScore, status } = req.body;

    if (!name || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber) {
      return res.status(400).json({ message: 'Please provide name, licenseNumber, licenseCategory, licenseExpiryDate, and contactNumber.' });
    }

    const existingDriver = await Driver.findOne({ licenseNumber: licenseNumber.toUpperCase() });
    if (existingDriver) {
      return res.status(409).json({ message: 'A driver with this license number already exists.' });
    }

    let linkedUser = undefined;
    if (userId) {
      const userObj = await User.findById(userId);
      if (!userObj) {
        return res.status(404).json({ message: 'Linked User account not found.' });
      }
      if (userObj.role !== 'Driver') {
        return res.status(400).json({ message: 'Only users with the Driver role may be linked to a Driver profile.' });
      }
      const duplicateLink = await Driver.findOne({ user: userId });
      if (duplicateLink) {
        return res.status(400).json({ message: 'This User account is already linked to another Driver profile.' });
      }
      linkedUser = userId;
    }

    const driver = await Driver.create({
      name,
      licenseNumber: licenseNumber.toUpperCase(),
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      user: linkedUser,
      email,
      safetyScore: safetyScore !== undefined ? Number(safetyScore) : 100,
      status: status || 'Available'
    });

    return res.status(201).json(driver);
  } catch (error) {
    console.error('Create driver error:', error.message);
    return res.status(500).json({ message: 'Server error while registering driver.' });
  }
};

const getAllDrivers = async (req, res) => {
  try {
    const { status, safetyScore } = req.query;
    const filterQuery = {};

    if (status) filterQuery.status = status;
    if (safetyScore !== undefined) filterQuery.safetyScore = Number(safetyScore);

    const driversList = await Driver.find(filterQuery).populate('user', 'name email role isActive');
    return res.status(200).json(driversList);
  } catch (error) {
    console.error('Get all drivers error:', error.message);
    return res.status(500).json({ message: 'Server error while retrieving drivers.' });
  }
};

const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found.' });
    }
    return res.status(200).json(driver);
  } catch (error) {
    console.error('Get driver by ID error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching driver details.' });
  }
};

const updateDriver = async (req, res) => {
  try {
    const { name, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status, user: userId } = req.body;

    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found.' });
    }

    if (name) driver.name = name;
    if (licenseCategory) driver.licenseCategory = licenseCategory;
    if (licenseExpiryDate) driver.licenseExpiryDate = licenseExpiryDate;
    if (contactNumber) driver.contactNumber = contactNumber;
    
    if (userId !== undefined) {
      if (userId) {
        const userObj = await User.findById(userId);
        if (!userObj) {
          return res.status(404).json({ message: 'Linked User account not found.' });
        }
        if (userObj.role !== 'Driver') {
          return res.status(400).json({ message: 'Only users with the Driver role may be linked to a Driver profile.' });
        }
        const duplicateLink = await Driver.findOne({ user: userId });
        if (duplicateLink && String(duplicateLink._id) !== String(driver._id)) {
          return res.status(400).json({ message: 'This User account is already linked to another Driver profile.' });
        }
        driver.user = userId;
      } else {
        driver.user = undefined;
      }
    }

    if (safetyScore !== undefined) {
      // Business Rule: Ensure safetyScore limits fall strictly between 0 and 100
      const score = Number(safetyScore);
      if (score < 0 || score > 100) {
        return res.status(400).json({ message: 'Safety score must be between 0 and 100.' });
      }
      driver.safetyScore = score;
    }

    if (status) {
      const allowedStatuses = ['Available', 'On Trip', 'Off Duty', 'Suspended'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
      }
      driver.status = status;
    }

    const updatedDriver = await driver.save();
    return res.status(200).json(updatedDriver);
  } catch (error) {
    console.error('Update driver error:', error.message);
    return res.status(500).json({ message: 'Server error while updating driver profile.' });
  }
};

const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found.' });
    }

    await Driver.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Driver profile successfully removed.' });
  } catch (error) {
    console.error('Delete driver error:', error.message);
    return res.status(500).json({ message: 'Server error while deleting driver.' });
  }
};


const getExpiredDrivers = async (req, res) => {
  try {
    const today = new Date();
    const expiredDrivers = await Driver.find({ licenseExpiryDate: { $lt: today } });
    return res.status(200).json(expiredDrivers);
  } catch (error) {
    console.error('Get expired drivers error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching expired drivers.' });
  }
};

const getExpiringDrivers = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    const expiringDrivers = await Driver.find({
      licenseExpiryDate: { $gte: today, $lte: thirtyDaysLater }
    });
    return res.status(200).json(expiringDrivers);
  } catch (error) {
    console.error('Get expiring drivers error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching expiring drivers.' });
  }
};

const suspendDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found.' });
    }
    driver.status = 'Suspended';
    await driver.save();
    return res.status(200).json(driver);
  } catch (error) {
    console.error('Suspend driver error:', error.message);
    return res.status(500).json({ message: 'Server error while suspending driver.' });
  }
};

const activateDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found.' });
    }
    driver.status = 'Available';
    await driver.save();
    return res.status(200).json(driver);
  } catch (error) {
    console.error('Activate driver error:', error.message);
    return res.status(500).json({ message: 'Server error while activating driver.' });
  }
};

const getDriverMe = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) {
      return res.status(404).json({ message: 'No Driver profile linked to this User account.' });
    }

    // Find active trip and completed trips
    const activeTrip = await Trip.findOne({ driver: driver._id, status: 'Dispatched' }).populate('vehicle');
    const completedTrips = await Trip.find({ driver: driver._id, status: 'Completed' }).populate('vehicle');

    return res.status(200).json({
      driver,
      activeTrip,
      completedTrips
    });
  } catch (error) {
    console.error('Get driver me error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching own driver profile.' });
  }
};

const getDriverCompliance = async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    const expired = await Driver.find({ licenseExpiryDate: { $lt: today } });
    const expiring7 = await Driver.find({ licenseExpiryDate: { $gte: today, $lte: sevenDaysLater } });
    const expiring30 = await Driver.find({ licenseExpiryDate: { $gte: today, $lte: thirtyDaysLater } });
    const suspended = await Driver.find({ status: 'Suspended' });
    const lowSafety = await Driver.find({ safetyScore: { $lt: 75 } });

    return res.status(200).json({
      expiredLicences: expired,
      licencesExpiring7Days: expiring7,
      licencesExpiring30Days: expiring30,
      suspendedDrivers: suspended,
      lowSafetyScoreDrivers: lowSafety
    });
  } catch (error) {
    console.error('Get compliance error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching compliance statistics.' });
  }
};

module.exports = {
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
};
