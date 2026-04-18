const User = require('../models/User');
const Batch = require('../models/Batch');
const { sendSuccess, sendError } = require('../utils/response');

const getTimetable = async (req, res, next) => {
  try {
    let batchId = req.query.batchId;

    // Students: auto-use their own batch
    if (req.user.role === 'student' && !batchId) {
      batchId = req.user.batch;
    }

    if (!batchId) {
       return sendSuccess(res, { timetable: [] });
    }

    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    let entries = [];

    // DIRECT DATABASE FETCH FROM BATCHES
    const batch = await Batch.findById(batchId);
    if (batch && batch.schedule && typeof batch.schedule === 'string') {
      const parts = batch.schedule.split('|');
      if (parts.length === 2) {
        const daysStr = parts[0].trim();
        const timeStr = parts[1].trim();
        
        const dayMap = {
          'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday',
          'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday'
        };

        const rawDays = daysStr.split(',').map(d => d.trim());
        
        rawDays.forEach((rawDay, index) => {
          const fullDay = dayMap[rawDay] || rawDay;
          entries.push({
            _id: `auto-${index}`,
            day: fullDay,
            time: timeStr,
            subject: batch.name + ' Class',
            teacher: batch.teacher || 'Main Faculty',
            room: 'Main Hall',
            batchId: {
              _id: batch._id,
              name: batch.name,
              class: batch.class
            },
            type: 'class'
          });
        });
      }
    }

    // Sort by day order
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
