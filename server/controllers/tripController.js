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

    const foundVehicle = await Vehicle.findById(targetVehicle);
    if (!foundVehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    const foundDriver = await Driver.findById(targetDriver);
    if (!foundDriver) {
      return res.status(404).json({ message: 'Driver not found.' });
    }


    if (cargoWeight > foundVehicle.maxLoadCapacity) {
      return res.status(400).json({
        message: `Cargo weight (${cargoWeight} kg) exceeds vehicle max load capacity (${foundVehicle.maxLoadCapacity} kg).`
      });
    }

    const trip = await Trip.create({
      source,
      destination,
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

    const trips = await Trip.find(filterQuery)
      .populate('vehicle')
      .populate('driver');

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

    if (foundDriver.licenseExpiryDate < new Date()) {
      return res.status(400).json({ message: 'Cannot dispatch: Driver license has expired.' });
    }

    if (trip.cargoWeight > foundVehicle.maxLoadCapacity) {
      return res.status(400).json({
        message: `Cargo weight (${trip.cargoWeight} kg) exceeds vehicle max load capacity (${foundVehicle.maxLoadCapacity} kg).`
      });
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

    if (trip.status !== 'Dispatched') {
      return res.status(400).json({ message: 'Only active dispatched trips can be completed.' });
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
