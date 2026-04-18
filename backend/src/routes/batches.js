const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const { getBatches, getBatch, createBatch, updateBatch, deleteBatch } = require('../controllers/batchController');

const router = express.Router();

router.use(protect);
router.get('/', getBatches);
router.get('/:id', getBatch);
router.post('/', adminOnly, createBatch);
router.put('/:id', adminOnly, updateBatch);
router.delete('/:id', adminOnly, deleteBatch);

module.exports = router;
