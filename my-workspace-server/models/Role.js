const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    name: { type: String, required: true }, // 角色名称，如 "财务专员"
    description: { type: String },          // 描述
    permissions: { type: Map, of: [String] }, // 权限矩阵，例如 { "tasks": ["create", "edit"] }
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Role', RoleSchema);