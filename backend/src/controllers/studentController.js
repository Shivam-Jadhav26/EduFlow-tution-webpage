const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/students — Admin: paginated list with filters
const getStudents = async (req, res, next) => {
  try {
    const { search, class: classFilter, batchId, status, page = 1, limit = 20 } = req.query;
    const query = { role: 'student' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (classFilter) query.class = classFilter;
    if (batchId) query.batch = batchId;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [students, total] = await Promise.all([
      User.find(query)
        .populate('batch', 'name class')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    return sendSuccess(res, {
      students,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/students/stats
const getStudentStats = async (req, res, next) => {
  try {
    const [active, inactive, pending, total] = await Promise.all([
      User.countDocuments({ role: 'student', status: 'active' }),
      User.countDocuments({ role: 'student', status: 'inactive' }),
      User.countDocuments({ role: 'student', status: 'pending' }),
      User.countDocuments({ role: 'student' }),
    ]);
    return sendSuccess(res, { total, active, inactive, pending });
  } catch (err) {
    next(err);
  }
};

// GET /api/students/:id
const getStudent = async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id).populate('batch', 'name class schedule');
    if (!student || student.role !== 'student') {
      return sendError(res, 'Student not found.', 404);
    }
    return sendSuccess(res, { student });
  } catch (err) {
    next(err);
  }
};

// POST /api/students — Admin creates student
const createStudent = async (req, res, next) => {
  try {
    const { name, email, password, class: studentClass, batch, phone, parentName, parentPhone, status } = req.body;
    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required.', 400);
    }
    const existing = await User.findOne({ email });
    if (existing) return sendError(res, 'Email already in use.', 409);

    const student = await User.create({
      name, email, passwordHash: password,
      role: 'student', class: studentClass, batch,
      phone, parentName, parentPhone, status: status || 'active',
    });
    return sendSuccess(res, { student: student.toPublic() }, 'Student created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

// PUT /api/students/:id
const updateStudent = async (req, res, next) => {
  try {
    const { name, email, class: studentClass, batch, phone, parentName, parentPhone, status, avatar } = req.body;
    const student = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, class: studentClass, batch, phone, parentName, parentPhone, status, avatar },
      { new: true, runValidators: true }
    ).populate('batch', 'name class');

    if (!student) return sendError(res, 'Student not found.', 404);
    return sendSuccess(res, { student }, 'Student updated successfully.');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/students/:id — soft delete (mark inactive)
const deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    );
    if (!student) return sendError(res, 'Student not found.', 404);
    return sendSuccess(res, null, 'Student deactivated successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getStudents, getStudentStats, getStudent, createStudent, updateStudent, deleteStudent };
