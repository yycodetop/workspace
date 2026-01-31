const mongoose = require('mongoose');

const ScriptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: [String], default: [] },
    notes: { type: Map, of: new mongoose.Schema({
        text: String,
        duration: Number,
        img: String
    }, { _id: false }) },
    overrides: { type: Map, of: String },
    lineOrder: { type: [String], default: [] },
    
    // 🔥 新增字段
    isShared: { type: Boolean, default: false }, // 是否共享给团队
    scrollSpeed: { type: Number, default: 3.5 }, // 语速
    fontSize: { type: Number, default: 46 },     // 字号
    contentWidth: { type: Number, default: 85 }, // 内容宽度百分比
    
    lastModified: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Script || mongoose.model('Script', ScriptSchema);