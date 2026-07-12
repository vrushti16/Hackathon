const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import all models
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const Trip = require('./models/Trip');
const MaintenanceLog = require('./models/MaintenanceLog');
const FuelLog = require('./models/FuelLog');
const Expense = require('./models/Expense');

const seedAllModels = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected successfully.');

    // Clear all existing data to prevent duplicate keys and start fresh
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Driver.deleteMany({});
    await Trip.deleteMany({});
    await MaintenanceLog.deleteMany({});
    await FuelLog.deleteMany({});
    await Expense.deleteMany({});
    console.log('Cleared all collections.');

    // 1. Seed User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@transitops.com',
      password: hashedPassword,
      role: 'Admin'
    });
    console.log('Created User collection document.');

    // 2. Seed Vehicle
    const vehicle = await Vehicle.create({
      registrationNumber: 'VAN-05',
      modelName: 'Ford Transit 250',
      type: 'Van',
      maxLoadCapacity: 500, // as specified in the Example Workflow
      odometer: 10000,
      acquisitionCost: 35000,
      status: 'Available',
      region: 'Midwest'
    });
    console.log('Created Vehicle collection document.');

    // 3. Seed Driver
    const driver = await Driver.create({
      name: 'Alex', // as specified in the Example Workflow
      licenseNumber: 'DL-ALEX98765',
      licenseCategory: 'Standard',
      licenseExpiryDate: new Date('2027-12-31'), // valid expiry
      contactNumber: '+1-555-0199',
      safetyScore: 98,
      status: 'Available'
    });
    console.log('Created Driver collection document.');

    // 4. Seed Trip (Draft trip)
    const trip = await Trip.create({
      source: 'Warehouse A',
      destination: 'Retail Store B',
      vehicle: vehicle._id,
      driver: driver._id,
      cargoWeight: 450, // as specified in the Example Workflow
      plannedDistance: 120,
      revenueGenerated: 600,
      status: 'Draft'
    });
    console.log('Created Trip collection document.');

    // 5. Seed Maintenance Log
    const maintenance = await MaintenanceLog.create({
      vehicle: vehicle._id,
      description: 'Scheduled Oil Change & Filters Renewal',
      cost: 150,
      startDate: new Date(),
      status: 'Closed',
      endDate: new Date()
    });
    console.log('Created MaintenanceLog collection document.');

    // 6. Seed Fuel Log
    const fuel = await FuelLog.create({
      vehicle: vehicle._id,
      liters: 45,
      cost: 135,
      date: new Date(),
      odometerAtLog: 10120
    });
    console.log('Created FuelLog collection document.');

    // 7. Seed Expense
    const expense = await Expense.create({
      vehicle: vehicle._id,
      trip: trip._id,
      category: 'Toll',
      amount: 25,
      date: new Date(),
      description: 'Highway Express Route Toll Fee'
    });
    console.log('Created Expense collection document.');

    console.log('--------------------------------------------------');
    console.log('Success: All models successfully seeded in database!');
    console.log('Now refresh MongoDB Compass, and all collections under "odoo" will be displayed!');
    console.log('--------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding all models failed:', error.message);
    process.exit(1);
  }
};

seedAllModels();
