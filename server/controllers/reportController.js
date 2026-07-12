const Vehicle = require('../models/Vehicle');
const MaintenanceLog = require('../models/MaintenanceLog');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');

const getReportMetrics = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    const expenses = await Expense.find();

    const vehiclesWithMetrics = await Promise.all(vehicles.map(async (v) => {
      const tripsCount = await Trip.countDocuments({ vehicle: v._id });
      const vExpenses = expenses.filter(e => e.vehicle.toString() === v._id.toString());
      const operationalCost = vExpenses.reduce((sum, e) => sum + e.amount, 0);
      
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

    // Calculate report statistics
    const avgFuelEfficiency = vehiclesWithMetrics.length > 0 
      ? (vehiclesWithMetrics.reduce((sum, v) => sum + v.fuelEfficiency, 0) / vehiclesWithMetrics.length).toFixed(1)
      : '0.0';

    const fleetUtilization = vehiclesWithMetrics.length > 0 
      ? Math.round((vehiclesWithMetrics.filter(v => v.status === 'On Trip' || v.status === 'Active').length / vehiclesWithMetrics.length) * 100)
      : 0;

    const totalCost = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    const roiScore = vehiclesWithMetrics.length > 0
      ? (vehiclesWithMetrics.reduce((sum, v) => sum + (v.tripsCount * 12 - v.operationalCost), 0) / vehiclesWithMetrics.length).toFixed(0)
      : '0';

    const acquisitionTotal = vehicles.reduce((sum, v) => sum + v.acquisitionCost, 0);
    const maintenanceTotal = expenses.filter(e => e.category === 'Maintenance').reduce((sum, e) => sum + e.amount, 0);
    const fuelOpsTotal = expenses.filter(e => e.category === 'Fuel' || e.category === 'Toll' || e.category === 'Driver Allowance').reduce((sum, e) => sum + e.amount, 0);

    return res.status(200).json({
      cards: {
        fuelEfficiency: `${avgFuelEfficiency} MPG`,
        fleetUtilization: `${fleetUtilization}%`,
        roiScore: `₹${roiScore}/veh`,
        operationalCost: `₹${totalCost.toLocaleString()}`
      },
      fuelEfficiencyData: vehiclesWithMetrics.map(v => ({ name: v.registrationNumber, efficiency: v.fuelEfficiency })),
      costBreakdown: [
        { name: 'Acquisition', value: acquisitionTotal },
        { name: 'Maintenance', value: maintenanceTotal },
        { name: 'Fuel & Ops', value: fuelOpsTotal }
      ],
      vehicleUsageData: vehiclesWithMetrics.map(v => ({ name: v.registrationNumber, trips: v.tripsCount }))
    });
  } catch (error) {
    console.error('Get report metrics error:', error.message);
    return res.status(500).json({ message: 'Server error while calculating reports metrics.' });
  }
};

module.exports = { getReportMetrics };
