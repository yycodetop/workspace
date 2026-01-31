const mongoose = require('mongoose');

const CheckInTypeSchema = new mongoose.Schema({
    label: { type: String, required: true }, // 显示名称，如 "Coding"
    icon: { type: String, required: true },  // FontAwesome 图标类名
    styleClass: { type: String, default: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' }, // Tailwind 样式
    order: { type: Number, default: 0 } // 排序
});

module.exports = mongoose.model('CheckInType', CheckInTypeSchema);