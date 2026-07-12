const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  vehicle: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle', 
    required: true 
  },
  trip: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Trip' 
  },
  maintenance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaintenanceLog'
  },
  category: { 
    type: String, 
    enum: ['Fuel', 'Maintenance', 'Toll', 'Driver Allowance', 'Insurance', 'Other'], 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  description: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
