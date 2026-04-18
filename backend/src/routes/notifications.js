const express = require('express');
const { protect, adminOnly } = require('../middlewares/auth');
const { getMyNotifications, markRead, createNotification } = require('../controllers/notificationController');

const router = express.Router();

router.use(protect);
router.get('/me', getMyNotifications);
router.patch('/:id/read', markRead);
router.post('/', adminOnly, createNotification);

module.exports = router;
