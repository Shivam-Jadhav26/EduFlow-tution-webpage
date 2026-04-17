const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // target configurations
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null },
    targetClass: { type: String, default: null },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['info', 'warning', 'test', 'fee', 'attendance', 'academic'],
      default: 'info',
    },
    status: {
      type: String,
      enum: ['draft', 'sent'],
      default: 'sent'
    },
    isRead: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
