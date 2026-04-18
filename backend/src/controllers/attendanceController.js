const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/attendance — student: own; admin: by batchId+date
const getAttendance = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'student') {
      query.studentId = req.user._id;
      if (req.query.month) {
        const [year, month] = req.query.month.split('-');
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        query.date = { $gte: start, $lte: end };
      }
    } else {
      if (req.query.studentId) query.studentId = req.query.studentId;
      if (req.query.batchId) query.batchId = req.query.batchId;
      if (req.query.date) {
        const d = new Date(req.query.date);
        query.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
      }
    }

    const records = await Attendance.find(query)
      .populate('studentId', 'name email class')
      .populate('batchId', 'name')
      .sort({ date: -1 });

    return sendSuccess(res, { attendance: records });
  } catch (err) { next(err); }
};

// GET /api/attendance/stats/me — student's own attendance summary
const getMyStats = async (req, res, next) => {
  try {
    const records = await Attendance.find({ studentId: req.user._id });
    const total = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const late = records.filter((r) => r.status === 'late').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    // Group by subject
    const bySubject = {};
    records.forEach((r) => {
      if (!r.subject) return;
      if (!bySubject[r.subject]) bySubject[r.subject] = { total: 0, attended: 0 };
      bySubject[r.subject].total += 1;
      if (r.status !== 'absent') bySubject[r.subject].attended += 1;
    });

    const subjectStats = Object.entries(bySubject).map(([name, v]) => ({
      name,
      pct: Math.round((v.attended / v.total) * 100),
    }));

    return sendSuccess(res, { total, present, late, absent, percentage, subjectStats });
  } catch (err) { next(err); }
};

// POST /api/attendance — admin marks attendance (bulk)
const markAttendance = async (req, res, next) => {
  try {
    const { records } = req.body;
    // records: [{ studentId, batchId, date, status, subject }]
    if (!Array.isArray(records) || records.length === 0) {
      return sendError(res, 'records array is required.', 400);
    }

    const ops = records.map((r) => ({
      updateOne: {
        filter: { studentId: r.studentId, batchId: r.batchId, date: new Date(r.date), subject: r.subject || '' },
        update: { $set: { status: r.status, markedBy: req.user._id } },
        upsert: true,
      },
    }));

    const result = await Attendance.bulkWrite(ops);
    return sendSuccess(res, { result }, 'Attendance recorded.');
  } catch (err) { next(err); }
};

// GET /api/attendance/stats?batchId=x — admin batch stats
const getBatchStats = async (req, res, next) => {
  try {
    const { batchId } = req.query;
    if (!batchId) return sendError(res, 'batchId is required.', 400);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);

    const [todayRecords, allStudents] = await Promise.all([
      Attendance.find({ batchId, date: { $gte: today, $lt: tomorrow } }),
      User.countDocuments({ batch: batchId, role: 'student', status: 'active' }),
    ]);

    const todayPresent = todayRecords.filter((r) => r.status !== 'absent').length;
    const todayPct = allStudents > 0 ? Math.round((todayPresent / allStudents) * 100) : 0;

    return sendSuccess(res, { todayPresent, totalStudents: allStudents, todayPct });
  } catch (err) { next(err); }
};

module.exports = { getAttendance, getMyStats, markAttendance, getBatchStats };
