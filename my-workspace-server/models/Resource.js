const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    title: { type: String, required: true }, // 网站名称
    url: { type: String, required: true },   // 跳转地址
    desc: String, // 推荐理由/作用
    
    // 🔥 新增：图标代码 (例如 "fa-solid fa-rocket")
    icon: { type: String, default: 'fa-solid fa-globe' },

    // 分享人信息
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerName: String,
    ownerAvatar: String,

    // 🔥 新增：热度统计
    clicks: { type: Number, default: 0 },
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', ResourceSchema);