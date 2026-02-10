const express = require('express');
const router = express.Router();
const CheckIn = require('../models/CheckIn'); // 确保你有 CheckIn 模型
const CheckInType = require('../models/CheckInType'); // 确保你有 CheckInType 模型
const auth = require('../middleware/auth');

router.use(auth);

// ==========================================
// 1. 打卡记录 (CheckIns)
// ==========================================

// 获取所有打卡 (倒序)
router.get('/', async (req, res) => {
    try {
        const list = await CheckIn.find()
            .populate('userId', 'name avatar') // 关联用户信息
            .sort({ createdAt: -1 })
            .limit(100); // 限制返回数量，防止过多
        res.json(list);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 新增打卡
router.post('/', async (req, res) => {
    try {
        const { content, type } = req.body;
        const newCheckIn = new CheckIn({
            userId: req.user.id,
            content,
            type
        });
        await newCheckIn.save();
        // 填充用户信息后返回，方便前端直接显示头像
        await newCheckIn.populate('userId', 'name avatar');
        res.json(newCheckIn);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 删除打卡
router.delete('/:id', async (req, res) => {
    try {
        const checkIn = await CheckIn.findById(req.params.id);
        if (!checkIn) return res.status(404).json({ message: '记录不存在' });

        // 权限：只能删自己的
        if (checkIn.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: '无权删除' });
        }

        await CheckIn.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 修改打卡
router.put('/:id', async (req, res) => {
    try {
        const { content, type } = req.body;
        const checkIn = await CheckIn.findById(req.params.id);
        if (checkIn.userId.toString() !== req.user.id) return res.status(403).json({ message: '无权修改' });

        if (content) checkIn.content = content;
        if (type) checkIn.type = type;
        await checkIn.save();
        
        // 重新 populate 保持数据结构一致
        await checkIn.populate('userId', 'name avatar');
        res.json(checkIn);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// ==========================================
// 2. 打卡类型配置 (CheckInTypes)
// ==========================================

// 获取类型
router.get('/config/types', async (req, res) => {
    try {
        const types = await CheckInType.find().sort({ createdAt: 1 });
        res.json(types);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 新增类型
router.post('/config/types', async (req, res) => {
    try {
        const { label, icon, styleClass } = req.body;
        const newType = new CheckInType({ label, icon, styleClass });
        await newType.save();
        res.json(newType);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 修改类型
router.put('/config/types/:id', async (req, res) => {
    try {
        const updated = await CheckInType.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 删除类型
router.delete('/config/types/:id', async (req, res) => {
    try {
        await CheckInType.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;