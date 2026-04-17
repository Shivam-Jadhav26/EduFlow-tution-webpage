const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
  {
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Map question index -> selected option index
    answers: [
      {
        questionIndex: { type: Number, required: true },
        selectedOption: { type: Number, required: true },
      },
    ],
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, required: true },
    submittedAt: { type: Date, default: null },
    status: { type: String, enum: ['in-progress', 'submitted'], default: 'in-progress' },
  },
  { timestamps: true }
);

// One attempt per student per test
attemptSchema.index({ testId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('TestAttempt', attemptSchema);
