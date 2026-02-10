// models/Tuition.js
const mongoose = require('mongoose');

// 1. 配置模型 (用于存储校区和课程选项)
const TuitionConfigSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['campus', 'course'] }, // 类型：校区或课程
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// 2. 交易记录模型 (收费和退费)
const TuitionRecordSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['income', 'refund'] }, // 类型：收费(income) 或 退费(refund)
    studentName: { type: String, required: true },
    grade: { type: String }, // 年级 (收费时填)
    campus: { type: String, required: true }, // 存名称快照
    course: { type: String, required: true }, // 存名称快照
    teacher: { type: String, required: true }, // 教师姓名
    amount: { type: Number, required: true }, // 金额
    transactionDate: { type: Date, required: true }, // 收费/退费发生的实际时间
    reason: { type: String }, // 退费原因
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 操作员
    createdAt: { type: Date, default: Date.now } // 实际记录入系统的时间
});

const TuitionConfig = mongoose.model('TuitionConfig', TuitionConfigSchema);
const TuitionRecord = mongoose.model('TuitionRecord', TuitionRecordSchema);

module.exports = { TuitionConfig, TuitionRecord };