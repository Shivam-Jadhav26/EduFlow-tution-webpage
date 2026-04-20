const User = require('../models/User');
const Batch = require('../models/Batch');
const xlsx = require('xlsx');
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
    const { name, email, password, gender, class: studentClass, batch, phone, parentName, parentPhone, status, fees } = req.body;
    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required.', 400);
    }
    const existing = await User.findOne({ email });
    if (existing) return sendError(res, 'Email already in use.', 409);

    const student = await User.create({
      name, email, passwordHash: password,
      gender, role: 'student', class: studentClass, batch,
      phone, parentName, parentPhone, status: status || 'active',
      fees: fees !== undefined ? Number(fees) : null,
    });
    return sendSuccess(res, { student: student.toPublic() }, 'Student created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

// PUT /api/students/:id
const updateStudent = async (req, res, next) => {
  try {
    const { name, email, gender, class: studentClass, batch, phone, parentName, parentPhone, status, avatar, fees } = req.body;
    const student = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, gender, class: studentClass, batch, phone, parentName, parentPhone, status, avatar, fees: fees !== undefined ? Number(fees) : null },
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

// POST /api/students/import — Admin imports students via Excel/CSV
const importStudents = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 'No file uploaded.', 400);

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) return sendError(res, 'The uploaded file is empty.', 400);

    // Prepare batches for lookup
    const allBatches = await Batch.find({ isActive: true });
    const batchLookup = {};
    allBatches.forEach(b => {
      batchLookup[b.name.toLowerCase().trim()] = b._id;
    });

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    const studentPromises = data.map(async (row, index) => {
      try {
        const name = row.Name || row.name || row['Full Name'];
        const email = row.Email || row.email;
        const password = row.Password || row.password || 'EduFlow@123';
        const gender = (row.Gender || row.gender || 'other').toLowerCase();
        const studentClass = row.Class || row.class || row.Grade || row.grade;
        const batchName = row.Batch || row.batch;
        const phone = row.Phone || row.phone;
        const parentName = row.ParentName || row.parentName || row['Parent Name'];
        const parentPhone = row.ParentPhone || row.parentPhone || row['Parent Phone'];

        if (!name || !email) {
          results.failed++;
          results.errors.push(`Row ${index + 2}: Name and Email are required.`);
          return;
        }

        const existing = await User.findOne({ email });
        if (existing) {
          results.skipped++;
          return;
        }

        let batchId = null;
        if (batchName) {
          batchId = batchLookup[batchName.toLowerCase().trim()] || null;
        }

        await User.create({
          name,
          email,
          passwordHash: password, // Pre-save hook will hash this
          gender: ['male', 'female', 'other'].includes(gender) ? gender : 'other',
          role: 'student',
          class: studentClass || null,
          batch: batchId,
          phone: phone || null,
          parentName: parentName || null,
          parentPhone: parentPhone || null,
          status: 'active'
        });

        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Row ${index + 2}: ${err.message}`);
      }
    });

    await Promise.all(studentPromises);

    return sendSuccess(res, results, `Import complete: ${results.success} added, ${results.skipped} skipped, ${results.failed} failed.`);
  } catch (err) {
    next(err);
  }
};

module.exports = { getStudents, getStudentStats, getStudent, createStudent, updateStudent, deleteStudent, importStudents };
