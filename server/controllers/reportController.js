const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');

const buildDateFilter = (filterType, customStart, customEnd, dateField = 'createdAt') => {
  const filter = {};
  let start = null;
  let end = null;
  const now = new Date();

  if (filterType === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (filterType === 'this_month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (filterType === 'custom' && (customStart || customEnd)) {
    if (customStart) start = new Date(customStart);
    if (customEnd) end = new Date(customEnd);
  }

  if (start || end) {
    filter[dateField] = {};
    if (start) filter[dateField].$gte = start;
    if (end) filter[dateField].$lte = end;
  }
  return filter;
};

const getReportMetricsInternal = async (query) => {
  const { filterType, startDate, endDate } = query;

  const tripDateFilter = buildDateFilter(filterType, startDate, endDate, 'completedAt');
  const expenseDateFilter = buildDateFilter(filterType, startDate, endDate, 'date');

  const vehicles = await Vehicle.find();
  const drivers = await Driver.find();

  const completedTripsQuery = { status: 'Completed', ...tripDateFilter };
  const trips = await Trip.find(completedTripsQuery);

  const expensesQuery = { ...expenseDateFilter };
  const expenses = await Expense.find(expensesQuery);

  const vehicleReports = vehicles.map(v => {
    const vTrips = trips.filter(t => t.vehicle.toString() === v._id.toString());
    const vExpenses = expenses.filter(e => e.vehicle && e.vehicle.toString() === v._id.toString());

    const tripsCount = vTrips.length;
    const totalDistance = vTrips.reduce((sum, t) => sum + (t.actualDistance || 0), 0);
    const revenue = vTrips.reduce((sum, t) => sum + (t.revenueGenerated || 0), 0);
    const operationalCost = vExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = revenue - operationalCost;

    // ROI = (Net Profit / Acquisition Cost) * 100
    const roi = v.acquisitionCost > 0 ? ((netProfit / v.acquisitionCost) * 100).toFixed(1) : '0.0';

    // Fuel Efficiency = total distance / total fuel consumed
    const fuelConsumed = vTrips.reduce((sum, t) => sum + (t.fuelConsumed || 0), 0);
    const fuelEfficiency = fuelConsumed > 0 ? (totalDistance / fuelConsumed).toFixed(2) : '0.00';

    // Fuel cost per km
    const costPerKm = totalDistance > 0 ? (operationalCost / totalDistance).toFixed(2) : '0.00';

    return {
      id: v._id,
      registrationNumber: v.registrationNumber,
      modelName: v.modelName || v.type,
      type: v.type,
      acquisitionCost: v.acquisitionCost,
      status: v.status,
      tripsCount,
      totalDistance,
      revenue,
      operationalCost,
      netProfit,
      roi,
      fuelEfficiency,
      costPerKm
    };
  });

  const driverReports = drivers.map(d => {
    const dTrips = trips.filter(t => t.driver.toString() === d._id.toString());

    const tripsCount = dTrips.length;
    const totalDistance = dTrips.reduce((sum, t) => sum + (t.actualDistance || 0), 0);
    const revenue = dTrips.reduce((sum, t) => sum + (t.revenueGenerated || 0), 0);

    return {
      id: d._id,
      name: d.name,
      licenseNumber: d.licenseNumber,
      safetyScore: d.safetyScore,
      status: d.status,
      tripsCount,
      totalDistance,
      revenue
    };
  });
  const totalRevenue = trips.reduce((sum, t) => sum + (t.revenueGenerated || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  const totalAcquisition = vehicles.reduce((sum, v) => sum + (v.acquisitionCost || 0), 0);
  const overallRoi = totalAcquisition > 0 ? ((netProfit / totalAcquisition) * 100).toFixed(1) : '0.0';

  const totalCompletedDistance = trips.reduce((sum, t) => sum + (t.actualDistance || 0), 0);
  const totalFuelConsumed = trips.reduce((sum, t) => sum + (t.fuelConsumed || 0), 0);
  const avgFuelEfficiency = totalFuelConsumed > 0 ? (totalCompletedDistance / totalFuelConsumed).toFixed(1) : '0.0';

  const fleetUtilization = vehicles.length > 0
    ? Math.round((vehicles.filter(v => v.status === 'On Trip' || v.status === 'Active').length / vehicles.length) * 100)
    : 0;

  const acquisitionTotal = vehicles.reduce((sum, v) => sum + v.acquisitionCost, 0);
  const maintenanceTotal = expenses.filter(e => e.category === 'Maintenance').reduce((sum, e) => sum + e.amount, 0);
  const fuelOpsTotal = expenses.filter(e => e.category === 'Fuel' || e.category === 'Toll' || e.category === 'Driver Allowance').reduce((sum, e) => sum + e.amount, 0);

  return {
    cards: {
      totalRevenue,
      totalExpenses,
      netProfit,
      fleetUtilization: `${fleetUtilization}%`,
      avgFuelEfficiency: `${avgFuelEfficiency} km/L`,
      fuelEfficiency: `${avgFuelEfficiency} km/L`,
      overallRoi: `${overallRoi}%`,
      roiScore: `${overallRoi}%`,
      operationalCost: `₹${totalExpenses.toLocaleString()}`
    },
    costBreakdown: [
      { name: 'Acquisition', value: acquisitionTotal },
      { name: 'Maintenance', value: maintenanceTotal },
      { name: 'Fuel & Ops', value: fuelOpsTotal }
    ],
    vehicleReports,
    driverReports
  };
};

const getReportMetrics = async (req, res) => {
  try {
    const data = await getReportMetricsInternal(req.query);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Get report metrics error:', error.message);
    return res.status(500).json({ message: 'Server error while calculating reports metrics.' });
  }
};

const exportReportCSV = async (req, res) => {
  try {
    const data = await getReportMetricsInternal(req.query);

    let csv = '\uFEFF'; // UTF-8 BOM
    csv += 'TRANSITOPS VEHICLE-WISE FLEET REPORT\n';
    csv += 'Registration Number,Model Name,Type,Trips,Distance (km),Revenue (INR),Expenses (INR),Net Profit (INR),ROI (%),Fuel Efficiency (km/L),Cost/km (INR)\n';

    data.vehicleReports.forEach(v => {
      csv += `${v.registrationNumber},${v.modelName},${v.type},${v.tripsCount},${v.totalDistance},${v.revenue},${v.operationalCost},${v.netProfit},${v.roi}%,${v.fuelEfficiency},₹${v.costPerKm}\n`;
    });

    csv += '\nTRANSITOPS DRIVER-WISE PERFORMANCE REPORT\n';
    csv += 'Driver Name,License Number,Status,Safety Score,Trips Completed,Total Distance (km),Revenue (INR)\n';

    data.driverReports.forEach(d => {
      csv += `${d.name},${d.licenseNumber},${d.status},${d.safetyScore},${d.tripsCount},${d.totalDistance},${d.revenue}\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=TransitOps_Fleet_Report.csv');
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Export CSV error:', error.message);
    return res.status(500).json({ message: 'Server error while exporting CSV.' });
  }
};

const exportReportPDF = async (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    const data = await getReportMetricsInternal(req.query);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=TransitOps_Fleet_Report.pdf');

    doc.pipe(res);

    doc.fillColor('#1E293B').fontSize(22).text('TransitOps Analytics Report', { align: 'center' });
    doc.fontSize(10).fillColor('#64748B').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Summary Metrics Section
    doc.fillColor('#0F172A').fontSize(14).text('Executive Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#334155');
    doc.text(`Total Revenue: INR ${data.cards.totalRevenue.toLocaleString()}`);
    doc.text(`Total Expenses: INR ${data.cards.totalExpenses.toLocaleString()}`);
    doc.text(`Net Profit: INR ${data.cards.netProfit.toLocaleString()}`);
    doc.text(`Overall ROI Score: ${data.cards.overallRoi}`);
    doc.text(`Average Fuel Efficiency: ${data.cards.avgFuelEfficiency}`);
    doc.text(`Fleet Utilization Rate: ${data.cards.fleetUtilization}`);
    doc.moveDown(2);

    // Vehicle Table
    doc.fillColor('#0F172A').fontSize(14).text('Vehicle Performance Reports', { underline: true });
    doc.moveDown(0.5);
    data.vehicleReports.forEach(v => {
      doc.fontSize(11).fillColor('#1E293B').text(`Vehicle: ${v.registrationNumber} (${v.modelName})`);
      doc.fontSize(10).fillColor('#475569');
      doc.text(`  • Trips: ${v.tripsCount}  |  Distance: ${v.totalDistance} km  |  Efficiency: ${v.fuelEfficiency} km/L`);
      doc.text(`  • Revenue: INR ${v.revenue.toLocaleString()}  |  Cost: INR ${v.operationalCost.toLocaleString()}  |  Profit: INR ${v.netProfit.toLocaleString()}`);
      doc.text(`  • Vehicle ROI: ${v.roi}%  |  Operational Cost/km: INR ${v.costPerKm}`);
      doc.moveDown(0.8);
    });
    doc.moveDown(2);

    // Driver Table
    doc.fillColor('#0F172A').fontSize(14).text('Driver Performance Reports', { underline: true });
    doc.moveDown(0.5);
    data.driverReports.forEach(d => {
      doc.fontSize(11).fillColor('#1E293B').text(`Driver: ${d.name} (${d.licenseNumber})`);
      doc.fontSize(10).fillColor('#475569');
      doc.text(`  • Status: ${d.status}  |  Safety Score: ${d.safetyScore} points`);
      doc.text(`  • Trips Dispatched: ${d.tripsCount}  |  Total Distance Handled: ${d.totalDistance} km  |  Total Revenue: INR ${d.revenue.toLocaleString()}`);
      doc.moveDown(0.8);
    });

    doc.end();
  } catch (error) {
    console.error('Export PDF error:', error.message);
    return res.status(500).json({ message: 'Server error while exporting PDF.' });
  }
};

module.exports = {
  getReportMetrics,
  exportReportCSV,
  exportReportPDF
};
