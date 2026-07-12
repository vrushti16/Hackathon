const Driver = require('../models/Driver');

const createDriver = async (req, res) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber } = req.body;

    if (!name || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber) {
      return res.status(400).json({ message: 'Please provide name, licenseNumber, licenseCategory, licenseExpiryDate, and contactNumber.' });
    }

    const existingDriver = await Driver.findOne({ licenseNumber: licenseNumber.toUpperCase() });
    if (existingDriver) {
      return res.status(409).json({ message: 'A driver with this license number already exists.' });
    }

    const driver = await Driver.create({
      name,
      licenseNumber: licenseNumber.toUpperCase(),
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore: 100,
      status: 'Available'
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

    const driversList = await Driver.find(filterQuery);
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
    const { name, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status } = req.body;

    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found.' });
    }

    if (name) driver.name = name;
    if (licenseCategory) driver.licenseCategory = licenseCategory;
    if (licenseExpiryDate) driver.licenseExpiryDate = licenseExpiryDate;
    if (contactNumber) driver.contactNumber = contactNumber;
    
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

module.exports = {
  createDriver,
  getAllDrivers,
  getDriverById,
  updateDriver,
  deleteDriver
};
