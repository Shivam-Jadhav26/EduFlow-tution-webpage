const Course = require('../models/Course');
const { sendSuccess, sendError } = require('../utils/response');

const getCourses = async (req, res, next) => {
  try {
    const { class: classFilter, search } = req.query;
    const query = { isActive: true };
    if (classFilter) query.class = classFilter;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const courses = await Course.find(query).sort({ class: 1 });
    return sendSuccess(res, { courses });
  } catch (err) { next(err); }
};

const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return sendError(res, 'Course not found.', 404);
    return sendSuccess(res, { course });
  } catch (err) { next(err); }
};

const createCourse = async (req, res, next) => {
  try {
    const { title, description, class: cls, subjects, thumbnail } = req.body;
    if (!title || !cls) return sendError(res, 'Title and class are required.', 400);
    const course = await Course.create({ title, description, class: cls, subjects, thumbnail });
    return sendSuccess(res, { course }, 'Course created.', 201);
  } catch (err) { next(err); }
};

const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return sendError(res, 'Course not found.', 404);
    return sendSuccess(res, { course }, 'Course updated.');
  } catch (err) { next(err); }
};

const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!course) return sendError(res, 'Course not found.', 404);
    return sendSuccess(res, null, 'Course archived.');
  } catch (err) { next(err); }
};

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse };
