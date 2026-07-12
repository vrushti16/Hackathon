const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI in server/.env. Copy .env.example to .env and set your MongoDB connection string.');
  process.exit(1);
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

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoute);
app.use('/api/vehicles', vehicleRoute);
app.use('/api/drivers', driverRoute);
app.use('/api/maintenance', maintenanceRoute);
app.use('/api/trips', tripRoute);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'TransitOps server is active and connected to MongoDB Atlas.',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
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

