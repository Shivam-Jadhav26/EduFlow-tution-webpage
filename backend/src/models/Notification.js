const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // null means broadcast to all
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['info', 'warning', 'test', 'fee', 'attendance'],
      default: 'info',
    },
    isRead: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
