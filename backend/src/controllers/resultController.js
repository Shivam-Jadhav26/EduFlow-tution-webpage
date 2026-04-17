const TestAttempt = require('../models/TestAttempt');
const Test = require('../models/Test');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/results/dashboard — admin: aggregated graph reporting metrics
const getAdminResultDashboard = async (req, res, next) => {
  try {
    const attempts = await TestAttempt.find({ status: 'submitted' })
      .populate({
        path: 'studentId',
        select: 'name class batch',
        populate: { path: 'batch', select: 'name' }
      })
      .populate('testId', 'title subject')
      .sort({ submittedAt: -1 });

    if (attempts.length === 0) {
      return sendSuccess(res, { 
        average: 0, passingRate: 0, criticalCount: 0, topScorer: null,
        pieData: [0, 0, 0, 0], classPerformance: [], recentTabulations: []
      });
    }

    let totalPctSum = 0;
    let passingCount = 0;
    let highestPct = -1;
    let topScorerObj = null;

    let grades = [0, 0, 0, 0]; // A+, A, B, C
    const criticalStudentIds = new Set();
    const classStats = {}; 

    // Compute Tabulations (latest 10)
    const recentTabulations = attempts.slice(0, 10).map(a => {
      const pct = Math.round((a.score / Math.max(a.totalMarks, 1)) * 100);
      return {
        _id: a._id,
        name: a.studentId?.name || 'Unknown',
        batch: a.studentId?.batch?.name || 'All',
        subject: a.testId?.subject || 'Assessment',
        pct
      };
    });

    attempts.forEach(a => {
      const pct = Math.round((a.score / Math.max(a.totalMarks, 1)) * 100);
      totalPctSum += pct;
      
      if (pct >= 40) passingCount++;
      else if (a.studentId) criticalStudentIds.add(a.studentId._id.toString());
      
      if (pct > highestPct && a.studentId) {
        highestPct = pct;
        topScorerObj = { name: a.studentId.name, class: a.studentId.class, pct };
      }

      if (pct >= 90) grades[0]++;
      else if (pct >= 75) grades[1]++;
      else if (pct >= 60) grades[2]++;
      else grades[3]++;

      // Class Performance
      const cls = a.studentId?.class;
      if (cls) {
        if (!classStats[cls]) classStats[cls] = { total: 0, count: 0, max: -1, min: 999 };
        classStats[cls].total += pct;
        classStats[cls].count++;
        if (pct > classStats[cls].max) classStats[cls].max = pct;
        if (pct < classStats[cls].min) classStats[cls].min = pct;
      }
    });

    const outClsPerf = Object.keys(classStats).map(c => ({
      class: c + 'th',
      avg: Math.round(classStats[c].total / classStats[c].count),
      top: classStats[c].max,
      low: classStats[c].min === 999 ? 0 : classStats[c].min
    }));

    return sendSuccess(res, {
      average: Math.round(totalPctSum / attempts.length),
      passingRate: Math.round((passingCount / attempts.length) * 100),
      criticalCount: criticalStudentIds.size,
      topScorer: topScorerObj,
      pieData: grades,
      classPerformance: outClsPerf,
      recentTabulations
    });
  } catch (err) { next(err); }
};

// GET /api/results/me — student's own submitted attempts
const getMyResults = async (req, res, next) => {
  try {
    const attempts = await TestAttempt.find({ studentId: req.user._id, status: 'submitted' })
      .populate('testId', 'title subject date totalMarks')
      .sort({ submittedAt: -1 });

    const results = attempts.map((a) => ({
      id: a._id,
      testId: a.testId?._id,
      testTitle: a.testId?.title,
      subject: a.testId?.subject,
      date: a.submittedAt || a.testId?.date,
      score: a.score,
      totalMarks: a.totalMarks,
      percentage: Math.round((a.score / a.totalMarks) * 100),
      passed: a.score >= a.totalMarks * 0.35,
    }));

    return sendSuccess(res, { results });
  } catch (err) { next(err); }
};

// GET /api/results?testId=x — admin: all results for a test
const getResultsByTest = async (req, res, next) => {
  try {
    const { testId } = req.query;
    if (!testId) return sendError(res, 'testId query param is required.', 400);

    const attempts = await TestAttempt.find({ testId, status: 'submitted' })
      .populate('studentId', 'name email class')
      .sort({ score: -1 });

    return sendSuccess(res, { results: attempts });
  } catch (err) { next(err); }
};

// GET /api/results/student/:studentId — admin: all results for a student
const getResultsByStudent = async (req, res, next) => {
  try {
    const attempts = await TestAttempt.find({ studentId: req.params.studentId, status: 'submitted' })
      .populate('testId', 'title subject date totalMarks')
      .sort({ submittedAt: -1 });

    return sendSuccess(res, { results: attempts });
  } catch (err) { next(err); }
};

module.exports = { getMyResults, getResultsByTest, getResultsByStudent, getAdminResultDashboard };
