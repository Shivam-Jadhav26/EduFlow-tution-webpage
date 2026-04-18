const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    time: { type: String, required: true }, // e.g. "04:00 PM - 05:00 PM"
    subject: { type: String, required: true },
    teacher: { type: String, required: true },
    room: { type: String, default: '' },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TimetableEntry', timetableSchema);
