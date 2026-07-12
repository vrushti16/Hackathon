const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const cors = require('cors');
const authRoute = require('./routes/authRoute');
const vehicleRoute = require('./routes/vehicleRoute');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoute);
app.use('/api/vehicles', vehicleRoute);

// Routes
const authRoute = require('./routes/authRoute');
app.use('/api/auth', authRoute);


// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

// Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'TransitOps server is active and connected to MongoDB Atlas.',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});
