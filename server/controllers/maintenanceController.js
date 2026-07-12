const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');
const Expense = require('../models/Expense');
const Trip = require('../models/Trip');

// Logs a new maintenance event and locks the vehicle status to 'In Shop'
const createMaintenance = async (req, res) => {
  try {
    const { vehicleId, vehicle, type, description, cost, startDate, status } = req.body;

    const targetVehicleId = vehicleId || vehicle;

    if (!targetVehicleId || !description) {
      return res.status(400).json({ message: 'Please provide vehicle ID and description.' });
    }

    if (cost !== undefined && cost < 0) {
      return res.status(400).json({ message: 'Maintenance cost cannot be negative.' });
    }

    const foundVehicle = await Vehicle.findById(targetVehicleId);
    if (!foundVehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    if (foundVehicle.status === 'Retired') {
      return res.status(400).json({ message: 'Cannot put a retired vehicle in shop.' });
    }

    // Validation: Vehicle must not be on an active trip
    const activeTrip = await Trip.findOne({ vehicle: targetVehicleId, status: 'Dispatched' });
    if (activeTrip) {
      return res.status(400).json({ message: 'Cannot place vehicle in maintenance while it is on an active trip.' });
    }

    // Validation: Vehicle must not already have another active maintenance record
    const activeMaintenance = await MaintenanceLog.findOne({ vehicle: targetVehicleId, status: 'Active' });
    if (activeMaintenance) {
      return res.status(400).json({ message: 'Vehicle already has an active maintenance record.' });
    }

    const normalizedStatus = status === 'Open' ? 'Active' : status === 'Closed' ? 'Closed' : 'Active';

    // Create the maintenance log entry
    const newLog = await MaintenanceLog.create({
      vehicle: targetVehicleId,
      type: type || 'General',
      description,
      cost: cost || 0,
      startDate: startDate || new Date(),
      status: normalizedStatus
    });

    // Automatically update the vehicle's status to 'In Shop'
    foundVehicle.status = 'In Shop';
    await foundVehicle.save();

    return res.status(201).json(newLog);
  } catch (error) {
    console.error('Create maintenance error:', error.message);
    return res.status(500).json({ message: 'Server error while creating maintenance log.' });
  }
};

// Lists all active and closed maintenance logs
const getAllMaintenance = async (req, res) => {
  try {
    const logs = await MaintenanceLog.find().populate('vehicle');
    return res.status(200).json(logs);
  } catch (error) {
    console.error('Get all maintenance error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching maintenance logs.' });
  }
};

// Closes a maintenance log, updates vehicle status to 'Available', and creates a corresponding expense
const closeMaintenance = async (req, res) => {
  try {
    const logId = req.params.id;

    const log = await MaintenanceLog.findById(logId);
    if (!log) {
      return res.status(404).json({ message: 'Maintenance log not found.' });
    }

    if (log.status === 'Closed') {
      return res.status(400).json({ message: 'Maintenance log is already closed.' });
    }

    // Close the log
    log.status = 'Closed';
    log.endDate = new Date();
    await log.save();

    // Reset vehicle status back to 'Available' (only if no other active maintenance exists)
    const activeMaintenanceExists = await MaintenanceLog.findOne({ vehicle: log.vehicle, status: 'Active', _id: { $ne: logId } });
    if (!activeMaintenanceExists) {
      const foundVehicle = await Vehicle.findById(log.vehicle);
      if (foundVehicle && foundVehicle.status !== 'Retired') {
        foundVehicle.status = 'Available';
        await foundVehicle.save();
      }
    }

    // Automatically create a corresponding Expense entry (preventing duplicate expense)
    const existingExpense = await Expense.findOne({ maintenance: logId });
    if (!existingExpense) {
      await Expense.create({
        vehicle: log.vehicle,
        maintenance: log._id,
        category: 'Maintenance',
        amount: log.cost,
        date: new Date(),
        description: `Maintenance Closed: ${log.description}`
      });
    }

    return res.status(200).json(log);
  } catch (error) {
    console.error('Close maintenance error:', error.message);
    return res.status(500).json({ message: 'Server error while closing maintenance log.' });
  }
};

module.exports = {
  createMaintenance,
  getAllMaintenance,
  closeMaintenance
};
