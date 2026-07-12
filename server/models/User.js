const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['Admin', 'FleetManager', 'Driver', 'SafetyOfficer', 'FinancialAnalyst'], 
    required: true 
  },
  passwordResetOtp: {
    type: String,
    default: null
  },
  passwordResetOtpExpires: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
