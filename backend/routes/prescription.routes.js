const express = require('express');
const {
  createPrescription, getMyPrescriptions, getPendingDispense,
  getPrescriptionById, dispensePrescription, getPatientHistory
} = require('../controllers/prescription.controller');
const { verifyToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.post('/', authorizeRole('doctor'), createPrescription);
router.get('/my', authorizeRole('patient'), getMyPrescriptions);
router.get('/pending', authorizeRole('pharmacist', 'admin'), getPendingDispense);
router.get('/patient/:patientId', authorizeRole('doctor'), getPatientHistory);
router.get('/:id', getPrescriptionById);
router.put('/:id/dispense', authorizeRole('pharmacist', 'admin'), dispensePrescription);

module.exports = router;
