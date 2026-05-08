const mongoose = require('mongoose');

const dispenseLogSchema = new mongoose.Schema({
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pharmacist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicines: [{
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    medicineName: String,
    quantityDispensed: Number,
    _id: false
  }],
  dispensedAt: {
    type: Date,
    default: Date.now
  },
  remarks: String
}, { timestamps: true });

module.exports = mongoose.model('DispenseLog', dispenseLogSchema);
