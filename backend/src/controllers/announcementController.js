const Announcement = require('../models/Announcement');
const { sendSuccess, sendError } = require('../utils/response');

const getAnnouncements = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'student') {
      query.status = 'sent';
    }
    if (req.query.status) query.status = req.query.status;

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { announcements });
  } catch (err) { next(err); }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, target, targetClass, targetBatch, type, status, scheduledAt } = req.body;
    if (!title || !content) return sendError(res, 'Title and content are required.', 400);

    const ann = await Announcement.create({
      title, content, target: target || 'all',
      targetClass, targetBatch, type: type || 'Academic',
      status: status || 'draft', scheduledAt,
      createdBy: req.user._id,
    });
    return sendSuccess(res, { announcement: ann }, 'Announcement created.', 201);
  } catch (err) { next(err); }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const ann = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ann) return sendError(res, 'Announcement not found.', 404);
    return sendSuccess(res, { announcement: ann }, 'Updated.');
  } catch (err) { next(err); }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, 'Announcement deleted.');
  } catch (err) { next(err); }
};

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
