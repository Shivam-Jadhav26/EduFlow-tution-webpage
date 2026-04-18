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
    const { status, month, search, startDate, endDate } = req.query;
    const query = {};

    if (status) query.status = status;
    if (month) query.month = { $regex: month, $options: 'i' };

    // Date range filter (on createdAt or dueDate? User said "Date Range")
    // Let's use dueDate for the filter as it's more relevant for fees
    if (startDate || endDate) {
      query.dueDate = {};
      if (startDate) query.dueDate.$gte = new Date(startDate);
      if (endDate) query.dueDate.$lte = new Date(endDate);
    }

    // Search filter (Transaction ID)
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { month: { $regex: search, $options: 'i' } }
      ];
    }

    const fees = await FeeRecord.find(query)
      .populate('studentId', 'name email class')
      .sort({ createdAt: -1 });

    // If there's a search term and we want to search student names too, 
    // we filter after population if the dataset is small, or use aggregate for large datasets.
    // For now, let's keep it simple: if search exists, it filters what it can.
    let filteredFees = fees;
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredFees = fees.filter(f => 
        f.transactionId?.toLowerCase().includes(lowerSearch) ||
        f.month?.toLowerCase().includes(lowerSearch) ||
        f.studentId?.name?.toLowerCase().includes(lowerSearch) ||
        f.studentId?.email?.toLowerCase().includes(lowerSearch)
      );
    }

    return sendSuccess(res, { fees: filteredFees });
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

// DELETE /api/fees/:id — admin deletes fee record
const deleteFee = async (req, res, next) => {
  try {
    const fee = await FeeRecord.findByIdAndDelete(req.params.id);
    if (!fee) return sendError(res, 'Fee record not found.', 404);
    return sendSuccess(res, null, 'Fee record deleted.');
  } catch (err) { next(err); }
};

module.exports = { getMyFees, getAllFees, getFeeStats, createFee, updateFee, deleteFee };
