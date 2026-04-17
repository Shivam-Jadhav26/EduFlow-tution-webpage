const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  authorRole: { type: String, enum: ['student', 'admin'], default: 'admin' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const doubtSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    question: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
    replies: [replySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doubt', doubtSchema);
