const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
    // === 基础元数据 ===
    title: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // 关联任务 (KPI 结算用)
    relatedTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },

    // === 状态机 ===
    status: { type: String, default: 'dev', enum: ['dev', 'review', 'revision', 'ready', 'published'] },
    version: { type: Number, default: 1.0 },

    // 🔥 新增：流转备注/研发说明 (方便后续同事查看)
    remark: { type: String, default: '' },

    // === 题目核心内容 ===
    content: {
        // V43+: 主要依赖 PDF，保留字段做兼容
        description: String,
        inputFormat: String,
        outputFormat: String,
        sampleInput: String,
        sampleOutput: String,
        difficulty: { type: String, default: '入门', enum: ['入门', '普及-', '普及/提高-', '普及+/提高', '提高+/省选-', '省选/NOI-'] },
        tags: [String]
    },

    // === 文件资源 ===
    resources: {
        problemPdf: { name: String, url: String }, // 题目文档
        standardCode: { name: String, url: String }, // 标程
        testData: { name: String, url: String },     // 数据包
        solutionDoc: { name: String, url: String }   // 题解(可选)
    },

    // === 验题反馈 ===
    audit: {
        passBlindTest: Boolean,
        timeCost: Number,
        dataQuality: String,
        comment: String,
        auditTime: Date
    },

    // === 历史记录 ===
    history: [{
        version: Number,
        action: String,
        operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Problem', ProblemSchema);