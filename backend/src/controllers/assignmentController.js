const Assignment = require('../models/Assignment');
const { sendSuccess, sendError } = require('../utils/response');
const { cloudinary } = require('../config/cloudinary');

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'eduflow/assignments', resource_type: 'raw', format: 'pdf' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// POST /api/assignments — Admin creates an assignment
const createAssignment = async (req, res, next) => {
  try {
    const { title, subject, dueDate, assignedTo, batchId } = req.body;

    if (!req.file) {
      return sendError(res, 'PDF file is required.', 400);
    }

    if (!title || !subject || !dueDate) {
      return sendError(res, 'Title, subject, and due date are required.', 400);
    }

    // Upload PDF to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer);

    // Safe parse of assignedTo array if passed as mixed format
    let assignedToArray = [];
    if (assignedTo) {
      try {
        assignedToArray = JSON.parse(assignedTo);
      } catch (e) {
        assignedToArray = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
      }
    }

    const assignment = await Assignment.create({
      title,
      subject,
      dueDate: new Date(dueDate),
      pdfUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      assignedTo: assignedToArray,
      batchId: batchId || null,
      createdBy: req.user._id
    });

    return sendSuccess(res, { assignment }, 'Assignment created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/assignments — Admin views all assignments
const getAdminAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find()
      .populate('createdBy', 'name')
      .populate('batchId', 'name') // Field is now in schema
      .sort({ createdAt: -1 });

    return sendSuccess(res, { assignments });
  } catch (err) {
    next(err);
  }
};

// GET /api/assignments/my — Student views their own assignments
const getMyAssignments = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const studentBatch = req.user.batch; // Reference from User model

    const query = {};
    if (studentBatch) {
      query.$or = [
        { assignedTo: studentId },
        { batchId: studentBatch },
        { batchId: null } // Assignments with no specific batch selected go to everyone
      ];
    } else {
      query.$or = [
        { assignedTo: studentId },
        { batchId: null } // Students without a batch only see global assignments and personal ones
      ];
    }

    const assignments = await Assignment.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { assignments });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAssignment,
  getAdminAssignments,
  getMyAssignments
};
