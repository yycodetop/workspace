const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' }, 
    isActive: { type: Boolean, default: false },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
    
    // 🔥 新增：技能树字段
    skills: [{
        name: { type: String, required: true }, // 技能名称
        category: { type: String, enum: ['hard', 'soft'], default: 'hard' }, // 类型：职业硬技能/服务软技能
        level: { type: Number, min: 0, max: 100, default: 10 }, // 熟练度 0-100
        isCore: { type: Boolean, default: false }, // 是否核心技能
        isLearning: { type: Boolean, default: false } // 是否正在学习
    }],

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);