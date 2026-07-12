const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const FuelLog = require('../models/FuelLog');
const Expense = require('../models/Expense');

const createTrip = async (req, res) => {
  try {
    const { source, destination, vehicle, driver, vehicleId, driverId, cargoWeight, plannedDistance, revenueGenerated } = req.body;

    const targetVehicle = vehicle || vehicleId;
    const targetDriver = driver || driverId;

    if (!source || !destination || !targetVehicle || !targetDriver || !cargoWeight || !plannedDistance || revenueGenerated === undefined) {
      return res.status(400).json({ message: 'Please provide all required fields to create a draft trip.' });
    }

    if (plannedDistance <= 0) {
      return res.status(400).json({ message: 'Planned distance must be greater than zero.' });
    }

    if (revenueGenerated < 0) {
      return res.status(400).json({ message: 'Revenue generated cannot be negative.' });
    }

    if (cargoWeight <= 0) {
      return res.status(400).json({ message: 'Cargo weight must be greater than zero.' });
    }

    const foundVehicle = await Vehicle.findById(targetVehicle);
    if (!foundVehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    if (foundVehicle.status === 'Retired') {
      return res.status(400).json({ message: 'Cannot assign a retired vehicle.' });
    }

    const foundDriver = await Driver.findById(targetDriver);
    if (!foundDriver) {
      return res.status(404).json({ message: 'Driver not found.' });
    }

    if (foundDriver.status === 'Suspended') {
      return res.status(400).json({ message: 'Cannot assign a suspended driver.' });
    }

    if (foundDriver.licenseExpiryDate < new Date()) {
      return res.status(400).json({ message: 'Cannot assign a driver with an expired license.' });
    }

    if (cargoWeight > foundVehicle.maxLoadCapacity) {
      return res.status(400).json({
        message: `Cargo weight (${cargoWeight} kg) exceeds vehicle max load capacity (${foundVehicle.maxLoadCapacity} kg).`
      });
    }

    // Check if vehicle has active maintenance
    const MaintenanceLog = require('../models/MaintenanceLog');
    const activeMaintenance = await MaintenanceLog.findOne({ vehicle: targetVehicle, status: 'Active' });
    if (activeMaintenance) {
      return res.status(400).json({ message: 'Cannot assign a vehicle that is currently in maintenance.' });
    }

    // Check if vehicle is already on another active trip
    const activeVehicleTrip = await Trip.findOne({ vehicle: targetVehicle, status: 'Dispatched' });
    if (activeVehicleTrip) {
      return res.status(400).json({ message: 'Vehicle is already assigned to another active trip.' });
    }

    // Check if driver is already on another active trip
    const activeDriverTrip = await Trip.findOne({ driver: targetDriver, status: 'Dispatched' });
    if (activeDriverTrip) {
      return res.status(400).json({ message: 'Driver is already assigned to another active trip.' });
    }

    const trip = await Trip.create({
      source: source.trim(),
      destination: destination.trim(),
      vehicle: targetVehicle,
      driver: targetDriver,
      cargoWeight,
      plannedDistance,
      revenueGenerated,
      status: 'Draft'
    });

    return res.status(201).json(trip);
  } catch (error) {
    console.error('Create trip error:', error.message);
    return res.status(500).json({ message: 'Server error while creating draft trip.' });
  }
};

const getAllTrips = async (req, res) => {
  try {
    const { status } = req.query;
    const filterQuery = {};
    if (status) {
      filterQuery.status = status;
    }

    // Driver Role Restriction: Return only trips assigned to their linked Driver profile
    if (req.user && req.user.role === 'Driver') {
      const driverProfile = await Driver.findOne({ user: req.user.id });
      if (!driverProfile) {
        return res.status(200).json([]); // Return empty list if no driver profile is linked
      }
      filterQuery.driver = driverProfile._id;
    }

    const trips = await Trip.find(filterQuery)
      .populate('vehicle')
      .populate('driver')
      .sort({ createdAt: -1 });

    return res.status(200).json(trips);
  } catch (error) {
    console.error('Get all trips error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching trips.' });
  }
};

const dispatchTrip = async (req, res) => {
  try {
    const tripId = req.params.id;
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    // Backend ownership validation for Driver role
    if (req.user && req.user.role === 'Driver') {
      const driverProfile = await Driver.findOne({ user: req.user.id });
      if (!driverProfile || String(trip.driver) !== String(driverProfile._id)) {
        return res.status(403).json({ message: 'Forbidden. You do not own this trip.' });
      }
    }

    if (trip.status !== 'Draft') {
      return res.status(400).json({ message: `Cannot dispatch a trip that is currently in '${trip.status}' status.` });
    }

    const foundVehicle = await Vehicle.findById(trip.vehicle);
    const foundDriver = await Driver.findById(trip.driver);

    if (!foundVehicle || !foundDriver) {
      return res.status(404).json({ message: 'Assigned vehicle or driver no longer exists.' });
    }

    if (foundVehicle.status !== 'Available') {
      return res.status(400).json({ message: `Vehicle is currently not available (Status: ${foundVehicle.status}).` });
    }

    if (foundDriver.status !== 'Available') {
      return res.status(400).json({ message: `Driver is currently not available (Status: ${foundDriver.status}).` });
    }

    if (foundDriver.status === 'Suspended') {
      return res.status(400).json({ message: 'Cannot dispatch: Driver is suspended.' });
    }

    if (foundDriver.licenseExpiryDate < new Date()) {
      return res.status(400).json({ message: 'Cannot dispatch: Driver license has expired.' });
    }

    if (trip.cargoWeight > foundVehicle.maxLoadCapacity) {
      return res.status(400).json({
        message: `Cargo weight (${trip.cargoWeight} kg) exceeds vehicle max load capacity (${foundVehicle.maxLoadCapacity} kg).`
      });
    }

    // Double check active maintenance
    const MaintenanceLog = require('../models/MaintenanceLog');
    const activeMaintenance = await MaintenanceLog.findOne({ vehicle: trip.vehicle, status: 'Active' });
    if (activeMaintenance) {
      return res.status(400).json({ message: 'Cannot dispatch: Vehicle is in active maintenance.' });
    }

    foundVehicle.status = 'On Trip';
    foundDriver.status = 'On Trip';
    await foundVehicle.save();
    await foundDriver.save();

    trip.status = 'Dispatched';
    trip.dispatchedAt = new Date();
    await trip.save();

    return res.status(200).json(trip);
  } catch (error) {
    console.error('Dispatch trip error:', error.message);
    return res.status(500).json({ message: 'Server error while dispatching trip.' });
  }
};

const completeTrip = async (req, res) => {
  try {
    const tripId = req.params.id;
    const { finalOdometer, fuelConsumed, fuelCost } = req.body;

    if (finalOdometer === undefined || fuelConsumed === undefined) {
      return res.status(400).json({ message: 'Please provide finalOdometer and fuelConsumed values.' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    // Backend ownership validation for Driver role
    if (req.user && req.user.role === 'Driver') {
      const driverProfile = await Driver.findOne({ user: req.user.id });
      if (!driverProfile || String(trip.driver) !== String(driverProfile._id)) {
        return res.status(403).json({ message: 'Forbidden. You do not own this trip.' });
      }
    }

    if (trip.status !== 'Dispatched') {
      return res.status(400).json({ message: 'Only active dispatched trips can be completed.' });
    }

    if (fuelConsumed < 0) {
      return res.status(400).json({ message: 'Fuel consumed cannot be negative.' });
    }

    const foundVehicle = await Vehicle.findById(trip.vehicle);
    const foundDriver = await Driver.findById(trip.driver);

    if (!foundVehicle || !foundDriver) {
      return res.status(404).json({ message: 'Assigned vehicle or driver no longer exists.' });
    }

    if (finalOdometer < foundVehicle.odometer) {
      return res.status(400).json({
        message: `Final odometer (${finalOdometer} km) cannot be less than vehicle start odometer (${foundVehicle.odometer} km).`
      });
    }

    const actualDistance = finalOdometer - foundVehicle.odometer;

    foundVehicle.odometer = finalOdometer;
    foundVehicle.status = 'Available';
    await foundVehicle.save();

    foundDriver.status = 'Available';
    await foundDriver.save();

    trip.status = 'Completed';
    trip.completedAt = new Date();
    trip.actualDistance = actualDistance;
    trip.fuelConsumed = fuelConsumed;
    trip.finalOdometer = finalOdometer;
    await trip.save();

    const costOfFuel = fuelCost || (fuelConsumed * 4.0);
    if (fuelConsumed > 0) {
      await FuelLog.create({
        vehicle: trip.vehicle,
        liters: fuelConsumed,
        cost: costOfFuel,
        date: new Date(),
        odometerAtLog: finalOdometer
      });

      await Expense.create({
        vehicle: trip.vehicle,
        trip: trip._id,
        category: 'Fuel',
        amount: costOfFuel,
        date: new Date(),
        description: `Fuel purchase for trip: ${trip.source} to ${trip.destination}`
      });
    }

    return res.status(200).json(trip);
  } catch (error) {
    console.error('Complete trip error:', error.message);
    return res.status(500).json({ message: 'Server error while completing trip.' });
  }
};

const cancelTrip = async (req, res) => {
  try {
    const tripId = req.params.id;
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    // Backend ownership validation for Driver role
    if (req.user && req.user.role === 'Driver') {
      const driverProfile = await Driver.findOne({ user: req.user.id });
      if (!driverProfile || String(trip.driver) !== String(driverProfile._id)) {
        return res.status(403).json({ message: 'Forbidden. You do not own this trip.' });
      }
    }

    if (trip.status !== 'Dispatched') {
      return res.status(400).json({ message: 'Only active dispatched trips can be cancelled.' });
    }

    const foundVehicle = await Vehicle.findById(trip.vehicle);
    const foundDriver = await Driver.findById(trip.driver);

    if (foundVehicle && foundVehicle.status === 'On Trip') {
      foundVehicle.status = 'Available';
      await foundVehicle.save();
    }

    if (foundDriver && foundDriver.status === 'On Trip') {
      foundDriver.status = 'Available';
      await foundDriver.save();
    }

    trip.status = 'Cancelled';
    await trip.save();

    return res.status(200).json(trip);
  } catch (error) {
    console.error('Cancel trip error:', error.message);
    return res.status(500).json({ message: 'Server error while cancelling trip.' });
  }
};

module.exports = {
  createTrip,
  getAllTrips,
  dispatchTrip,
  completeTrip,
  cancelTrip
};
