const express = require('express');
const {
  getDoctors, getAvailableSlots, bookAppointment,
  getMyAppointments, getDoctorQueue, updateStatus, cancelAppointment
} = require('../controllers/appointment.controller');
const { verifyToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);

router.get('/doctors', getDoctors);
router.get('/slots/:doctorId/:date', getAvailableSlots);
router.post('/', authorizeRole('patient'), bookAppointment);
router.get('/my', authorizeRole('patient'), getMyAppointments);
router.get('/queue', authorizeRole('doctor'), getDoctorQueue);
router.put('/:id/status', authorizeRole('doctor'), updateStatus);
router.delete('/:id', authorizeRole('patient'), cancelAppointment);

module.exports = router;
