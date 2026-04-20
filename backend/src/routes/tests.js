const express = require('express');
const { protect, adminOnly, requireBatch } = require('../middlewares/auth');
const { getTests, getTest, createTest, updateTest, deleteTest, submitTest, getTestDashboardStats, getTestSubmissions } = require('../controllers/testController');

const router = express.Router();

router.use(protect);
router.use(requireBatch);
router.get('/dashboard', adminOnly, getTestDashboardStats);
router.get('/', getTests);
router.get('/:id', getTest);
router.get('/:id/submissions', adminOnly, getTestSubmissions);
router.post('/', adminOnly, createTest);
router.put('/:id', adminOnly, updateTest);
router.delete('/:id', adminOnly, deleteTest);
router.post('/:id/submit', submitTest); // student

module.exports = router;
