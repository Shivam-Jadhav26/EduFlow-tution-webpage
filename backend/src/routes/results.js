const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const { getMyResults, getResultsByTest, getResultsByStudent, getAdminResultDashboard } = require('../controllers/resultController');

const router = express.Router();

router.use(protect);
router.get('/dashboard', adminOnly, getAdminResultDashboard);
router.get('/me', getMyResults);
router.get('/student/:studentId', adminOnly, getResultsByStudent);
router.get('/', adminOnly, getResultsByTest);

module.exports = router;
