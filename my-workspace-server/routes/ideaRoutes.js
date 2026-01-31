const express = require('express');
const router = express.Router();
const Idea = require('../models/Idea');
const IdeaCategory = require('../models/IdeaCategory'); // 引入分类
const Task = require('../models/Task');
const auth = require('../middleware/auth');

router.use(auth);

// 0. 获取分类列表 (供前端下拉框使用)
router.get('/categories', async (req, res) => {
    try {
        const cats = await IdeaCategory.find({}).sort({ createdAt: 1 });
        res.json(cats);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 1. 获取创意列表
router.get('/', async (req, res) => {
    try {
        if (!req.hasPerm('ideas', 'view')) return res.status(403).json({ message: '无权访问' });
        
        const filter = {};
        if (req.query.status && req.query.status !== 'all') {
            filter.status = req.query.status;
        }
        
        const ideas = await Idea.find(filter).sort({ createdAt: -1 });
        res.json(ideas);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. 提交新创意
router.post('/', async (req, res) => {
    try {
        if (!req.hasPerm('ideas', 'create')) return res.status(403).json({ message: '无权提交' });
        
        const { title, content, category, isAnonymous } = req.body;
        const newIdea = new Idea({
            title, content, category, isAnonymous,
            authorId: req.userId,
            authorName: isAnonymous ? '神秘同事' : req.user.name
        });
        
        await newIdea.save();
        res.status(201).json(newIdea);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// 3. 点赞
router.put('/:id/like', async (req, res) => {
    try {
        const idea = await Idea.findById(req.params.id);
        if (!idea) return res.status(404).json({ message: '创意不存在' });
        const uid = req.userId;
        const index = idea.likes.indexOf(uid);
        if (index === -1) idea.likes.push(uid); else idea.likes.splice(index, 1);
        await idea.save();
        res.json(idea.likes);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 🔥 4. 发表评论 (新增)
router.post('/:id/comments', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: '内容不能为空' });

        const idea = await Idea.findById(req.params.id);
        if (!idea) return res.status(404).json({ message: '创意不存在' });

        // 追加评论
        idea.comments.push({
            authorId: req.userId,
            authorName: req.user.name,
            authorAvatar: req.user.avatar || '', // 记录头像
            content: content
        });

        await idea.save();
        res.json(idea.comments); // 返回最新评论列表
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 🔥 5. 删除评论 (新增，仅管理员或本人)
router.delete('/:id/comments/:commentId', async (req, res) => {
    try {
        const idea = await Idea.findById(req.params.id);
        if (!idea) return res.status(404).json({ message: '创意不存在' });

        // 找到评论
        const comment = idea.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: '评论不存在' });

        // 权限检查：或者是管理员，或者是评论作者本人
        const isManager = req.hasPerm('ideas', 'review');
        const isAuthor = comment.authorId.toString() === req.userId;

        if (!isManager && !isAuthor) return res.status(403).json({ message: '无权删除' });

        idea.comments.pull(req.params.commentId);
        await idea.save();
        res.json(idea.comments);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 6. 评审 (通过/驳回)
router.put('/:id/review', async (req, res) => {
    try {
        if (!req.hasPerm('ideas', 'review')) return res.status(403).json({ message: '无评审权限' });
        const { status, comment } = req.body;
        const idea = await Idea.findByIdAndUpdate(req.params.id, {
            status, reviewComment: comment, reviewedBy: req.user.name, reviewedAt: new Date()
        }, { new: true });
        res.json(idea);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 7. 转任务
router.post('/:id/convert', async (req, res) => {
    try {
        if (!req.hasPerm('ideas', 'review')) return res.status(403).json({ message: '无权操作' });
        const idea = await Idea.findById(req.params.id);
        if (!idea) return res.status(404).json({ message: '创意不存在' });

        const newTask = new Task({
            title: `[创意落地] ${idea.title}`,
            desc: `源自创意树洞。\n提交人：${idea.authorName}\n\n创意详情：\n${idea.content}`,
            ownerId: req.userId, ownerName: req.user.name, status: 'todo', isBacklog: true
        });
        await newTask.save();

        idea.status = 'approved'; idea.reviewComment = '已转化为执行任务'; idea.reviewedBy = req.user.name; idea.reviewedAt = new Date();
        await idea.save();
        res.json({ message: '转化成功', task: newTask });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 8. 删除创意
router.delete('/:id', async (req, res) => {
    if (!req.hasPerm('ideas', 'review')) return res.status(403).json({ message: '无权删除' });
    await Idea.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});

module.exports = router;