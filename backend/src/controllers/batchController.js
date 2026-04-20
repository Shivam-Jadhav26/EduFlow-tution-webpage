const Batch = require('../models/Batch');
const { sendSuccess, sendError } = require('../utils/response');

const getBatches = async (req, res, next) => {
  try {
    const { class: classFilter, search } = req.query;
    const query = { isActive: true };
    if (classFilter) query.class = classFilter;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    const batches = await Batch.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          let: { batchId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$batch', '$$batchId'] } } },
            { $project: { _id: 1, name: 1 } }
          ],
          as: 'students'
        }
      },
      { $sort: { name: 1 } }
    ]);
    return sendSuccess(res, { batches });
  } catch (err) { next(err); }
};

const getBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id).lean();
    if (!batch) return sendError(res, 'Batch not found.', 404);
    
    // Also fetch students for this batch to ensure consistency
    const mongoose = require('mongoose');
    const students = await mongoose.model('User').find({ batch: batch._id, role: 'student' }).select('_id name');
    batch.students = students;

    return sendSuccess(res, { batch });
  } catch (err) { next(err); }
};

const createBatch = async (req, res, next) => {
  try {
    const { name, description, class: cls, schedule, teacher, defaultFees } = req.body;
    if (!name || !cls) return sendError(res, 'Name and class are required.', 400);
    const batch = await Batch.create({ name, description, class: cls, schedule, teacher, defaultFees: Number(defaultFees) || 0 });
    return sendSuccess(res, { batch }, 'Batch created.', 201);
  } catch (err) { next(err); }
};

const updateBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!batch) return sendError(res, 'Batch not found.', 404);
    return sendSuccess(res, { batch }, 'Batch updated.');
  } catch (err) { next(err); }
};

const deleteBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!batch) return sendError(res, 'Batch not found.', 404);
    return sendSuccess(res, null, 'Batch archived.');
  } catch (err) { next(err); }
};

module.exports = { getBatches, getBatch, createBatch, updateBatch, deleteBatch };
