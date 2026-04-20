const Source = require('../models/Source');
const { sendSuccess, sendError } = require('../utils/response');
const { cloudinary } = require('../config/cloudinary');

// Helper function to upload buffer to Cloudinary (already added logic in cloudinary config, but here we can define specific raw stream)
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    // We treat everything as raw to support multi-format
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'eduflow/sources', resource_type: 'raw' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// POST /api/sources — Admin uploads a study material
const createSource = async (req, res, next) => {
  try {
    const { title, subject, description, batch } = req.body;

    if (!req.file) {
      return sendError(res, 'File (PDF/PPT/DOC) is required.', 400);
    }

    if (!title || !subject) {
      return sendError(res, 'Title and subject are required.', 400);
    }

    // Determine fileType
    let fileType = 'pdf';
    if (req.file.mimetype.includes('msword') || req.file.mimetype.includes('wordprocessingml')) {
      fileType = 'doc';
    } else if (req.file.mimetype.includes('ms-powerpoint') || req.file.mimetype.includes('presentationml')) {
      fileType = 'ppt';
    }

    // Upload Document to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

    const source = await Source.create({
      title,
      subject,
      description: description || '',
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileType,
      batch: batch || null,
      uploadedBy: req.user._id
    });

    return sendSuccess(res, { source }, 'Source uploaded successfully.', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/sources — Admin views all sources or filtered by batch (also used by students with batch mapping)
const getSources = async (req, res, next) => {
  try {
    const query = {};
    
    // If student, force filter by their batch and null (global)
    if (req.user.role === 'student') {
      const studentBatch = req.user.batch;
      if (studentBatch) {
        query.$or = [{ batch: studentBatch }, { batch: null }];
      } else {
        query.batch = null;
      }
    } else {
      // If admin and they provided a batchId filter
      if (req.query.batchId) {
        query.batch = req.query.batchId;
      }
    }

    const sources = await Source.find(query)
      .populate('uploadedBy', 'name')
      .populate('batch', 'name')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { sources });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/sources/:id — Admin deletes a source
const deleteSource = async (req, res, next) => {
  try {
    const source = await Source.findById(req.params.id);
    if (!source) return sendError(res, 'Source not found.', 404);

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(source.publicId, { resource_type: 'raw' });
    
    // Delete from DB
    await Source.findByIdAndDelete(req.params.id);

    return sendSuccess(res, null, 'Source deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createSource,
  getSources,
  deleteSource
};
