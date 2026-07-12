const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');
const Expense = require('../models/Expense');

// Logs a new maintenance event and locks the vehicle status to 'In Shop'
const createMaintenance = async (req, res) => {
  try {
    const { vehicleId, vehicle, type, description, cost, startDate } = req.body;

    // Support both vehicleId (frontend) and vehicle (POSTMAN/README)
    const targetVehicleId = vehicleId || vehicle;

    if (!targetVehicleId || !description) {
      return res.status(400).json({ message: 'Please provide vehicle ID and description.' });
    }

    const foundVehicle = await Vehicle.findById(targetVehicleId);
    if (!foundVehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    if (foundVehicle.status === 'Retired') {
      return res.status(400).json({ message: 'Cannot put a retired vehicle in shop.' });
    }

    // Create the maintenance log entry
    const newLog = await MaintenanceLog.create({
      vehicle: targetVehicleId,
      type: type || 'General',
      description,
      cost: cost || 0,
      startDate: startDate || new Date(),
      status: 'Active'
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

    // Reset vehicle status back to 'Available'
    const foundVehicle = await Vehicle.findById(log.vehicle);
    if (foundVehicle && foundVehicle.status !== 'Retired') {
      foundVehicle.status = 'Available';
      await foundVehicle.save();
    }

    // Automatically create a corresponding Expense entry
    await Expense.create({
      vehicle: log.vehicle,
      category: 'Maintenance',
      amount: log.cost,
      date: new Date(),
      description: `Maintenance Closed: ${log.description}`
    });

    // Return the updated maintenance log directly (as expected by frontend FleetContext)
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
