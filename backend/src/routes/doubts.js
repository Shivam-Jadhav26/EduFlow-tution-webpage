const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const { getDoubts, getDoubt, createDoubt, replyToDoubt, resolveDoubt, getDoubtStats } = require('../controllers/doubtController');

const router = express.Router();

router.use(protect);
router.get('/admin-stats', adminOnly, getDoubtStats);
router.get('/', getDoubts);
router.get('/:id', getDoubt);
router.post('/', createDoubt);
router.post('/:id/reply', replyToDoubt);
router.patch('/:id', adminOnly, resolveDoubt);

module.exports = router;
