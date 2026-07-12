const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
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
