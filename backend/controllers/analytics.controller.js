const Appointment = require('../models/Appointment');
const Medicine = require('../models/Medicine');
const Prescription = require('../models/Prescription');
const DispenseLog = require('../models/DispenseLog');
const User = require('../models/User');

// @route GET /api/analytics/summary
exports.getSummary = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [
      totalPatients,
      totalDoctors,
      todayAppointments,
      totalMedicines,
      lowStockMedicines,
      pendingPrescriptions
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      Appointment.countDocuments({ date: today, status: { $ne: 'cancelled' } }),
      Medicine.countDocuments({ isActive: true }),
      Medicine.countDocuments({ isActive: true, $expr: { $lte: ['$quantity', '$threshold'] } }),
      Prescription.countDocuments({ dispensed: false })
    ]);
    res.json({
      success: true,
      summary: { totalPatients, totalDoctors, todayAppointments, totalMedicines, lowStockMedicines, pendingPrescriptions }
    });
  } catch (error) { next(error); }
};

// @route GET /api/analytics/appointments/weekly
exports.getWeeklyAppointments = async (req, res, next) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    const counts = await Promise.all(days.map(async date => ({
      date,
      count: await Appointment.countDocuments({ date, status: { $ne: 'cancelled' } })
    })));
    res.json({ success: true, data: counts });
  } catch (error) { next(error); }
};

// @route GET /api/analytics/medicines/top
exports.getTopPrescribed = async (req, res, next) => {
  try {
    const result = await Prescription.aggregate([
      { $unwind: '$medicines' },
      { $group: { _id: '$medicines.medicineName', count: { $sum: '$medicines.quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

// @route GET /api/analytics/stock
exports.getStockStatus = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({ isActive: true })
      .select('name quantity threshold category').sort({ quantity: 1 });
    const categorized = {
      critical: medicines.filter(m => m.quantity === 0),
      low: medicines.filter(m => m.quantity > 0 && m.quantity <= m.threshold),
      adequate: medicines.filter(m => m.quantity > m.threshold)
    };
    res.json({ success: true, data: categorized });
  } catch (error) { next(error); }
};
