const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    class: { type: String, required: true }, // e.g. "10th"
    schedule: { type: String, default: '' }, // e.g. "Mon, Wed, Fri 4-5 PM"
    teacher: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Batch', batchSchema);
