const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    name: String, url: String, size: Number, uploadedAt: { type: Date, default: Date.now }
});

const stepDataSchema = new mongoose.Schema({
  stepIndex: { type: Number, required: true },
  content: String, 
  attachments: [fileSchema], 
  submittedAt: Date,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectReason: String
});

const stepSnapshotSchema = new mongoose.Schema({
    title: String, desc: String, type: String, isRequired: Boolean
});

const sopTaskSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'SOPTemplate' }, 
  templateVersion: Number,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // 🔥🔥 新增：关联原本的任务系统 (Task Command Center)
  relatedTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },

  snapshot: {
      title: String, desc: String, category: String,
      steps: [stepSnapshotSchema],
      attachments: [fileSchema]
  },

  currentStepIndex: { type: Number, default: 0 },
  stepData: [stepDataSchema],
  
  status: { 
    type: String, 
    enum: ['in_progress', 'submitted', 'reviewing', 'rejected', 'completed'], 
    default: 'in_progress' 
  },
  rating: { type: Number, min: 1, max: 5 },
  auditLogs: [{
    action: String, comment: String, operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('SOPTask', sopTaskSchema);