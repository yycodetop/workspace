const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  type: { 
    type: String, 
    enum: ['read', 'input', 'file'], 
    required: true 
  },
  isRequired: { type: Boolean, default: true },
  fileTypes: [String]
});

const fileSchema = new mongoose.Schema({
    name: String,
    url: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
});

const sopTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: String,
  category: { type: String, default: 'General' },
  
  // 🔥🔥 新增：SOP 标准文档 (支持多个)
  attachments: [fileSchema],

  steps: [stepSchema],
  defaultReviewerRoleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  version: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('SOPTemplate', sopTemplateSchema);