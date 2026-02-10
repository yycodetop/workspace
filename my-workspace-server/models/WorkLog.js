const mongoose = require('mongoose');

const WorkLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  tags: [String],
  type: { type: String, default: 'manual' },
  dateStr: { type: String, index: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WorkLog', WorkLogSchema);