const mongoose = require('mongoose');

const sourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String, // Cloudinary URL
    required: true
  },
  publicId: {
    type: String, // Cloudinary public_id (for cleanup)
    required: true
  },
  fileType: {
    type: String, // e.g., 'pdf', 'doc', 'ppt'
    required: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin ID
    required: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Source', sourceSchema);
