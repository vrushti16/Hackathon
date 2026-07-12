const Vehicle = require('../models/Vehicle');
const MaintenanceLog = require('../models/MaintenanceLog');
const Expense = require('../models/Expense');
const Trip = require('../models/Trip');

const createVehicle = async (req, res) => {
  try {
    const { registrationNumber, modelName, type, maxLoadCapacity, odometer, acquisitionCost, region } = req.body;

    if (!registrationNumber || !modelName || !type || !maxLoadCapacity || odometer === undefined || !acquisitionCost || !region) {
      return res.status(400).json({ message: 'Please provide all required vehicle registry fields.' });
    }

    const existingVehicle = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase() });
    if (existingVehicle) {
      return res.status(409).json({ message: 'A vehicle with this registration number already exists.' });
    }

    const vehicle = await Vehicle.create({
      registrationNumber: registrationNumber.toUpperCase(),
      modelName,
      type,
      maxLoadCapacity,
      odometer,
      acquisitionCost,
      region,
      status: 'Available'
    });

    return res.status(201).json(vehicle);
  } catch (error) {
    console.error('Create vehicle error:', error.message);
    return res.status(500).json({ message: 'Server error while creating vehicle.' });
  }
};

const getAllVehicles = async (req, res) => {
  try {
    const { type, status, region } = req.query;
    const filterQuery = {};

    if (type) filterQuery.type = type;
    if (status) filterQuery.status = status;
    if (region) filterQuery.region = region;

    const vehiclesList = await Vehicle.find(filterQuery);
    const vehiclesWithMetrics = await Promise.all(vehiclesList.map(async (v) => {
      const tripsCount = await Trip.countDocuments({ vehicle: v._id });
      const expenses = await Expense.find({ vehicle: v._id });
      const operationalCost = expenses.reduce((sum, e) => sum + e.amount, 0);
      const efficiency = v.type.includes('Electric') || v.modelName.toLowerCase().includes('electric')
        ? 95.0 
        : (['Semi-Truck', 'Box-Truck', 'Flatbed'].includes(v.type) ? 6.5 : 12.0);

      return {
        ...v.toObject(),
        fuelEfficiency: efficiency,
        tripsCount,
        operationalCost
      };
    }));

    return res.status(200).json(vehiclesWithMetrics);
  } catch (error) {
    console.error('Get all vehicles error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching vehicles list.' });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const v = await Vehicle.findById(req.params.id);
    if (!v) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }
    
    const tripsCount = await Trip.countDocuments({ vehicle: v._id });
    const expenses = await Expense.find({ vehicle: v._id });
    const operationalCost = expenses.reduce((sum, e) => sum + e.amount, 0);
    const efficiency = v.type.includes('Electric') || v.modelName.toLowerCase().includes('electric')
      ? 95.0 
      : (['Semi-Truck', 'Box-Truck', 'Flatbed'].includes(v.type) ? 6.5 : 12.0);

    const vehicleWithMetrics = {
      ...v.toObject(),
      fuelEfficiency: efficiency,
      tripsCount,
      operationalCost
    };

    return res.status(200).json(vehicleWithMetrics);
  } catch (error) {
    console.error('Get vehicle by ID error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching vehicle details.' });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { modelName, type, maxLoadCapacity, odometer, acquisitionCost, status, region } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    if (modelName) vehicle.modelName = modelName;
    if (type) vehicle.type = type;
    if (maxLoadCapacity) vehicle.maxLoadCapacity = maxLoadCapacity;
    if (odometer !== undefined) {
      // Business Rule: Ensure odometer reading cannot be rolled back or updated to a lower value
      if (odometer < vehicle.odometer) {
        return res.status(400).json({ message: 'Odometer reading cannot be updated to a lower value than the current reading.' });
      }
      vehicle.odometer = odometer;
    }
    if (acquisitionCost) vehicle.acquisitionCost = acquisitionCost;
    if (status) vehicle.status = status;
    if (region) vehicle.region = region;

    const updatedVehicle = await vehicle.save();
    return res.status(200).json(updatedVehicle);
  } catch (error) {
    console.error('Update vehicle error:', error.message);
    return res.status(500).json({ message: 'Server error while updating vehicle details.' });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    await MaintenanceLog.deleteMany({ vehicle: req.params.id });
    await Vehicle.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Vehicle successfully removed from registry.' });
  } catch (error) {
    console.error('Delete vehicle error:', error.message);
    return res.status(500).json({ message: 'Server error while deleting vehicle.' });
  }
};

const bulkDeleteVehicles = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'A non-empty ids array is required.' });
    }

    await MaintenanceLog.deleteMany({ vehicle: { $in: ids } });
    await Vehicle.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({ message: `${ids.length} vehicles successfully removed from registry.` });
  } catch (error) {
    console.error('Bulk delete vehicles error:', error.message);
    return res.status(500).json({ message: 'Server error while deleting vehicles.' });
  }
};

module.exports = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  bulkDeleteVehicles
};
