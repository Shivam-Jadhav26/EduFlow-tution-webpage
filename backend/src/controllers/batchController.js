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
    const rawBatches = await Batch.find(query).sort({ name: 1 });

    const totalActive = rawBatches.length;

    const scheduleCounts = {};
    let peakSlot = 'N/A';
    let maxCount = 0;
    rawBatches.forEach(b => {
      if (b.schedule) {
        scheduleCounts[b.schedule] = (scheduleCounts[b.schedule] || 0) + 1;
        if (scheduleCounts[b.schedule] > maxCount) {
          maxCount = scheduleCounts[b.schedule];
          peakSlot = b.schedule;
        }
      }
    });

    const classes = rawBatches.map(b => b.class).filter(Boolean);
    const numericClasses = [...new Set(classes.map(c => parseInt(c.replace(/\D/g, ''))).filter(n => !isNaN(n)))].sort((a, b) => a - b);
    let classesCovered = 'N/A';
    if (numericClasses.length > 0) {
      let isContinuous = true;
      for (let i = 1; i < numericClasses.length; i++) {
        if (numericClasses[i] !== numericClasses[i - 1] + 1) {
          isContinuous = false;
          break;
        }
      }
      if (isContinuous && numericClasses.length > 1) {
        classesCovered = `${numericClasses[0]}-${numericClasses[numericClasses.length - 1]}th`;
      } else {
        classesCovered = numericClasses.map(n => `${n}th`).join(', ');
      }
    }

    const mappedBatches = rawBatches.map(b => ({
      _id: b._id.toString(),
      id: b._id.toString(),
      name: b.name,
      class: b.class,
      teacher: b.teacher || '',
      timing: b.schedule || '',
      maxStudents: b.maxStudents || 60,
      enrolled: 0,
      status: b.isActive ? 'ACTIVE' : 'INACTIVE'
    }));

    const responseData = {
      stats: {
        totalActive,
        classesCovered,
        avgStrength: 0,
        peakSlot
      },
      batches: mappedBatches
    };

    return sendSuccess(res, responseData);
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
