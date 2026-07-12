const mongoose = require('mongoose');

const FuelLogSchema = new mongoose.Schema({
  vehicle: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle', 
    required: true 
  },
  liters: { 
    type: Number, 
    required: true 
  },
  cost: { 
    type: Number, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  odometerAtLog: { 
    type: Number, 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('FuelLog', FuelLogSchema);
