const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    month: { type: String, required: true }, // e.g. "May 2024"
    status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date, default: null },
    method: { type: String, default: '' }, // UPI, Cash, Bank Transfer
    transactionId: { type: String, default: '' },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FeeRecord', feeSchema);
