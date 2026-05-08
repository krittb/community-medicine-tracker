const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  date: {
    type: String,   // "YYYY-MM-DD"
    required: [true, 'Appointment date is required']
  },
  timeSlot: {
    type: String,   // e.g. "09:00 AM"
    required: [true, 'Time slot is required']
  },
  tokenNumber: {
    type: Number
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-consultation', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  symptoms: {
    type: String,
    trim: true
  },
  notes: {           // doctor's notes after consultation
    type: String,
    trim: true
  }
}, { timestamps: true });

// Auto-assign token number per doctor per date
appointmentSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments({
      doctor: this.doctor,
      date: this.date,
      status: { $ne: 'cancelled' }
    });
    this.tokenNumber = count + 1;
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
