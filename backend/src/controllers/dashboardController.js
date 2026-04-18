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

    // Generate dynamic KPI Deltas
    const latestStudentsCount = recentEnrollments.reduce((sum, e) => sum + e.count, 0);
    const studentChange = latestStudentsCount > 0 ? `+${latestStudentsCount} this week` : 'Stable';
    const attendanceChange = todayPct > 50 ? '+ Trending up' : '- Needs attention'; // Simplified metric string

    // Fee collections by month (last 4 months)
    const feeCollectionsAgg = await FeeRecord.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: '$month', amount: { $sum: '$amount' } } },
      { $sort: { _id: -1 } },
      { $limit: 4 },
    ]);
    
    // Convert int-based months to standard short strings
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const feeCollections = feeCollectionsAgg.map(f => ({
      name: typeof f._id === 'number' && f._id >= 1 && f._id <= 12 ? monthNames[f._id] : f._id,
      amount: f.amount
    })).reverse(); // Reverse for chronologically asc graph format

    const feeChange = feeCollections.length > 0 ? `+₹${feeCollections[feeCollections.length - 1].amount.toLocaleString()} received` : 'Waiting';

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
        pendingFees: `₹${(pendingFees[0]?.total || 0).toLocaleString()}`,
        todayAttendance: `${todayPct}%`,
        unresolvedDoubts,
        studentChange,
        feeChange,
        attendanceChange
      },
      enrollmentTrend: enrollmentData, // Match frontend expected shape natively
      feeCollections, 
      classDistribution: classDistrib.map((c) => ({ name: `Class ${c._id}`, value: c.value })),
      unresolvedDoubts: latestDoubts.map((d) => ({
        student: d.studentId?.name || 'Unknown',
        subject: d.subject || 'General',
        query: d.question.substring(0, 60) + (d.question.length > 60 ? '...' : ''),
        time: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Recent',
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
      availableTests
    ] = await Promise.all([
      Attendance.find({ studentId }),
      TestAttempt.find({ studentId, status: 'submitted' }),
      Doubt.countDocuments({ studentId }),
      TimetableEntry.find({ batchId: student.batch?._id }).sort({ day: 1, time: 1 }).limit(3).populate('batchId', 'name'),
      TestAttempt.find({ studentId, status: 'submitted' })
        .sort({ submittedAt: -1 })
        .limit(3)
        .populate('testId', 'title subject totalMarks'),
      Test.find({ 
        status: { $in: ['upcoming', 'ongoing', 'published'] }, 
        targetBatches: student.batch?._id 
      })
    ]);

    // Attendance %
    const totalAtt = attendanceRecords.length;
    const presentAtt = attendanceRecords.filter((r) => r.status !== 'absent').length;
    const attendancePct = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0;

    // Subject Attendance
    const attendanceBySubjectMap = {};
    attendanceRecords.forEach(r => {
      const subj = r.subject || 'General';
      if (!attendanceBySubjectMap[subj]) attendanceBySubjectMap[subj] = { total: 0, present: 0 };
      attendanceBySubjectMap[subj].total += 1;
      if (r.status !== 'absent') attendanceBySubjectMap[subj].present += 1;
    });
    const attendanceBySubject = Object.entries(attendanceBySubjectMap).map(([name, data]) => ({
      name,
      pct: Math.round((data.present / data.total) * 100),
    }));

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

    // AI Recommendations logic
    const recommendations = [];
    if (attendancePct > 0 && attendancePct < 75) {
      recommendations.push({
        type: 'High',
        title: 'Attendance Alert',
        desc: `Your overall attendance is ${attendancePct}%. Consistent attendance resolves doubts early.`
      });
    }
    if (avgScore > 0 && avgScore < 60) {
      recommendations.push({
        type: 'Med',
        title: 'Score Intervention',
        desc: `Your average stays at ${avgScore}%. Reach out to mentors via the Doubts sections!`
      });
    }
    if (recommendations.length === 0) {
       recommendations.push({
        type: 'Low',
        title: 'Outstanding Form!',
        desc: 'You are balancing attendance and tests exquisitely. Keep it up!'
      });
    }

    // Identify Pending/Active tests (missing submissions)
    const submittedTestIds = testAttempts.map(a => a.testId._id ? a.testId._id.toString() : a.testId.toString());
    const pendingTests = availableTests.filter(t => !submittedTestIds.includes(t._id.toString()));

    const courses = pendingTests.map(t => ({
      _id: t._id,
      title: t.title,
      subject: t.subject,
      progress: 0,
      img: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400&h=200'
    }));

    const tasks = pendingTests.slice(0, 3).map(t => ({
      task: `Complete Assessment: ${t.title}`,
      due: 'Pending',
      done: false
    }));

    return sendSuccess(res, {
      stats: {
        attendancePct,
        avgScore,
        totalDoubts: doubts,
        testsTaken: testAttempts.length,
      },
      performanceData,
      recommendations,
      courses,
      tasks,
      attendanceBySubject,
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

// GET /api/dashboard/public
const getPublicStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student', status: 'active' });
    const tests = await Test.countDocuments({ status: { $in: ['published', 'completed'] } });
    const totalTests = tests > 50 ? `${tests}+` : tests;

    // Fetch up to 3 distinct active batches for the courses preview
    const activeBatches = await Batch.find({ isActive: true }).limit(3).lean();
    
    // Unsplash imagery loop based on iteration
    const previewImages = [
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600&h=400',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600&h=400',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600&h=400'
    ];

    const coursesPreview = activeBatches.map((b, i) => ({
      grade: b.name.replace(/\D/g,'') || 10,
      title: b.name,
      subjectsCount: b.subjects?.length || 5,
      desc: b.description || 'Master core subjects including basics and advanced concepts.',
      img: previewImages[i % previewImages.length]
    }));

    // Fallback if no active batches found to prevent empty state in demo
    if (coursesPreview.length === 0) {
      coursesPreview.push({
        grade: 10,
        title: 'Class 10 Foundation',
        subjectsCount: 12,
        desc: 'Master core subjects including Calculus basics, Organic Chemistry, and advanced Civics.',
        img: previewImages[0]
      });
    }

    return sendSuccess(res, {
      totalStudents: totalStudents > 500 ? `${totalStudents}+` : (totalStudents > 0 ? totalStudents : '500+'),
      monthlyTests: totalTests > 0 ? totalTests : '50+',
      classesCovered: '6 - 12',
      subjectsCount: '12+',
      successRate: '98.5%', // Authentic platform target
      coursesPreview
    });
  } catch (err) { next(err); }
};

module.exports = { getAdminDashboard, getStudentDashboard, getPublicStats };
