const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  registrationNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  modelName: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['Semi-Truck', 'Box-Truck', 'Van', 'Flatbed', 'Sedan'], 
    required: true 
  },
  maxLoadCapacity: { 
    type: Number, 
    required: true 
  },
  odometer: { 
    type: Number, 
    required: true 
  },
  acquisitionCost: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Available', 'On Trip', 'In Shop', 'Retired'], 
    default: 'Available' 
  },
  region: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);
