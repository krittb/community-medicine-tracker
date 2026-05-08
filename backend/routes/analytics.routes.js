const express = require('express');
const { getSummary, getWeeklyAppointments, getTopPrescribed, getStockStatus } = require('../controllers/analytics.controller');
const { verifyToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken);
router.use(authorizeRole('admin', 'doctor', 'pharmacist'));

router.get('/summary', getSummary);
router.get('/appointments/weekly', getWeeklyAppointments);
router.get('/medicines/top', getTopPrescribed);
router.get('/stock', getStockStatus);

module.exports = router;
