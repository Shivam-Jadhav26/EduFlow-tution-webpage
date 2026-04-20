const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
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
  dueDate: {
    type: Date,
    required: true
  },
  pdfUrl: {
    type: String, // Cloudinary URL
    required: true
  },
  publicId: {
    type: String, // Cloudinary public_id (for cleanup)
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Specific students
  }],
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch' // Targeted batch
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin ID
    required: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Assignment', assignmentSchema);
