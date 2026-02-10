// routes/tuitionRoutes.js
const express = require('express');
const router = express.Router();
const { TuitionConfig, TuitionRecord } = require('../models/Tuition');
const auth = require('../middleware/auth');
const User = require('../models/User');

router.use(auth);

const checkAdmin = async (userId) => {
    const user = await User.findById(userId);
    if (user && (user.username === 'admin' || user.role === 'admin')) return true;
    return false;
};

// ============================
// 1. 配置管理
// ============================
router.get('/config', async (req, res) => {
    try {
        const configs = await TuitionConfig.find().sort({ createdAt: 1 });
        res.json(configs);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/config', async (req, res) => {
    try {
        const { type, name } = req.body;
        if (!name || !type) return res.status(400).json({ message: '名称和类型必填' });
        const newConfig = new TuitionConfig({ type, name });
        await newConfig.save();
        res.json(newConfig);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/config/:id', async (req, res) => {
    try {
        const { name } = req.body;
        const config = await TuitionConfig.findByIdAndUpdate(req.params.id, { name }, { new: true });
        res.json(config);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// ============================
// 2. 记录管理 (含查询与导出筛选)
// ============================

router.get('/records', async (req, res) => {
    try {
        const { type, search, startDate, endDate } = req.query;
        let query = {};
        
        // 类型筛选
        if (type) query.type = type;

        // 🔥 时间区间筛选
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // 包含结束当天的全天
            query.transactionDate = { $gte: start, $lte: end };
        }

        // 模糊搜索
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { studentName: regex },
                { course: regex },
                { teacher: regex },
                { remarks: regex },
                { operatorName: regex },
                { referral: regex }
            ];
        }

        const records = await TuitionRecord.find(query).sort({ transactionDate: -1, createdAt: -1 });
        res.json(records);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/records', async (req, res) => {
    try {
        const recordData = {
            ...req.body,
            operatorId: req.user.id,
            operatorName: req.user.name 
        };
        const newRecord = new TuitionRecord(recordData);
        await newRecord.save();
        res.json(newRecord);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/records/:id', async (req, res) => {
    try {
        const isAdmin = await checkAdmin(req.user.id);
        if (!isAdmin) return res.status(403).json({ message: '权限不足' });
        const updatedRecord = await TuitionRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedRecord);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/records/:id', async (req, res) => {
    try {
        const isAdmin = await checkAdmin(req.user.id);
        if (!isAdmin) return res.status(403).json({ message: '权限不足' });
        await TuitionRecord.findByIdAndDelete(req.params.id);
        res.json({ message: '删除成功' });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// ============================
// 3. 数据分析
// ============================
router.post('/analysis', async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const aggregateData = async (groupByField, recordType) => {
            return await TuitionRecord.aggregate([
                { $match: { type: recordType, transactionDate: { $gte: start, $lte: end } } },
                { $group: { _id: `$${groupByField}`, totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } }
            ]);
        };

        const [incomeByCampus, incomeByCourse, incomeByTeacher, refundData] = await Promise.all([
            aggregateData('campus', 'income'),
            aggregateData('course', 'income'),
            aggregateData('teacher', 'income'),
            TuitionRecord.aggregate([
                { $match: { type: 'refund', transactionDate: { $gte: start, $lte: end } } },
                { $group: { _id: null, totalRefund: { $sum: "$amount" }, count: { $sum: 1 } } }
            ])
        ]);

        res.json({
            income: { byCampus: incomeByCampus, byCourse: incomeByCourse, byTeacher: incomeByTeacher },
            refund: refundData[0] || { totalRefund: 0, count: 0 }
        });
    } catch (e) { console.error(e); res.status(500).json({ message: "分析数据获取失败" }); }
});

router.get('/teachers', async (req, res) => {
    try {
        const users = await User.find({}, 'name');
        res.json(users);
    } catch (e) { res.status(500).json(e); }
});

module.exports = router;