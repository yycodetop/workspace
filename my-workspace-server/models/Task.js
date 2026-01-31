const mongoose = require('mongoose');

// 定义单条日志的结构
const LogSchema = new mongoose.Schema({
    progress: Number,      // 当时进度
    note: String,          // 备注内容
    operator: String,      // 操作人姓名
    timestamp: { type: Date, default: Date.now }
});

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    start: Date,
    end: Date,
    status: { type: String, default: 'todo' }, 
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    ownerId: { type: String, required: true },
    ownerName: String,
    
    desc: String,
    progress: { type: Number, default: 0 },
    
    // 🔥 新增：进度日志数组
    progressLogs: [LogSchema], 

    isBacklog: { type: Boolean, default: false },
    kpiValue: { type: Number, default: 0 },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);