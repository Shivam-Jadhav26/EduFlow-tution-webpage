const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/notifications/me — student's own + broadcast (userId=null)
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [{ userId: req.user._id }, { userId: null }],
    }).sort({ date: -1 });
    return sendSuccess(res, { notifications });
  } catch (err) { next(err); }
};

// PATCH /api/notifications/:id/read
const markRead = async (req, res, next) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notif) return sendError(res, 'Notification not found.', 404);
    return sendSuccess(res, { notification: notif }, 'Marked as read.');
  } catch (err) { next(err); }
};

// POST /api/notifications — admin sends notification
const createNotification = async (req, res, next) => {
  try {
    const { userId, title, message, type } = req.body;
    if (!title || !message) return sendError(res, 'Title and message are required.', 400);
    const notif = await Notification.create({ userId: userId || null, title, message, type: type || 'info' });
    return sendSuccess(res, { notification: notif }, 'Notification sent.', 201);
  } catch (err) { next(err); }
};

module.exports = { getMyNotifications, markRead, createNotification };
