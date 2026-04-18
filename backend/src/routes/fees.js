const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const { getMyFees, getAllFees, getFeeStats, createFee, updateFee } = require('../controllers/feeController');

const router = express.Router();

router.use(protect);
router.get('/me', getMyFees);
router.get('/stats', adminOnly, getFeeStats);
router.get('/', adminOnly, getAllFees);
router.post('/', adminOnly, createFee);
router.put('/:id', adminOnly, updateFee);

module.exports = router;
