const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const auth = require('../middleware/auth');
const getUid = (req) => req.user?.id || req.userId;

router.use(auth);

// 1. 获取列表
router.get('/', async (req, res) => {
    try {
        const { type } = req.query;
        const uid = getUid(req);
        let query = {};

        if (type === 'my') query = { authorId: uid };
        else if (type === 'todo') query = { testerId: uid, status: 'review' };

        const list = await Problem.find(query)
            .populate('authorId', 'name avatar')
            .populate('testerId', 'name avatar')
            .populate('relatedTaskId', 'title status progress')
            .sort({ updatedAt: -1 });
        res.json(list);
    } catch (e) { res.status(500).json({ message: "列表获取失败" }); }
});

// 2. 获取详情
router.get('/:id', async (req, res) => {
    try {
        const p = await Problem.findById(req.params.id)
            .populate('authorId', 'name')
            .populate('testerId', 'name')
            .populate('relatedTaskId', 'title progress')
            .populate('history.operatorId', 'name');
        if (!p) return res.status(404).json({ message: '题目不存在' });
        res.json(p);
    } catch (e) { res.status(500).json({ message: "详情获取失败" }); }
});

// 3. 创建题目
router.post('/', async (req, res) => {
    try {
        const { title, relatedTaskId } = req.body;
        if (!title) return res.status(400).json({ message: '标题必填' });

        const newProblem = new Problem({
            title,
            authorId: getUid(req),
            relatedTaskId: relatedTaskId || null,
            version: 1.0,
            status: 'dev'
        });
        await newProblem.save();
        
        const populated = await Problem.findById(newProblem._id).populate('authorId', 'name');
        res.json(populated);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 4. 更新题目 (支持 remark)
router.put('/:id', async (req, res) => {
    try {
        // 🔥 加入 remark
        const { title, content, resources, testerId, relatedTaskId, remark } = req.body;
        
        const updateData = {
            title,
            content,
            resources,
            remark, // 保存备注
            testerId: testerId || null,
            relatedTaskId: relatedTaskId || null,
            updatedAt: new Date()
        };

        const p = await Problem.findByIdAndUpdate(
            req.params.id, 
            { $set: updateData }, 
            { new: true, runValidators: true }
        )
        .populate('authorId', 'name')
        .populate('testerId', 'name')
        .populate('relatedTaskId', 'title progress');

        if (!p) return res.status(404).json({ message: '题目不存在' });
        res.json(p);
    } catch (e) { 
        if (e.name === 'CastError') return res.status(400).json({ message: 'ID 格式错误' });
        res.status(500).json({ message: "保存失败: " + e.message }); 
    }
});

// 5. 状态流转
router.post('/:id/transition', async (req, res) => {
    try {
        const { action, comment, auditData } = req.body;
        const p = await Problem.findById(req.params.id);
        const uid = getUid(req);

        if (!p) return res.status(404).json({ message: '题目不存在' });

        const historyItem = {
            version: p.version,
            action: action,
            operatorId: uid,
            comment: comment || (auditData ? '验收通过' : action),
            timestamp: new Date()
        };

        if (action === 'submit') {
            p.version = parseFloat((p.version + 0.1).toFixed(1));
            p.status = 'review';
        } 
        else if (action === 'reject') {
            p.status = 'revision';
            p.audit = { ...p.audit, comment };
        }
        else if (action === 'approve') {
            p.status = 'ready';
            if(auditData) p.audit = { ...p.audit, ...auditData, auditTime: new Date() };
        }
        else if (action === 'publish') {
            p.status = 'published';
        }

        p.history.push(historyItem);
        await p.save();
        
        // 返回最新完整数据，供前端刷新视图
        const updated = await Problem.findById(p._id)
            .populate('authorId', 'name')
            .populate('testerId', 'name')
            .populate('relatedTaskId', 'title progress');
            
        res.json(updated);
    } catch (e) { res.status(500).json({ message: "流转失败: " + e.message }); }
});

// 6. 删除题目
router.delete('/:id', async (req, res) => {
    try {
        const p = await Problem.findById(req.params.id);
        if (!p) return res.status(404).json({ message: '题目不存在' });
        
        const uid = getUid(req);
        if (String(p.authorId) !== String(uid)) return res.status(403).json({ message: '无权删除' });
        if (p.status === 'published') return res.status(400).json({ message: '已发布题目不可删除' });

        await Problem.findByIdAndDelete(req.params.id);
        res.json({ message: '删除成功', id: req.params.id });
    } catch (e) { res.status(500).json({ message: "删除失败" }); }
});

module.exports = router;