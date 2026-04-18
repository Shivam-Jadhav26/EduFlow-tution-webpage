const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const { getMyFees, getAllFees, getFeeStats, createFee, updateFee, deleteFee } = require('../controllers/feeController');

const router = express.Router();

router.use(protect);
router.get('/me', getMyFees);
router.get('/stats', adminOnly, getFeeStats);
router.get('/', adminOnly, getAllFees);
router.post('/', adminOnly, createFee);
router.put('/:id', adminOnly, updateFee);
router.delete('/:id', adminOnly, deleteFee);

module.exports = router;
