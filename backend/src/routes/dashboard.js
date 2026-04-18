const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const { getAdminDashboard, getStudentDashboard, getPublicStats } = require('../controllers/dashboardController');

const router = express.Router();

// Publicly exposed analytics for landing pages
router.get('/public', getPublicStats);

router.use(protect);
router.get('/admin', adminOnly, getAdminDashboard);
router.get('/student', getStudentDashboard);

module.exports = router;
