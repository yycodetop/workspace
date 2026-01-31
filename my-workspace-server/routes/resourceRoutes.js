const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');

router.use(auth);

// 1. 获取资源列表 (支持模糊搜索)
router.get('/', async (req, res) => {
    try {
        const { q } = req.query; // 搜索关键词
        let query = {};

        if (q) {
            // 正则匹配：名称、描述、分享人
            const regex = new RegExp(q, 'i');
            query = {
                $or: [
                    { title: regex },
                    { desc: regex },
                    { ownerName: regex }
                ]
            };
        }

        // 按热度(点击量)降序排列，热度高的在前
        // 如果热度相同，则按创建时间倒序
        const list = await Resource.find(query).sort({ clicks: -1, createdAt: -1 });
        res.json(list);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. 分享新资源 (需 resources.create 权限)
router.post('/', async (req, res) => {
    try {
        // 权限检查：是否有“分享资源”权限 (默认开启，但可以在后台关闭)
        // 注意：如果你还没更新 admin-system.js，req.hasPerm 可能暂不可用，这里做个防御
        if (req.hasPerm && !req.hasPerm('resources', 'create')) {
            return res.status(403).json({ message: '无权分享资源' });
        }

        const { title, url, desc, icon } = req.body;
        
        // URL 自动补全 http
        let finalUrl = url;
        if (url && !url.startsWith('http')) finalUrl = 'https://' + url;

        const newRes = new Resource({
            title, 
            url: finalUrl, 
            desc,
            icon: icon || 'fa-solid fa-globe', // 默认图标
            ownerId: req.user.id,
            ownerName: req.user.name,
            ownerAvatar: req.user.avatar
        });
        
        await newRes.save();
        res.status(201).json(newRes);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// 3. 修改资源
router.put('/:id', async (req, res) => {
    try {
        const item = await Resource.findById(req.params.id);
        if (!item) return res.status(404).json({ message: '资源不存在' });

        // 权限检查：自己 或者 拥有管理权(resources.manage)
        const isOwner = item.ownerId.toString() === req.user.id;
        const canManage = req.hasPerm && req.hasPerm('resources', 'manage');

        if (!isOwner && !canManage && req.user.username !== 'admin') {
            return res.status(403).json({ message: '只能修改自己的分享' });
        }

        const updated = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 4. 删除资源
router.delete('/:id', async (req, res) => {
    try {
        const item = await Resource.findById(req.params.id);
        if (!item) return res.status(404).json({ message: '资源不存在' });

        // 权限检查：同上
        const isOwner = item.ownerId.toString() === req.user.id;
        const canManage = req.hasPerm && req.hasPerm('resources', 'manage');

        if (!isOwner && !canManage && req.user.username !== 'admin') {
            return res.status(403).json({ message: '无权删除该资源' });
        }

        await Resource.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 5. 增加热度 (点击统计)
router.post('/:id/click', async (req, res) => {
    try {
        // 使用 $inc 原子操作增加点击数
        await Resource.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
        res.json({ success: true });
    } catch (e) { res.status(500).send(); }
});

module.exports = router;