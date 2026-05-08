const Medicine = require('../models/Medicine');
const { validationResult } = require('express-validator');

// @route GET /api/inventory
exports.getAllMedicines = async (req, res, next) => {
  try {
    const { category, lowStock, search } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    const medicines = await Medicine.find(query).sort({ name: 1 });
    const result = lowStock === 'true'
      ? medicines.filter(m => m.quantity <= m.threshold)
      : medicines;
    res.json({ success: true, count: result.length, medicines: result });
  } catch (error) { next(error); }
};

// @route POST /api/inventory
exports.addMedicine = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, medicine });
  } catch (error) { next(error); }
};

// @route GET /api/inventory/:id
exports.getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, medicine });
  } catch (error) { next(error); }
};

// @route PUT /api/inventory/:id
exports.updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, medicine });
  } catch (error) { next(error); }
};

// @route DELETE /api/inventory/:id
exports.deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, message: 'Medicine deactivated' });
  } catch (error) { next(error); }
};
