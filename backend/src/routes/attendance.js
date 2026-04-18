const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const { getAttendance, getMyStats, markAttendance, getBatchStats } = require('../controllers/attendanceController');

const router = express.Router();

router.use(protect);
router.get('/stats/me', getMyStats);
router.get('/stats', adminOnly, getBatchStats);
router.get('/', getAttendance);
router.post('/', adminOnly, markAttendance);

module.exports = router;
