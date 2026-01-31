const mongoose = require('mongoose');

const IdeaCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // 分类名称
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IdeaCategory', IdeaCategorySchema);