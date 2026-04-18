const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const { getTests, getTest, createTest, updateTest, deleteTest, submitTest } = require('../controllers/testController');

const router = express.Router();

router.use(protect);
router.get('/', getTests);
router.get('/:id', getTest);
router.post('/', adminOnly, createTest);
router.put('/:id', adminOnly, updateTest);
router.delete('/:id', adminOnly, deleteTest);
router.post('/:id/submit', submitTest); // student

module.exports = router;
