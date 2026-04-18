const User = require('../models/User');
const Batch = require('../models/Batch');
const Attendance = require('../models/Attendance');
const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');
const FeeRecord = require('../models/FeeRecord');
const Doubt = require('../models/Doubt');
const TimetableEntry = require('../models/TimetableEntry');
const { sendSuccess } = require('../utils/response');

// GET /api/dashboard/admin
const getAdminDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);

    const [totalStudents, totalBatches, pendingFees, todayAttendance, allStudents, unresolvedDoubts] = await Promise.all([
      User.countDocuments({ role: 'student', status: 'active' }),
      Batch.countDocuments({ isActive: true }),
      FeeRecord.aggregate([
        { $match: { status: { $in: ['pending', 'overdue'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: { $ne: 'absent' } }),
      User.countDocuments({ role: 'student', status: 'active' }),
      Doubt.countDocuments({ status: 'pending' }),
    ]);

    const todayPct = allStudents > 0 ? Math.round((todayAttendance / allStudents) * 100) : 0;

    // Enrollments per day of week (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const recentEnrollments = await User.aggregate([
      { $match: { role: 'student', createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' }, // 1=Sun, 2=Mon...
          count: { $sum: 1 },
        },
      },
    ]);
    const dayMap = { 1: 'Sun', 2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat' };
    const enrollmentData = Object.entries(dayMap).map(([k, name]) => ({
      name,
      count: recentEnrollments.find((e) => e._id === parseInt(k))?.count || 0,
    }));

    // Fee collections by month (last 4 months)
    const feeCollections = await FeeRecord.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: '$month', amount: { $sum: '$amount' } } },
      { $sort: { _id: -1 } },
      { $limit: 4 },
    ]);

    // Class distribution
    const classDistrib = await User.aggregate([
      { $match: { role: 'student', status: 'active' } },
      { $group: { _id: '$class', value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]);

    // Recent unresolved doubts
    const latestDoubts = await Doubt.find({ status: 'pending' })
      .populate('studentId', 'name')
      .sort({ createdAt: -1 })
      .limit(3);

    return sendSuccess(res, {
      kpis: {
        totalStudents,
        totalBatches,
        pendingFees: pendingFees[0]?.total || 0,
        todayAttendancePct: todayPct,
        unresolvedDoubts,
      },
      enrollmentData,
      feeCollections: feeCollections.map((f) => ({ month: f._id, amount: f.amount })).reverse(),
      classDistribution: classDistrib.map((c) => ({ name: `Class ${c._id}`, value: c.value })),
      latestDoubts: latestDoubts.map((d) => ({
        student: d.studentId?.name,
        subject: d.subject,
        query: d.question.substring(0, 60) + '...',
        time: d.createdAt,
      })),
    });
  } catch (err) { next(err); }
};

// GET /api/dashboard/student
const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const student = await User.findById(studentId).populate('batch');

    const [
      attendanceRecords,
      testAttempts,
      doubts,
      upcomingClasses,
      recentResults,
    ] = await Promise.all([
      Attendance.find({ studentId }),
      TestAttempt.find({ studentId, status: 'submitted' }),
      Doubt.countDocuments({ studentId }),
      TimetableEntry.find({ batchId: student.batch?._id }).sort({ day: 1, time: 1 }).limit(3).populate('batchId', 'name'),
      TestAttempt.find({ studentId, status: 'submitted' })
        .sort({ submittedAt: -1 })
        .limit(3)
        .populate('testId', 'title subject totalMarks'),
    ]);

    // Attendance %
    const totalAtt = attendanceRecords.length;
    const presentAtt = attendanceRecords.filter((r) => r.status !== 'absent').length;
    const attendancePct = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

    // Avg score
    const avgScore =
      testAttempts.length > 0
        ? Math.round(testAttempts.reduce((s, a) => s + (a.score / a.totalMarks) * 100, 0) / testAttempts.length)
        : 0;

    // Monthly performance trend (last 5 months)
    const months = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({ label: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() + 1 });
    }
    const performanceData = await Promise.all(
      months.map(async (m) => {
        const start = new Date(m.year, m.month - 1, 1);
        const end = new Date(m.year, m.month, 0);
        const monthAttempts = await TestAttempt.find({
          studentId,
          status: 'submitted',
          submittedAt: { $gte: start, $lte: end },
        });
        const score = monthAttempts.length
          ? Math.round(monthAttempts.reduce((s, a) => s + (a.score / a.totalMarks) * 100, 0) / monthAttempts.length)
          : 0;
        return { name: m.label, score };
      })
    );

    return sendSuccess(res, {
      stats: {
        attendancePct,
        avgScore,
        totalDoubts: doubts,
        testsTaken: testAttempts.length,
      },
      performanceData,
      upcomingClasses: upcomingClasses.map((c) => ({
        subject: c.subject,
        teacher: c.teacher,
        time: c.time,
        day: c.day,
      })),
      recentResults: recentResults.map((r) => ({
        test: r.testId?.title,
        subject: r.testId?.subject,
        score: `${r.score}/${r.totalMarks}`,
        date: r.submittedAt,
        passed: r.score >= r.totalMarks * 0.35,
      })),
    });
  } catch (err) { next(err); }
};

module.exports = { getAdminDashboard, getStudentDashboard };
