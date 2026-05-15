const User = require('../models/User');
const Batch = require('../models/Batch');
const TimetableEntry = require('../models/TimetableEntry');
const { sendSuccess, sendError } = require('../utils/response');

const getTimetable = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.batchId) {
      query.batchId = req.query.batchId;
    } else if (req.user.role === 'student') {
      query.batchId = req.user.batch;
    }

    const entries = await TimetableEntry.find(query).populate('batchId', 'name class');

    // Sort by day order
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    entries.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

    return sendSuccess(res, { timetable: entries });
  } catch (err) { next(err); }
};

const createEntry = async (req, res, next) => {
  try {
    const { day, time, subject, teacher, room, batchId, type } = req.body;
    if (!day || !time || !subject || !teacher || !batchId) {
      return sendError(res, 'Day, time, subject, teacher, and batchId are required.', 400);
    }
    const entry = await TimetableEntry.create({ day, time, subject, teacher, room, batchId, type: type || 'class' });
    return sendSuccess(res, { entry }, 'Timetable entry created.', 201);
  } catch (err) { next(err); }
};

const updateEntry = async (req, res, next) => {
  try {
    const entry = await TimetableEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!entry) return sendError(res, 'Timetable entry not found.', 404);
    return sendSuccess(res, { entry }, 'Entry updated.');
  } catch (err) { next(err); }
};

const deleteEntry = async (req, res, next) => {
  try {
    const entry = await TimetableEntry.findByIdAndDelete(req.params.id);
    if (!entry) return sendError(res, 'Timetable entry not found.', 404);
    return sendSuccess(res, null, 'Entry deleted.');
  } catch (err) { next(err); }
};

module.exports = { getTimetable, createEntry, updateEntry, deleteEntry };
