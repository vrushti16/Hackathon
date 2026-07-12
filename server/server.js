const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

if (!process.env.MONGO_URI) {
  console.warn('Missing MONGO_URI in server/.env. Will fall back to in-memory database for local development.');
}

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in server/.env. Copy .env.example to .env and set your JWT secret.');
  process.exit(1);
}

const authRoute = require('./routes/authRoute');
const vehicleRoute = require('./routes/vehicleRoute');
const driverRoute = require('./routes/driverRoute');
const maintenanceRoute = require('./routes/maintenanceRoute');
const tripRoute = require('./routes/tripRoute');
const expenseRoute = require('./routes/expenseRoute');
const dashboardRoute = require('./routes/dashboardRoute');
const reportRoute = require('./routes/reportRoute');
const userRoute = require('./routes/userRoute');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/vehicles', vehicleRoute);
app.use('/api/drivers', driverRoute);
app.use('/api/maintenance', maintenanceRoute);
app.use('/api/trips', tripRoute);
app.use('/api/expenses', expenseRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/reports', reportRoute);
app.use('/api/users', userRoute);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'TransitOps server is active and connected to MongoDB Atlas.',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    if (!uri || uri.includes('127.0.0.1:27017') || uri.includes('<username>')) {
      console.log('Starting in-memory MongoDB server for local development...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();

      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Memory Server Connected: ${conn.connection.host}`);

      // Seed dummy admin users
      const User = require('./models/User');
      const bcrypt = require('bcryptjs');

      const adminExisting = await User.findOne({ email: 'admin@transitops.com' });
      if (!adminExisting) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({ name: 'Demo Admin', email: 'admin@transitops.com', password: hashedPassword, role: 'Admin' });
        console.log('Demo admin user admin@transitops.com seeded.');
      }

      const demoExisting = await User.findOne({ email: 'nandanasn77@gmail.com' });
      if (!demoExisting) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({ name: 'Nandana Suresh', email: 'nandanasn77@gmail.com', password: hashedPassword, role: 'Admin' });
        console.log('Demo user nandanasn77@gmail.com seeded for login.');
      }
    } else {
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

