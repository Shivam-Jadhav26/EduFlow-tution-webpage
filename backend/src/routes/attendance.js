const express = require('express');
const { protect, adminOnly, requireBatch } = require('../middlewares/auth');
const { getAttendance, getMyStats, markAttendance, getBatchStats, getAdminDashboardStats } = require('../controllers/attendanceController');

const router = express.Router();

router.use(protect);
router.use(requireBatch);
router.get('/stats/me', getMyStats);
router.get('/stats', adminOnly, getBatchStats);
router.get('/dashboard', adminOnly, getAdminDashboardStats);
router.get('/', getAttendance);
router.post('/', adminOnly, markAttendance);

module.exports = router;
