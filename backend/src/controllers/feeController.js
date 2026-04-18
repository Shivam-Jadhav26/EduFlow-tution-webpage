const FeeRecord = require('../models/FeeRecord');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/fees/me — student's own fee records
const getMyFees = async (req, res, next) => {
  try {
    const fees = await FeeRecord.find({ studentId: req.user._id }).sort({ dueDate: -1 });
    return sendSuccess(res, { fees });
  } catch (err) { next(err); }
};

// GET /api/fees — admin: all fee records with filters
const getAllFees = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.studentId) query.studentId = req.query.studentId;
    if (req.query.status) query.status = req.query.status;
    if (req.query.month) query.month = { $regex: req.query.month, $options: 'i' };

    const fees = await FeeRecord.find(query)
      .populate('studentId', 'name email class')
      .sort({ createdAt: -1 });
    return sendSuccess(res, { fees });
  } catch (err) { next(err); }
};

// GET /api/fees/stats — admin: aggregate stats
const getFeeStats = async (req, res, next) => {
  try {
    const [totalCollection, pendingDues, overdueDues, activeDiscounts] = await Promise.all([
      FeeRecord.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      FeeRecord.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      FeeRecord.aggregate([
        { $match: { status: 'overdue' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      FeeRecord.countDocuments({ status: 'pending' }),
    ]);

    const monthlyTrend = await FeeRecord.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: '$month', amount: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]);

    return sendSuccess(res, {
      totalCollection: totalCollection[0]?.total || 0,
      pendingDues: pendingDues[0]?.total || 0,
      overdueAmount: overdueDues[0]?.total || 0,
      overdueCount: overdueDues[0]?.count || 0,
      pendingCount: activeDiscounts,
      monthlyTrend: monthlyTrend.map((m) => ({ month: m._id, amount: m.amount })),
    });
  } catch (err) { next(err); }
};

// POST /api/fees — admin adds fee record
const createFee = async (req, res, next) => {
  try {
    const { studentId, amount, month, status, dueDate, method, transactionId, remarks, paidDate } = req.body;
    if (!studentId || !amount || !month || !dueDate) {
      return sendError(res, 'studentId, amount, month, and dueDate are required.', 400);
    }
    const fee = await FeeRecord.create({ studentId, amount, month, status, dueDate, method, transactionId, remarks, paidDate });
    return sendSuccess(res, { fee }, 'Fee record created.', 201);
  } catch (err) { next(err); }
};

// PUT /api/fees/:id — admin updates (mark paid etc.)
const updateFee = async (req, res, next) => {
  try {
    const fee = await FeeRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fee) return sendError(res, 'Fee record not found.', 404);
    return sendSuccess(res, { fee }, 'Fee record updated.');
  } catch (err) { next(err); }
};

module.exports = { getMyFees, getAllFees, getFeeStats, createFee, updateFee };
