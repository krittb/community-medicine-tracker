const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @route GET /api/appointments/doctors
exports.getDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: true })
      .select('name specialization email phone');
    res.json({ success: true, doctors });
  } catch (error) { next(error); }
};

// @route GET /api/appointments/slots/:doctorId/:date
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId, date } = req.params;
    const allSlots = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM',
                      '11:30 AM','12:00 PM','02:00 PM','02:30 PM','03:00 PM',
                      '03:30 PM','04:00 PM','04:30 PM'];
    const booked = await Appointment.find({
      doctor: doctorId, date, status: { $ne: 'cancelled' }
    }).select('timeSlot');
    const bookedSlots = booked.map(a => a.timeSlot);
    const available = allSlots.filter(s => !bookedSlots.includes(s));
    res.json({ success: true, available, booked: bookedSlots });
  } catch (error) { next(error); }
};

// @route POST /api/appointments
exports.bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, timeSlot, symptoms } = req.body;
    // Check for duplicate booking by same patient
    const existing = await Appointment.findOne({
      patient: req.user._id, doctor: doctorId, date,
      status: { $ne: 'cancelled' }
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have an appointment with this doctor on this date' });
    }
    // Check slot still available
    const slotTaken = await Appointment.findOne({
      doctor: doctorId, date, timeSlot, status: { $ne: 'cancelled' }
    });
    if (slotTaken) {
      return res.status(400).json({ success: false, message: 'This slot is no longer available' });
    }
    const appointment = await Appointment.create({
      patient: req.user._id, doctor: doctorId, date, timeSlot, symptoms
    });
    await appointment.populate(['patient', 'doctor']);
    res.status(201).json({ success: true, appointment });
  } catch (error) { next(error); }
};

// @route GET /api/appointments/my  (patient: own appointments)
exports.getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name specialization')
      .sort({ date: -1, timeSlot: 1 });
    res.json({ success: true, appointments });
  } catch (error) { next(error); }
};

// @route GET /api/appointments/queue  (doctor: today's queue)
exports.getDoctorQueue = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const appointments = await Appointment.find({
      doctor: req.user._id, date, status: { $ne: 'cancelled' }
    }).populate('patient', 'name age gender phone').sort({ tokenNumber: 1 });
    res.json({ success: true, appointments, date });
  } catch (error) { next(error); }
};

// @route PUT /api/appointments/:id/status  (doctor: update status)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user._id },
      { status, notes },
      { new: true, runValidators: true }
    ).populate('patient', 'name');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, appointment });
  } catch (error) { next(error); }
};

// @route DELETE /api/appointments/:id  (patient: cancel)
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patient: req.user._id, status: 'scheduled' },
      { status: 'cancelled' },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found or cannot be cancelled' });
    }
    res.json({ success: true, message: 'Appointment cancelled', appointment });
  } catch (error) { next(error); }
};
