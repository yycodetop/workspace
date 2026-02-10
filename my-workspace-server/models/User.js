const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' }, 
    
    // 🔥 1. 确保 isActive 默认为 true，方便新用户登录
    isActive: { type: Boolean, default: true },

    // 🔥 2. 补全缺失的权限字段 (适配 admin.js 的判断逻辑)
    isAdmin: { type: Boolean, default: false }, // 超级管理员标志
    role: { type: String, default: 'user' },    // 兼容旧逻辑的字符串角色
    
    // 关联的角色表
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
    
    skills: [{
        name: { type: String, required: true },
        category: { type: String, enum: ['hard', 'soft'], default: 'hard' },
        level: { type: Number, min: 0, max: 100, default: 10 },
        isCore: { type: Boolean, default: false },
        isLearning: { type: Boolean, default: false }
    }],

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);