const express = require('express');
const { body } = require('express-validator');
const {
  getAllMedicines, addMedicine, getMedicineById, updateMedicine, deleteMedicine
} = require('../controllers/inventory.controller');
const { verifyToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllMedicines);
router.get('/:id', getMedicineById);
router.post('/', authorizeRole('admin'), [
  body('name').notEmpty().withMessage('Medicine name is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('category').notEmpty().withMessage('Category is required')
], addMedicine);
router.put('/:id', authorizeRole('admin', 'pharmacist'), updateMedicine);
router.delete('/:id', authorizeRole('admin'), deleteMedicine);

module.exports = router;
