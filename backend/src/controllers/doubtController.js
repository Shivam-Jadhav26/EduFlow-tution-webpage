const Doubt = require('../models/Doubt');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/doubts — student: own; admin: all (filterable)
const getDoubts = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else {
      if (req.query.status) query.status = req.query.status;
      if (req.query.subject) query.subject = req.query.subject;
    }
    const doubts = await Doubt.find(query)
      .populate('studentId', 'name email class')
      .sort({ createdAt: -1 });
    return sendSuccess(res, { doubts });
  } catch (err) { next(err); }
};

// GET /api/doubts/:id
const getDoubt = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id).populate('studentId', 'name email');
    if (!doubt) return sendError(res, 'Doubt not found.', 404);
    return sendSuccess(res, { doubt });
  } catch (err) { next(err); }
};

// POST /api/doubts — student raises a doubt
const createDoubt = async (req, res, next) => {
  try {
    const { subject, question } = req.body;
    if (!subject || !question) return sendError(res, 'Subject and question are required.', 400);
    const doubt = await Doubt.create({ studentId: req.user._id, subject, question });
    return sendSuccess(res, { doubt }, 'Doubt submitted successfully.', 201);
  } catch (err) { next(err); }
};

// POST /api/doubts/:id/reply — admin or student replies
const replyToDoubt = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return sendError(res, 'Reply text is required.', 400);

    const reply = {
      authorId: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      text,
      createdAt: new Date(),
    };

    const doubt = await Doubt.findByIdAndUpdate(
      req.params.id,
      { $push: { replies: reply } },
      { new: true }
    );
    if (!doubt) return sendError(res, 'Doubt not found.', 404);
    return sendSuccess(res, { doubt }, 'Reply added.');
  } catch (err) { next(err); }
};

// PATCH /api/doubts/:id — admin marks as resolved
const resolveDoubt = async (req, res, next) => {
  try {
    const doubt = await Doubt.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved' },
      { new: true }
    );
    if (!doubt) return sendError(res, 'Doubt not found.', 404);
    return sendSuccess(res, { doubt }, 'Doubt marked as resolved.');
  } catch (err) { next(err); }
};

module.exports = { getDoubts, getDoubt, createDoubt, replyToDoubt, resolveDoubt };
