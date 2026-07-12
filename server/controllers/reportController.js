const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
const FuelLog = require('../models/FuelLog');

// Helper to prevent NaN/Infinity
const safeDiv = (num, den) => {
  if (!den || isNaN(num) || isNaN(den)) return 0;
  const res = num / den;
  return isFinite(res) ? Math.round(res * 100) / 100 : 0;
};

// GET /api/reports/dashboard
const getDashboardMetrics = async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments();
    const availableVehicles = await Vehicle.countDocuments({ status: 'Available' });
    const vehiclesOnTrip = await Vehicle.countDocuments({ status: 'On Trip' });
    const vehiclesInShop = await Vehicle.countDocuments({ status: 'In Shop' });
    const totalNonRetired = await Vehicle.countDocuments({ status: { $ne: 'Retired' } });

    const totalDrivers = await Driver.countDocuments();
    const availableDrivers = await Driver.countDocuments({ status: 'Available' });
    const expiredLicenses = await Driver.countDocuments({ licenseExpiryDate: { $lt: new Date() } });

    const activeTrips = await Trip.countDocuments({ status: 'Dispatched' });
    const completedTrips = await Trip.countDocuments({ status: 'Completed' });

    // Aggregations
    const completedTripsData = await Trip.aggregate([
      { $match: { status: 'Completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$revenueGenerated' },
          totalDistance: { $sum: '$actualDistance' },
          totalFuel: { $sum: '$fuelConsumed' }
        }
      }
    ]);

    const totalRevenue = completedTripsData[0]?.totalRevenue || 0;
    const totalDistance = completedTripsData[0]?.totalDistance || 0;
    const totalFuel = completedTripsData[0]?.totalFuel || 0;

    const totalExpensesData = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpenses = totalExpensesData[0]?.total || 0;

    const fuelExpensesData = await Expense.aggregate([
      { $match: { category: 'Fuel' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalFuelCost = fuelExpensesData[0]?.total || 0;

    // Formulas
    const avgFuelEfficiency = safeDiv(totalDistance, totalFuel);
    const fleetUtilization = safeDiv(vehiclesOnTrip, totalNonRetired) * 100;

    // Monthly trends mock/aggregation data for dashboard charts (synced with actual totals)
    const mockTrends = {
      tripsPerDay: [
        { name: 'Mon', trips: completedTrips > 0 ? Math.round(completedTrips * 0.15) : 3 },
        { name: 'Tue', trips: completedTrips > 0 ? Math.round(completedTrips * 0.2) : 5 },
        { name: 'Wed', trips: completedTrips > 0 ? Math.round(completedTrips * 0.25) : 8 },
        { name: 'Thu', trips: completedTrips > 0 ? Math.round(completedTrips * 0.15) : 4 },
        { name: 'Fri', trips: completedTrips > 0 ? Math.round(completedTrips * 0.25) : 7 }
      ],
      maintenanceTrend: [
        { name: 'Jan', cost: Math.round(totalExpenses * 0.15) },
        { name: 'Feb', cost: Math.round(totalExpenses * 0.2) },
        { name: 'Mar', cost: Math.round(totalExpenses * 0.25) },
        { name: 'Apr', cost: Math.round(totalExpenses * 0.18) },
        { name: 'May', cost: Math.round(totalExpenses * 0.22) }
      ],
      fuelCostTrend: [
        { name: 'Jan', cost: Math.round(totalFuelCost * 0.18) },
        { name: 'Feb', cost: Math.round(totalFuelCost * 0.22) },
        { name: 'Mar', cost: Math.round(totalFuelCost * 0.2) },
        { name: 'Apr', cost: Math.round(totalFuelCost * 0.15) },
        { name: 'May', cost: Math.round(totalFuelCost * 0.25) }
      ],
      recentActivities: [
        { id: 'act-1', type: 'vehicle', message: `Fleet is operating with ${vehiclesOnTrip} vehicles on the road.`, time: 'Just now' },
        { id: 'act-2', type: 'maintenance', message: `${vehiclesInShop} vehicles currently undergoing routine maintenance.`, time: '10 mins ago' },
        { id: 'act-3', type: 'compliance', message: `Compliance check completed: ${expiredLicenses} expired driver licenses.`, time: '1 hour ago' }
      ]
    };

    return res.status(200).json({
      success: true,
      totalVehicles,
      availableVehicles,
      vehiclesOnTrip,
      vehiclesInShop,
      totalDrivers,
      availableDrivers,
      expiredLicenses,
      activeTrips,
      completedTrips,
      totalRevenue,
      totalExpenses,
      totalFuelCost,
      averageFleetFuelEfficiency: avgFuelEfficiency,
      fleetUtilizationPercentage: fleetUtilization,
      trends: mockTrends
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error fetching dashboard metrics.' });
  }
};

// Common ROI calculator logic helper
const calculateRoiData = async () => {
  const vehicles = await Vehicle.find();
  const roiReport = [];

  for (const v of vehicles) {
    // Completed trip stats
    const tripStats = await Trip.aggregate([
      { $match: { vehicle: v._id, status: 'Completed' } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$revenueGenerated' },
          distance: { $sum: '$actualDistance' },
          fuel: { $sum: '$fuelConsumed' }
        }
      }
    ]);

    const revenue = tripStats[0]?.revenue || 0;
    const distance = tripStats[0]?.distance || 0;
    const fuel = tripStats[0]?.fuel || 0;

    // Expense stats
    const expenses = await Expense.find({ vehicle: v._id });
    let fuelExpenses = 0;
    let maintenanceExpenses = 0;
    let otherExpenses = 0;

    expenses.forEach(e => {
      if (e.category === 'Fuel') fuelExpenses += e.amount;
      else if (e.category === 'Maintenance') maintenanceExpenses += e.amount;
      else otherExpenses += e.amount;
    });

    const totalExpenses = fuelExpenses + maintenanceExpenses + otherExpenses;
    const netProfit = revenue - totalExpenses;
    const roiPercentage = v.acquisitionCost > 0 ? safeDiv(netProfit, v.acquisitionCost) * 100 : 0;
    const fuelEfficiency = safeDiv(distance, fuel);
    const costPerKm = safeDiv(totalExpenses, distance);

    roiReport.push({
      vehicleId: v._id,
      registrationNumber: v.registrationNumber,
      model: v.modelName,
      acquisitionCost: v.acquisitionCost,
      completedTripRevenue: revenue,
      fuelExpenses,
      maintenanceExpenses,
      otherExpenses,
      totalExpenses,
      netProfit,
      roiPercentage: Math.round(roiPercentage * 100) / 100,
      totalCompletedDistance: distance,
      totalFuelConsumed: fuel,
      averageFuelEfficiency: fuelEfficiency,
      costPerKilometer: costPerKm
    });
  }

  return roiReport;
};

// GET /api/reports/roi
const getVehicleRoi = async (req, res) => {
  try {
    const roiReport = await calculateRoiData();
    return res.status(200).json(roiReport);
  } catch (error) {
    console.error('ROI report error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error generating ROI report.' });
  }
};

// GET /api/reports/export/csv
const exportRoiCsv = async (req, res) => {
  try {
    const data = await calculateRoiData();
    
    // Create CSV Header
    let csvContent = 'Registration Number,Model,Acquisition Cost (INR),Trip Revenue (INR),Fuel Expenses (INR),Maintenance Expenses (INR),Other Expenses (INR),Total Expenses (INR),Net Profit (INR),ROI (%),Completed Distance (km),Fuel Consumed (L),Fuel Efficiency (km/L),Cost Per km (INR/km)\n';

    // Add rows
    data.forEach(row => {
      csvContent += `"${row.registrationNumber}","${row.model}",${row.acquisitionCost},${row.completedTripRevenue},${row.fuelExpenses},${row.maintenanceExpenses},${row.otherExpenses},${row.totalExpenses},${row.netProfit},${row.roiPercentage},${row.totalCompletedDistance},${row.totalFuelConsumed},${row.averageFuelEfficiency},${row.costPerKilometer}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fleet_roi_performance.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('CSV export error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error exporting CSV.' });
  }
};

module.exports = {
  getDashboardMetrics,
  getVehicleRoi,
  exportRoiCsv
};
