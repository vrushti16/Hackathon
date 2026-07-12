const FuelLog = require('../models/FuelLog');
const Expense = require('../models/Expense');
const Vehicle = require('../models/Vehicle');

// ─── FUEL LOG ENDPOINTS ─────────────────────────────────────────────

// POST /api/expenses/fuel — Record a fuel fill-up (also auto-creates an Expense entry)
const createFuelLog = async (req, res) => {
  try {
    const { vehicleId, liters, cost, date, odometerAtLog } = req.body;

    if (!vehicleId || !liters || !cost || !odometerAtLog) {
      return res.status(400).json({ message: 'vehicleId, liters, cost, and odometerAtLog are required.' });
    }

    if (liters <= 0 || cost <= 0) {
      return res.status(400).json({ message: 'Liters and cost must be positive numbers.' });
    }

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    // Odometer validation: new reading must be >= current odometer
    if (odometerAtLog < vehicle.odometer) {
      return res.status(400).json({
        message: `Odometer reading (${odometerAtLog}) cannot be less than the vehicle's current odometer (${vehicle.odometer}).`
      });
    }

    // Create fuel log
    const fuelLog = await FuelLog.create({
      vehicle: vehicleId,
      liters,
      cost,
      date: date || Date.now(),
      odometerAtLog
    });

    // Auto-create a corresponding Expense entry (category: 'Fuel')
    await Expense.create({
      vehicle: vehicleId,
      category: 'Fuel',
      amount: cost,
      date: date || Date.now(),
      description: `Fuel fill-up: ${liters}L at ₹${cost} (Odometer: ${odometerAtLog} km)`
    });

    // Update vehicle odometer to latest reading
    vehicle.odometer = odometerAtLog;
    await vehicle.save();

    return res.status(201).json(fuelLog);
  } catch (error) {
    console.error('Create fuel log error:', error.message);
    return res.status(500).json({ message: 'Server error creating fuel log.' });
  }
};

// GET /api/expenses/fuel — List all fuel logs (optionally filter by vehicleId)
const getFuelLogs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.vehicleId) {
      filter.vehicle = req.query.vehicleId;
    }

    const fuelLogs = await FuelLog.find(filter)
      .populate('vehicle', 'registrationNumber modelName type')
      .sort({ date: -1 });

    return res.status(200).json(fuelLogs);
  } catch (error) {
    console.error('Get fuel logs error:', error.message);
    return res.status(500).json({ message: 'Server error fetching fuel logs.' });
  }
};

// GET /api/expenses/fuel/:id — Get a single fuel log
const getFuelLogById = async (req, res) => {
  try {
    const fuelLog = await FuelLog.findById(req.params.id)
      .populate('vehicle', 'registrationNumber modelName type');

    if (!fuelLog) {
      return res.status(404).json({ message: 'Fuel log not found.' });
    }

    return res.status(200).json(fuelLog);
  } catch (error) {
    console.error('Get fuel log error:', error.message);
    return res.status(500).json({ message: 'Server error fetching fuel log.' });
  }
};

// DELETE /api/expenses/fuel/:id — Delete a fuel log
const deleteFuelLog = async (req, res) => {
  try {
    const fuelLog = await FuelLog.findById(req.params.id);
    if (!fuelLog) {
      return res.status(404).json({ message: 'Fuel log not found.' });
    }

    await FuelLog.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Fuel log deleted successfully.' });
  } catch (error) {
    console.error('Delete fuel log error:', error.message);
    return res.status(500).json({ message: 'Server error deleting fuel log.' });
  }
};

// ─── EXPENSE ENDPOINTS ──────────────────────────────────────────────

// POST /api/expenses — Log a direct expense (toll, insurance, driver allowance, etc.)
const createExpense = async (req, res) => {
  try {
    const { vehicleId, tripId, category, amount, date, description } = req.body;

    if (!vehicleId || !category || !amount || !description) {
      return res.status(400).json({ message: 'vehicleId, category, amount, and description are required.' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number.' });
    }

    const validCategories = ['Fuel', 'Maintenance', 'Toll', 'Driver Allowance', 'Insurance', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
    }

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    const expense = await Expense.create({
      vehicle: vehicleId,
      trip: tripId || undefined,
      category,
      amount,
      date: date || Date.now(),
      description
    });

    return res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error.message);
    return res.status(500).json({ message: 'Server error creating expense.' });
  }
};

// GET /api/expenses — List all expenses (supports filters: vehicleId, category)
const getExpenses = async (req, res) => {
  try {
    const filter = {};
    if (req.query.vehicleId) {
      filter.vehicle = req.query.vehicleId;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const expenses = await Expense.find(filter)
      .populate('vehicle', 'registrationNumber modelName type')
      .populate('trip', 'source destination status')
      .sort({ date: -1 });

    return res.status(200).json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error.message);
    return res.status(500).json({ message: 'Server error fetching expenses.' });
  }
};

// GET /api/expenses/vehicle/:vehicleId — Full cost breakdown for a specific vehicle
const getVehicleCostBreakdown = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    const expenses = await Expense.find({ vehicle: vehicleId }).sort({ date: -1 });

    // Aggregate totals by category
    const breakdown = {};
    let totalCost = 0;

    expenses.forEach(exp => {
      if (!breakdown[exp.category]) {
        breakdown[exp.category] = { total: 0, count: 0 };
      }
      breakdown[exp.category].total += exp.amount;
      breakdown[exp.category].count += 1;
      totalCost += exp.amount;
    });

    // Fuel efficiency from fuel logs
    const fuelLogs = await FuelLog.find({ vehicle: vehicleId }).sort({ date: -1 });
    const totalLiters = fuelLogs.reduce((sum, log) => sum + log.liters, 0);
    const totalFuelCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);

    return res.status(200).json({
      vehicle: {
        id: vehicle._id,
        registrationNumber: vehicle.registrationNumber,
        modelName: vehicle.modelName,
        odometer: vehicle.odometer
      },
      summary: {
        totalCost,
        totalFuelLiters: totalLiters,
        totalFuelCost,
        averageFuelPrice: totalLiters > 0 ? Math.round(totalFuelCost / totalLiters * 100) / 100 : 0,
        expenseCount: expenses.length
      },
      breakdown,
      recentExpenses: expenses.slice(0, 10),
      recentFuelLogs: fuelLogs.slice(0, 10)
    });
  } catch (error) {
    console.error('Get vehicle cost breakdown error:', error.message);
    return res.status(500).json({ message: 'Server error fetching vehicle cost breakdown.' });
  }
};

// DELETE /api/expenses/:id — Delete an expense
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found.' });
    }

    await Expense.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Expense deleted successfully.' });
  } catch (error) {
    console.error('Delete expense error:', error.message);
    return res.status(500).json({ message: 'Server error deleting expense.' });
  }
};

module.exports = {
  createFuelLog,
  getFuelLogs,
  getFuelLogById,
  deleteFuelLog,
  createExpense,
  getExpenses,
  getVehicleCostBreakdown,
  deleteExpense
};
