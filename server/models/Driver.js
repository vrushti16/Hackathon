const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    lowercase: true, 
    trim: true,
    unique: true,
    sparse: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    sparse: true
  },
  licenseNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  licenseCategory: { 
    type: String, 
    enum: ['Class A CDL', 'Class B CDL', 'Standard'], 
    required: true 
  },
  licenseExpiryDate: { 
    type: Date, 
    required: true 
  },
  contactNumber: { 
    type: String, 
    required: true 
  },
  safetyScore: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100, 
    default: 100 
  },
  status: { 
    type: String, 
    enum: ['Available', 'On Trip', 'Off Duty', 'Suspended'], 
    default: 'Available' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Driver', DriverSchema);
