const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Expense = require('../models/Expense');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is missing in server/.env file.');
  process.exit(1);
}

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB Atlas to seed Indian data...');

    // 1. Clear existing collections (but keep User collection untouched as requested)
    await Vehicle.deleteMany({});
    await Driver.deleteMany({});
    await Trip.deleteMany({});
    await Expense.deleteMany({});
    console.log('Cleared existing Vehicles, Drivers, Trips, and Expenses.');

    // 2. Seed Indian Vehicles
    const vehiclesData = [
      { registrationNumber: 'MH-12-QW-8085', modelName: 'Tata Prima 4930.S', type: 'Semi-Truck', maxLoadCapacity: 40000, odometer: 154300, acquisitionCost: 4500000, status: 'Available', region: 'Mumbai' },
      { registrationNumber: 'DL-01-AB-1234', modelName: 'Mahindra Blazo X 35', type: 'Box-Truck', maxLoadCapacity: 25000, odometer: 87500, acquisitionCost: 3200000, status: 'On Trip', region: 'Delhi' },
      { registrationNumber: 'KA-03-EF-5678', modelName: 'Ashok Leyland Ecomet', type: 'Box-Truck', maxLoadCapacity: 14000, odometer: 62100, acquisitionCost: 2200000, status: 'Available', region: 'Bengaluru' },
      { registrationNumber: 'TN-07-JK-9012', modelName: 'Eicher Pro 3019', type: 'Flatbed', maxLoadCapacity: 18500, odometer: 93400, acquisitionCost: 2600000, status: 'In Shop', region: 'Chennai' },
      { registrationNumber: 'TS-09-XY-7412', modelName: 'Tata Winger Cargo', type: 'Van', maxLoadCapacity: 3500, odometer: 42000, acquisitionCost: 1100000, status: 'Available', region: 'Hyderabad' },
      { registrationNumber: 'HR-55-PZ-9541', modelName: 'Maruti Suzuki Super Carry', type: 'Van', maxLoadCapacity: 1500, odometer: 18000, acquisitionCost: 650000, status: 'Available', region: 'Delhi' },
      { registrationNumber: 'GJ-01-TR-3210', modelName: 'Tata Signa 4825.T', type: 'Semi-Truck', maxLoadCapacity: 38000, odometer: 125000, acquisitionCost: 4100000, status: 'On Trip', region: 'Mumbai' },
      { registrationNumber: 'KA-51-MM-8989', modelName: 'Mahindra Furio 14', type: 'Box-Truck', maxLoadCapacity: 12000, odometer: 38000, acquisitionCost: 1900000, status: 'Available', region: 'Bengaluru' }
    ];

    const seededVehicles = await Vehicle.create(vehiclesData);
    console.log(`Seeded ${seededVehicles.length} Vehicles with Indian places.`);

    // 3. Seed Indian Drivers
    const driversData = [
      { name: 'Rajesh Kumar', email: 'rajesh.kumar@transitops.com', licenseNumber: 'DL-1420180098451', licenseCategory: 'Class A CDL', licenseExpiryDate: new Date('2032-05-15'), contactNumber: '+919876543210', safetyScore: 92, status: 'Available' },
      { name: 'Amit Patel', email: 'amit.patel@transitops.com', licenseNumber: 'GJ-0120150047812', licenseCategory: 'Class A CDL', licenseExpiryDate: new Date('2030-08-22'), contactNumber: '+919988776655', safetyScore: 88, status: 'On Trip' },
      { name: 'Vikram Singh', email: 'vikram.singh@transitops.com', licenseNumber: 'HR-2620120032954', licenseCategory: 'Class B CDL', licenseExpiryDate: new Date('2028-11-30'), contactNumber: '+919122334455', safetyScore: 95, status: 'Available' },
      { name: 'Suresh Nair', email: 'suresh.nair@transitops.com', licenseNumber: 'KL-0120190076412', licenseCategory: 'Class A CDL', licenseExpiryDate: new Date('2031-03-10'), contactNumber: '+919566778899', safetyScore: 90, status: 'Available' },
      { name: 'Gopal Reddy', email: 'gopal.reddy@transitops.com', licenseNumber: 'AP-2820160085421', licenseCategory: 'Standard', licenseExpiryDate: new Date('2029-07-04'), contactNumber: '+919440551122', safetyScore: 84, status: 'Available' },
      { name: 'Harish Sen', email: 'harish.sen@transitops.com', licenseNumber: 'MH-1220140023610', licenseCategory: 'Class A CDL', licenseExpiryDate: new Date('2026-06-15'), contactNumber: '+918888777766', safetyScore: 79, status: 'Available' }, // Near Expiry/Expired
      { name: 'Manpreet Singh', email: 'manpreet.singh@transitops.com', licenseNumber: 'PB-0220170069352', licenseCategory: 'Class A CDL', licenseExpiryDate: new Date('2033-02-18'), contactNumber: '+919777665544', safetyScore: 97, status: 'On Trip' }
    ];

    const seededDrivers = await Driver.create(driversData);
    console.log(`Seeded ${seededDrivers.length} Drivers with Indian licenses.`);

    // 4. Seed Trips between Indian cities
    const vehiclesMap = {};
    seededVehicles.forEach(v => { vehiclesMap[v.registrationNumber] = v._id; });

    const driversMap = {};
    seededDrivers.forEach(d => { driversMap[d.name] = d._id; });

    const tripsData = [
      {
        source: 'Mumbai',
        destination: 'Pune',
        vehicle: vehiclesMap['MH-12-QW-8085'],
        driver: driversMap['Rajesh Kumar'],
        cargoWeight: 18000,
        plannedDistance: 150,
        actualDistance: 148,
        fuelConsumed: 42,
        finalOdometer: 154448,
        revenueGenerated: 25000,
        status: 'Completed',
        dispatchedAt: new Date('2026-07-05T08:00:00'),
        completedAt: new Date('2026-07-05T12:00:00')
      },
      {
        source: 'Delhi',
        destination: 'Jaipur',
        vehicle: vehiclesMap['DL-01-AB-1234'],
        driver: driversMap['Amit Patel'],
        cargoWeight: 22000,
        plannedDistance: 270,
        revenueGenerated: 48000,
        status: 'Dispatched',
        dispatchedAt: new Date('2026-07-12T05:00:00')
      },
      {
        source: 'Bengaluru',
        destination: 'Chennai',
        vehicle: vehiclesMap['KA-03-EF-5678'],
        driver: driversMap['Vikram Singh'],
        cargoWeight: 12000,
        plannedDistance: 350,
        actualDistance: 345,
        fuelConsumed: 95,
        finalOdometer: 62445,
        revenueGenerated: 55000,
        status: 'Completed',
        dispatchedAt: new Date('2026-07-08T06:00:00'),
        completedAt: new Date('2026-07-08T15:00:00')
      },
      {
        source: 'Hyderabad',
        destination: 'Bengaluru',
        vehicle: vehiclesMap['TS-09-XY-7412'],
        driver: driversMap['Suresh Nair'],
        cargoWeight: 3200,
        plannedDistance: 570,
        actualDistance: 568,
        fuelConsumed: 118,
        finalOdometer: 42568,
        revenueGenerated: 42000,
        status: 'Completed',
        dispatchedAt: new Date('2026-07-03T10:00:00'),
        completedAt: new Date('2026-07-04T01:00:00')
      },
      {
        source: 'Delhi',
        destination: 'Ahmedabad',
        vehicle: vehiclesMap['GJ-01-TR-3210'],
        driver: driversMap['Manpreet Singh'],
        cargoWeight: 35000,
        plannedDistance: 950,
        revenueGenerated: 145000,
        status: 'Dispatched',
        dispatchedAt: new Date('2026-07-11T20:00:00')
      }
    ];

    const seededTrips = await Trip.create(tripsData);
    console.log(`Seeded ${seededTrips.length} Trips connecting Indian routes.`);

    // 5. Seed Expenses
    const tripsMap = {};
    seededTrips.forEach(t => {
      tripsMap[`${t.source} → ${t.destination}`] = t._id;
    });

    const expensesData = [
      {
        vehicle: vehiclesMap['MH-12-QW-8085'],
        trip: tripsMap['Mumbai → Pune'],
        category: 'Fuel',
        amount: 4200,
        date: new Date('2026-07-05'),
        description: 'Refueled 42 Liters of diesel at highway bunk.'
      },
      {
        vehicle: vehiclesMap['MH-12-QW-8085'],
        trip: tripsMap['Mumbai → Pune'],
        category: 'Toll',
        amount: 800,
        date: new Date('2026-07-05'),
        description: 'Mumbai-Pune Expressway Toll payment.'
      },
      {
        vehicle: vehiclesMap['KA-03-EF-5678'],
        trip: tripsMap['Bengaluru → Chennai'],
        category: 'Fuel',
        amount: 9500,
        date: new Date('2026-07-08'),
        description: 'Full tank refuel 95L.'
      },
      {
        vehicle: vehiclesMap['KA-03-EF-5678'],
        trip: tripsMap['Bengaluru → Chennai'],
        category: 'Driver Allowance',
        amount: 1500,
        date: new Date('2026-07-08'),
        description: 'Night shift allowance for Vikram Singh.'
      },
      {
        vehicle: vehiclesMap['TS-09-XY-7412'],
        trip: tripsMap['Hyderabad → Bengaluru'],
        category: 'Fuel',
        amount: 11800,
        date: new Date('2026-07-03'),
        description: 'Refueled 118 Liters.'
      },
      {
        vehicle: vehiclesMap['TN-07-JK-9012'], // Currently in Shop
        category: 'Maintenance',
        amount: 14500,
        date: new Date('2026-07-10'),
        description: 'Replacement of front break pads and alignment correction.'
      },
      {
        vehicle: vehiclesMap['MH-12-QW-8085'],
        category: 'Insurance',
        amount: 35000,
        date: new Date('2026-07-01'),
        description: 'Annual commercial insurance premium payment Tata Prima.'
      }
    ];

    const seededExpenses = await Expense.create(expensesData);
    console.log(`Seeded ${seededExpenses.length} Expense logs (Fuel, Tolls, Maintenance, Insurance).`);

    console.log('Database populated successfully with comprehensive Indian data!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Indian data failed:', error.message);
    process.exit(1);
  }
};

seedData();
