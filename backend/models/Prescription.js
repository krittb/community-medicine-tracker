const mongoose = require('mongoose');

const medicineItemSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  medicineName: String,   // denormalized for display
  dosage: {
    type: String,
    required: true   // e.g. "1 tablet twice daily"
  },
  duration: {
    type: String,
    required: true   // e.g. "5 days"
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicines: [medicineItemSchema],
  diagnosis: {
    type: String,
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  },
  dispensed: {
    type: Boolean,
    default: false
  },
  dispensedAt: Date,
  dispensedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
