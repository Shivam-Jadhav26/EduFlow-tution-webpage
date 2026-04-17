const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const { getMyNotifications, getAllNotifications, markRead, createNotification, deleteNotification, updateStatus, getAlertsSummary } = require('../controllers/notificationController');

const router = express.Router();

router.use(protect);
router.get('/alerts-summary', adminOnly, getAlertsSummary);
router.get('/', adminOnly, getAllNotifications);
router.get('/me', getMyNotifications);
router.patch('/:id/read', markRead);
router.put('/:id/status', adminOnly, updateStatus);
router.post('/', adminOnly, createNotification);
router.delete('/:id', adminOnly, deleteNotification);

module.exports = router;
