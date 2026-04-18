const Notification = require('../models/Notification');
const FeeRecord = require('../models/FeeRecord');
const Test = require('../models/Test');
const Attendance = require('../models/Attendance');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/notifications/me — mapped to user, batch, or globally mapped variants
const getMyNotifications = async (req, res, next) => {
  try {
    const queryBlock = [{ userId: req.user._id }, { userId: null, batchId: null, targetClass: null }];
    if (req.user.batch) queryBlock.push({ batchId: req.user.batch });
    if (req.user.class) queryBlock.push({ targetClass: req.user.class });
    
    const notifications = await Notification.find({ $or: queryBlock }).sort({ date: -1 });
    return sendSuccess(res, { notifications });
  } catch (err) { next(err); }
};

// GET /api/notifications — admin network logs
const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({})
      .populate('userId', 'name')
      .populate('batchId', 'name')
      .sort({ date: -1 });
    return sendSuccess(res, { notifications });
  } catch (err) { next(err); }
};

// DELETE /api/notifications/:id — admin purge
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'Notification purged.');
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

// POST /api/notifications — create network push
const createNotification = async (req, res, next) => {
  try {
    const { userId, batchId, targetClass, title, message, type, status } = req.body;
    if (!title || !message) return sendError(res, 'Title and message are required.', 400);
    const notif = await Notification.create({ 
      userId: userId || null, 
      batchId: batchId || null,
      targetClass: targetClass || null,
      title, 
      message, 
      type: type || 'info',
      status: status || 'sent'
    });
    return sendSuccess(res, { notification: notif }, 'Notification saved.', 201);
  } catch (err) { next(err); }
};

// PUT /api/notifications/:id/status — publish draft
const updateStatus = async (req, res, next) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    return sendSuccess(res, { notification: notif });
  } catch(err) { next(err); }
};

// GET /api/notifications/alerts-summary — admin generic counting route
const getAlertsSummary = async (req, res, next) => {
  try {
    const feeCount = await FeeRecord.countDocuments({ status: { $in: ['pending', 'overdue'] } });
    const testsCount = await Test.countDocuments({ status: 'published' });
    const absentCount = await Attendance.countDocuments({ status: 'absent' });
    
    return sendSuccess(res, {
       alerts: { feeOverdue: feeCount, lowAttendance: absentCount, testResults: testsCount }
    });
  } catch(err) { next(err) }
};

module.exports = { getMyNotifications, getAllNotifications, markRead, createNotification, deleteNotification, updateStatus, getAlertsSummary };
