const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  source: { 
    type: String, 
    required: true 
  },
  destination: { 
    type: String, 
    required: true 
  },
  vehicle: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle', 
    required: true 
  },
  driver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Driver', 
    required: true 
  },
  cargoWeight: { 
    type: Number, 
    required: true 
  },
  plannedDistance: { 
    type: Number, 
    required: true 
  },
  actualDistance: { 
    type: Number 
  },
  fuelConsumed: { 
    type: Number 
  },
  finalOdometer: { 
    type: Number 
  },
  revenueGenerated: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'], 
    default: 'Draft' 
  },
  dispatchedAt: { 
    type: Date 
  },
  completedAt: { 
    type: Date 
  }
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);
