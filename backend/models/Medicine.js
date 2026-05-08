const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['antibiotic', 'analgesic', 'antiviral', 'antifungal', 'antacid',
           'antihistamine', 'vitamin', 'supplement', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  unit: {
    type: String,
    default: 'tablets'    // tablets, ml, capsules, etc.
  },
  threshold: {
    type: Number,
    default: 10,          // alert when quantity <= threshold
    min: 0
  },
  expiryDate: {
    type: Date
  },
  manufacturer: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

medicineSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.threshold;
});

medicineSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);
