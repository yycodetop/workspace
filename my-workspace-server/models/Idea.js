const mongoose = require('mongoose');

// 定义评论结构
const CommentSchema = new mongoose.Schema({
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: String,
    authorAvatar: String, // 冗余存储头像，提升读取速度
    content: String,
    createdAt: { type: Date, default: Date.now }
});

const IdeaSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: '其他' }, 
    
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: String,
    isAnonymous: { type: Boolean, default: false }, 
    
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    
    reviewComment: String,
    reviewedBy: String,
    reviewedAt: Date,
    
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    // 🔥 新增：评论数组
    comments: [CommentSchema],
    
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Idea', IdeaSchema);