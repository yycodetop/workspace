// my-workspace-server/models/IdeaCategory.js
const mongoose = require('mongoose');

const IdeaCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('IdeaCategory', IdeaCategorySchema);