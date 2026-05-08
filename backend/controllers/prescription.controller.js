const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Medicine = require('../models/Medicine');
const DispenseLog = require('../models/DispenseLog');

// @route POST /api/prescriptions
exports.createPrescription = async (req, res, next) => {
  try {
    const { appointmentId, medicines, diagnosis, instructions } = req.body;
    const appointment = await Appointment.findOne({ _id: appointmentId, doctor: req.user._id });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    // Denormalize medicine names
    const enriched = await Promise.all(medicines.map(async (m) => {
      const med = await Medicine.findById(m.medicine);
      return { ...m, medicineName: med ? med.name : 'Unknown' };
    }));
    const prescription = await Prescription.create({
      appointment: appointmentId,
      patient: appointment.patient,
      doctor: req.user._id,
      medicines: enriched,
      diagnosis,
      instructions
    });
    // Mark appointment completed
    await Appointment.findByIdAndUpdate(appointmentId, { status: 'completed' });
    await prescription.populate([
      { path: 'patient', select: 'name' },
      { path: 'doctor', select: 'name' }
    ]);
    res.status(201).json({ success: true, prescription });
  } catch (error) { next(error); }
};

// @route GET /api/prescriptions/my  (patient: own Rx)
exports.getMyPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate('doctor', 'name specialization')
      .populate('appointment', 'date timeSlot')
      .sort({ createdAt: -1 });
    res.json({ success: true, prescriptions });
  } catch (error) { next(error); }
};

// @route GET /api/prescriptions/pending  (pharmacist: undispensed Rx)
exports.getPendingDispense = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ dispensed: false })
      .populate('patient', 'name age')
      .populate('doctor', 'name')
      .populate('appointment', 'date')
      .sort({ createdAt: -1 });
    res.json({ success: true, prescriptions });
  } catch (error) { next(error); }
};

// @route GET /api/prescriptions/:id
exports.getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name age gender phone')
      .populate('doctor', 'name specialization')
      .populate('appointment', 'date timeSlot symptoms');
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    res.json({ success: true, prescription });
  } catch (error) { next(error); }
};

// @route PUT /api/prescriptions/:id/dispense  (pharmacist)
exports.dispensePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    if (prescription.dispensed) {
      return res.status(400).json({ success: false, message: 'Already dispensed' });
    }
    // Deduct stock for each medicine
    for (const item of prescription.medicines) {
      const med = await Medicine.findById(item.medicine);
      if (!med) continue;
      if (med.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.medicineName}. Available: ${med.quantity}`
        });
      }
      await Medicine.findByIdAndUpdate(item.medicine, { $inc: { quantity: -item.quantity } });
    }
    // Mark dispensed
    prescription.dispensed = true;
    prescription.dispensedAt = new Date();
    prescription.dispensedBy = req.user._id;
    await prescription.save();

    // Create dispense log
    await DispenseLog.create({
      prescription: prescription._id,
      patient: prescription.patient,
      pharmacist: req.user._id,
      medicines: prescription.medicines.map(m => ({
        medicine: m.medicine,
        medicineName: m.medicineName,
        quantityDispensed: m.quantity
      })),
      remarks: req.body.remarks
    });

    res.json({ success: true, message: 'Prescription dispensed successfully', prescription });
  } catch (error) { next(error); }
};

// @route GET /api/prescriptions/patient/:patientId  (doctor: patient history)
exports.getPatientHistory = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.params.patientId, doctor: req.user._id })
      .populate('appointment', 'date symptoms')
      .sort({ createdAt: -1 });
    res.json({ success: true, prescriptions });
  } catch (error) { next(error); }
};
