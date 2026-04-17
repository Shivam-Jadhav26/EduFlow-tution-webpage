const User = require('../models/User');
const Batch = require('../models/Batch');
const TestAttempt = require('../models/TestAttempt');
const Attendance = require('../models/Attendance');
const { sendSuccess } = require('../utils/response');

// GET /api/analytics — admin analytics page data
const getAnalytics = async (req, res, next) => {
  try {
    // 1. Subject-wise performance trends (last 5 months)
    const months = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({ label: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() + 1 });
    }

    const subjectTrends = await Promise.all(
      months.map(async (m) => {
        const start = new Date(m.year, m.month - 1, 1);
        const end = new Date(m.year, m.month, 0);
        const attempts = await TestAttempt.find({
          submittedAt: { $gte: start, $lte: end },
          status: 'submitted',
        }).populate('testId', 'subject totalMarks');

        const bySubject = {};
        attempts.forEach((a) => {
          const sub = a.testId?.subject;
          if (!sub) return;
          if (!bySubject[sub]) bySubject[sub] = { total: 0, count: 0 };
          bySubject[sub].total += (a.score / a.totalMarks) * 100;
          bySubject[sub].count += 1;
        });

        return {
          month: m.label,
          math: Math.round(bySubject['Mathematics']?.count > 0 ? bySubject['Mathematics'].total / bySubject['Mathematics'].count : 0),
          science: Math.round(bySubject['Science']?.count > 0 ? bySubject['Science'].total / bySubject['Science'].count : 0),
          english: Math.round(bySubject['English']?.count > 0 ? bySubject['English'].total / bySubject['English'].count : 0),
        };
      })
    );

    // 2. Batch performance
    const batches = await Batch.find({ isActive: true });
    const batchPerformance = await Promise.all(
      batches.map(async (b) => {
        const students = await User.find({ batch: b._id, role: 'student', status: 'active' }).select('_id');
        const studentIds = students.map((s) => s._id);
        const attempts = await TestAttempt.find({ studentId: { $in: studentIds }, status: 'submitted' });
        if (!attempts.length) return { batch: b.name, avg: 0, top: 0 };
        const pcts = attempts.map((a) => Math.round((a.score / a.totalMarks) * 100));
        const avg = Math.round(pcts.reduce((s, v) => s + v, 0) / pcts.length);
        const top = Math.max(...pcts);
        return { batch: b.name, avg, top };
      })
    );

    // 3. Dropout risk (by attendance)
    const allStudents = await User.find({ role: 'student', status: 'active' }).select('_id');
    let low = 0, medium = 0, high = 0;
    await Promise.all(
      allStudents.map(async (s) => {
        const records = await Attendance.find({ studentId: s._id });
        const total = records.length;
        if (total === 0) { high++; return; }
        const present = records.filter((r) => r.status !== 'absent').length;
        const pct = (present / total) * 100;
        if (pct >= 80) low++;
        else if (pct >= 60) medium++;
        else high++;
      })
    );

    // 4. KPIs
    const totalStudents = allStudents.length;
    const allAttempts = await TestAttempt.find({ status: 'submitted' });
    const avgScore = allAttempts.length
      ? Math.round(allAttempts.reduce((s, a) => s + (a.score / a.totalMarks) * 100, 0) / allAttempts.length * 10) / 10
      : 0;

    return sendSuccess(res, {
      kpis: {
        retentionRate: totalStudents > 0 ? Math.round((low / totalStudents) * 100 * 10) / 10 : 0,
        avgTestScore: avgScore,
        engagementScore: 8.4, // Could be computed from login frequency in future
      },
      subjectTrends,
      batchPerformance,
      dropoutRisk: [
        { name: 'Low Risk', value: low },
        { name: 'Medium Risk', value: medium },
        { name: 'High Risk', value: high },
      ],
    });
  } catch (err) { next(err); }
};

module.exports = { getAnalytics };
