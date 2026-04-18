const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    // 'all' = all students, 'class' = specific class, 'batch' = specific batch
    target: { type: String, enum: ['all', 'class', 'batch'], default: 'all' },
    targetClass: { type: String, default: null },
    targetBatch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null },
    type: {
      type: String,
      enum: ['Academic', 'Holiday', 'Update', 'Fee', 'Alert'],
      default: 'Academic',
    },
    status: { type: String, enum: ['draft', 'sent', 'scheduled'], default: 'draft' },
    scheduledAt: { type: Date, default: null },
    views: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
