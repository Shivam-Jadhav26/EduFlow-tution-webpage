const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/tests/dashboard
const getTestDashboardStats = async (req, res, next) => {
  try {
    const totalPublished = await Test.countDocuments({ status: { $ne: 'draft' } });
    const evaluationPending = await Test.countDocuments({ status: 'draft' });
    const totalSubmissions = await TestAttempt.countDocuments({ status: 'submitted' });

    return sendSuccess(res, {
      totalPublished,
      evaluationPending,
      totalSubmissions,
    });
  } catch (err) { next(err); }
};

// GET /api/tests/:id/submissions
const getTestSubmissions = async (req, res, next) => {
  try {
    const submissions = await TestAttempt.find({ testId: req.params.id })
      .populate('studentId', 'name email class')
      .sort({ submittedAt: -1 });
    
    return sendSuccess(res, { submissions });
  } catch (err) { next(err); }
};

// GET /api/tests
const getTests = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'student') {
      // Students see tests targeted at their batch or class
      const user = await User.findById(req.user._id).populate('batch');
      const batchId = user.batch?._id;
      const cls = user.class;
      query.$or = [
        { targetBatches: batchId },
        { class: cls },
      ];
      if (req.query.status) query.status = req.query.status;
    } else {
      // Admin sees all
      if (req.query.status) query.status = req.query.status;
      if (req.query.subject) query.subject = req.query.subject;
      if (req.query.class) query.class = req.query.class;
    }

    const tests = await Test.find(query)
      .sort({ date: -1 })
      .populate('targetBatches', 'name')
      .populate('createdBy', 'name');

    // For students, don't expose questions until test starts
    const safeTests = tests.map((t) => {
      const obj = t.toObject();
      if (req.user.role === 'student') delete obj.questions;
      return obj;
    });

    return sendSuccess(res, { tests: safeTests });
  } catch (err) { next(err); }
};

// GET /api/tests/:id
const getTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('targetBatches', 'name')
      .populate('createdBy', 'name');
    if (!test) return sendError(res, 'Test not found.', 404);

    const obj = test.toObject();

    // Students only get questions if the test is upcoming/ongoing and they haven't submitted yet
    if (req.user.role === 'student') {
      const attempt = await TestAttempt.findOne({ testId: test._id, studentId: req.user._id });
      if (attempt && attempt.status === 'submitted') {
        // Show questions with correct answers after submission
        return sendSuccess(res, { test: obj, attempt });
      }
      if (test.status === 'completed') {
        return sendError(res, 'This test is no longer available.', 403);
      }
    }

    return sendSuccess(res, { test: obj });
  } catch (err) { next(err); }
};

// POST /api/tests — admin creates test
const createTest = async (req, res, next) => {
  try {
    const { title, subject, date, duration, totalMarks, class: cls, targetBatches, questions, status } = req.body;
    if (!title || !subject || !date || !duration || !totalMarks) {
      return sendError(res, 'Title, subject, date, duration, and totalMarks are required.', 400);
    }
    const test = await Test.create({
      title, subject, date, duration, totalMarks,
      class: cls, targetBatches, questions: questions || [],
      status: status || 'draft', createdBy: req.user._id,
    });
    return sendSuccess(res, { test }, 'Test created.', 201);
  } catch (err) { next(err); }
};

// PUT /api/tests/:id
const updateTest = async (req, res, next) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!test) return sendError(res, 'Test not found.', 404);
    return sendSuccess(res, { test }, 'Test updated.');
  } catch (err) { next(err); }
};

// DELETE /api/tests/:id
const deleteTest = async (req, res, next) => {
  try {
    await Test.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'Test deleted.');
  } catch (err) { next(err); }
};

// POST /api/tests/:id/submit — student submits test
const submitTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return sendError(res, 'Test not found.', 404);

    const { answers } = req.body; // [{ questionIndex, selectedOption }]

    // Calculate score
    let score = 0;
    if (Array.isArray(answers)) {
      answers.forEach(({ questionIndex, selectedOption }) => {
        const q = test.questions[questionIndex];
        if (q && q.correctAnswer === selectedOption) score += 1;
      });
      // Scale to totalMarks
      score = Math.round((score / test.questions.length) * test.totalMarks);
    }

    const attempt = await TestAttempt.findOneAndUpdate(
      { testId: test._id, studentId: req.user._id },
      {
        answers: answers || [],
        score,
        totalMarks: test.totalMarks,
        submittedAt: new Date(),
        status: 'submitted',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return sendSuccess(res, { attempt, score, totalMarks: test.totalMarks }, 'Test submitted successfully!');
  } catch (err) { next(err); }
};

module.exports = { getTests, getTest, createTest, updateTest, deleteTest, submitTest, getTestDashboardStats, getTestSubmissions };
