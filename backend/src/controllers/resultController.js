const TestAttempt = require('../models/TestAttempt');
const Test = require('../models/Test');
const { sendSuccess, sendError } = require('../utils/response');

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

module.exports = { getMyResults, getResultsByTest, getResultsByStudent };
