const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const { getTimetable, createEntry, updateEntry, deleteEntry } = require('../controllers/timetableController');

const router = express.Router();

router.use(protect);
router.get('/', getTimetable);
router.post('/', adminOnly, createEntry);
router.put('/:id', adminOnly, updateEntry);
router.delete('/:id', adminOnly, deleteEntry);

module.exports = router;
