const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const { getAdminDashboard, getStudentDashboard } = require('../controllers/dashboardController');

const router = express.Router();

router.use(protect);
router.get('/admin', adminOnly, getAdminDashboard);
router.get('/student', getStudentDashboard);

module.exports = router;
