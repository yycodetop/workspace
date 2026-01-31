const express = require('express');
const router = express.Router();
const CheckIn = require('../models/CheckIn');
const CheckInType = require('../models/CheckInType');
const auth = require('../middleware/auth');
const User = require('../models/User');

// --- 辅助：检查是否为管理员 ---
const isAdmin = async (userId) => {
    const user = await User.findById(userId);
    return user && user.username === 'admin';
};

// ========================
// 1. 打卡记录管理 (Logs)
// ========================

// 获取列表
router.get('/', async (req, res) => {
    try {
        const logs = await CheckIn.find()
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(logs);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 发布
router.post('/', auth, async (req, res) => {
    try {
        const newLog = new CheckIn({ userId: req.user.id, ...req.body });
        await newLog.save();
        await newLog.populate('userId', 'name avatar');
        res.json(newLog);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// 修改 (仅作者或管理员)
router.put('/:id', auth, async (req, res) => {
    try {
        const log = await CheckIn.findById(req.params.id);
        if (!log) return res.status(404).json({ message: 'Not found' });

        const admin = await isAdmin(req.user.id);
        if (log.userId.toString() !== req.user.id && !admin) {
            return res.status(403).json({ message: '无权修改他人记录' });
        }

        log.content = req.body.content || log.content;
        log.type = req.body.type || log.type;
        await log.save();
        await log.populate('userId', 'name avatar');
        res.json(log);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 删除 (仅作者或管理员)
router.delete('/:id', auth, async (req, res) => {
    try {
        const log = await CheckIn.findById(req.params.id);
        if (!log) return res.status(404).json({ message: 'Not found' });

        const admin = await isAdmin(req.user.id);
        if (log.userId.toString() !== req.user.id && !admin) {
            return res.status(403).json({ message: '无权删除他人记录' });
        }

        await log.deleteOne();
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ========================
// 2. 打卡类型配置 (Types)
// ========================

// 获取所有类型 (公开)
router.get('/config/types', async (req, res) => {
    try {
        const types = await CheckInType.find().sort({ order: 1 });
        res.json(types);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 初始化/添加类型 (仅管理员)
router.post('/config/types', auth, async (req, res) => {
    if (!(await isAdmin(req.user.id))) return res.status(403).json({ message: 'Admin only' });
    try {
        const newType = new CheckInType(req.body);
        await newType.save();
        res.json(newType);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// 删除类型 (仅管理员)
router.delete('/config/types/:id', auth, async (req, res) => {
    if (!(await isAdmin(req.user.id))) return res.status(403).json({ message: 'Admin only' });
    try {
        await CheckInType.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});
// ... (保留之前的代码)

// 修改类型 (仅管理员) - 🔥 新增接口
router.put('/config/types/:id', auth, async (req, res) => {
    if (!(await isAdmin(req.user.id))) return res.status(403).json({ message: 'Admin only' });
    try {
        const { label, icon, styleClass, order } = req.body;
        const updatedType = await CheckInType.findByIdAndUpdate(
            req.params.id,
            { label, icon, styleClass, order },
            { new: true } // 返回更新后的对象
        );
        res.json(updatedType);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 删除类型 (仅管理员)
// ... (保留之前的代码)
module.exports = router;