const mongoose = require('mongoose');

// 权限结构： { "tasks": ["view", "create", "delete"], "admin": ["view"] }
const RoleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // 方案名称，如 "高级经理"
    description: String,
    
    // 核心：权限配置表
    // Key 是菜单ID (menuId)，Value 是允许的操作数组 (actions)
    permissions: { 
        type: Map, 
        of: [String], // 例如: ['view', 'create', 'edit', 'delete']
        default: {} 
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Role', RoleSchema);