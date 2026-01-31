const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    desc: String,
    
    // 👑 项目经理 (主负责人)
    ownerId: { type: String, required: true },
    ownerName: String,

    // 👥 项目成员 (多选)
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    start: Date,
    end: Date,
    
    status: { type: String, default: 'planning' },
    
    // 进度 (由后端聚合计算)
    progress: { type: Number, default: 0 },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);