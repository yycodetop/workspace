// models/Tuition.js
const mongoose = require('mongoose');

// 1. 配置模型 (用于存储校区和课程选项)
const TuitionConfigSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['campus', 'course'] }, 
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// 2. 交易记录模型 (收费和退费)
const TuitionRecordSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['income', 'refund'] }, 
    studentName: { type: String, required: true },
    grade: { type: String }, 
    campus: { type: String, required: true }, 
    course: { type: String, required: true }, 
    
    // 🔥 新增字段: 报名类型 (新报/续报)，仅收费有效
    enrollmentType: { type: String, enum: ['new', 'renewal'], default: 'renewal' },

    teacher: { type: String, required: true }, 
    amount: { type: Number, required: true }, 
    transactionDate: { type: Date, required: true }, 
    reason: { type: String }, 
    
    referral: { type: String, default: '' }, 
    remarks: { type: String, default: '' },  

    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    operatorName: { type: String }, 

    createdAt: { type: Date, default: Date.now } 
});

const TuitionConfig = mongoose.model('TuitionConfig', TuitionConfigSchema);
const TuitionRecord = mongoose.model('TuitionRecord', TuitionRecordSchema);

module.exports = { TuitionConfig, TuitionRecord };