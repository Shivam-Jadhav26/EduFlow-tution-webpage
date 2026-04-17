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
    const batches = await Batch.find(query).sort({ name: 1 });
    return sendSuccess(res, { batches });
  } catch (err) { next(err); }
};

const getBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return sendError(res, 'Batch not found.', 404);
    return sendSuccess(res, { batch });
  } catch (err) { next(err); }
};

const createBatch = async (req, res, next) => {
  try {
    const { name, description, class: cls, schedule, teacher } = req.body;
    if (!name || !cls) return sendError(res, 'Name and class are required.', 400);
    const batch = await Batch.create({ name, description, class: cls, schedule, teacher });
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
