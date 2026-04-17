const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true }, // index of correct option
});

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true },
    date: { type: Date, required: true },
    duration: { type: Number, required: true }, // minutes
    totalMarks: { type: Number, required: true },
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'ongoing', 'completed'],
      default: 'draft',
    },
    class: { type: String, default: '' },
    targetBatches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
    questions: [questionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Test', testSchema);
