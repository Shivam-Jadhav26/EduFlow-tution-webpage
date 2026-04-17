const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');

const router = express.Router();

router.use(protect);
router.get('/', getAnnouncements);
router.post('/', adminOnly, createAnnouncement);
router.put('/:id', adminOnly, updateAnnouncement);
router.delete('/:id', adminOnly, deleteAnnouncement);

module.exports = router;
