const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    // 👤 操作人 (Who)
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorName: String,
    actorAvatar: String,

    // 🎯 操作对象 (Target)
    targetType: { type: String, enum: ['project', 'task'] }, // 是改了项目还是任务
    targetId: { type: mongoose.Schema.Types.ObjectId },      // 项目或任务的 ID
    targetName: String,                                      // 项目或任务的标题 (快照)
    projectId: { type: mongoose.Schema.Types.ObjectId },     // 归属项目ID (方便筛选)

    // 📝 操作内容 (What)
    action: { type: String }, // 简述: "创建任务", "更新进度", "变更指派"
    details: { type: String }, // 详述: "从 50% -> 80%" 或 "状态: 待办 -> 完成"
    
    // 🕒 时间 (When)
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema);