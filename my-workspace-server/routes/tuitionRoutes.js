// routes/tuitionRoutes.js
const express = require('express');
const router = express.Router();
const { TuitionConfig, TuitionRecord } = require('../models/Tuition');
const auth = require('../middleware/auth');
const User = require('../models/User');

// === 中间件 ===
router.use(auth);

// ============================
// 1. 配置管理 (校区 & 课程)
// ============================

// 获取所有配置
router.get('/config', async (req, res) => {
    try {
        const configs = await TuitionConfig.find().sort({ createdAt: 1 });
        res.json(configs);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 新增配置 (校区/课程)
router.post('/config', async (req, res) => {
    try {
        const { type, name } = req.body;
        if (!name || !type) return res.status(400).json({ message: '名称和类型必填' });
        
        const newConfig = new TuitionConfig({ type, name });
        await newConfig.save();
        res.json(newConfig);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 修改配置名称 (不允许删除，只能修改)
router.put('/config/:id', async (req, res) => {
    try {
        const { name } = req.body;
        const config = await TuitionConfig.findByIdAndUpdate(
            req.params.id, 
            { name }, 
            { new: true }
        );
        res.json(config);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// ============================
// 2. 收费/退费 记录管理
// ============================

// 获取记录列表 (支持模糊搜索)
router.get('/records', async (req, res) => {
    try {
        const { type, search } = req.query;
        let query = {};
        
        if (type) query.type = type;

        // 模糊搜索：学生姓名、课程、教师
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { studentName: regex },
                { course: regex },
                { teacher: regex }
            ];
        }

        const records = await TuitionRecord.find(query).sort({ createdAt: -1 });
        res.json(records);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 新增记录 (收费或退费)
router.post('/records', async (req, res) => {
    try {
        const recordData = {
            ...req.body,
            operatorId: req.user.id
        };
        const newRecord = new TuitionRecord(recordData);
        await newRecord.save();
        res.json(newRecord);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// ============================
// 3. 数据分析 (聚合查询)
// ============================

router.post('/analysis', async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // 包含结束当天的全天

        // 通用聚合函数
        const aggregateData = async (groupByField, recordType) => {
            return await TuitionRecord.aggregate([
                {
                    $match: {
                        type: recordType,
                        transactionDate: { $gte: start, $lte: end }
                    }
                },
                {
                    $group: {
                        _id: `$${groupByField}`, // 按字段分组 (campus, course, teacher)
                        totalAmount: { $sum: "$amount" },
                        count: { $sum: 1 }
                    }
                }
            ]);
        };

        // 并行执行所有查询
        const [incomeByCampus, incomeByCourse, incomeByTeacher, refundData] = await Promise.all([
            aggregateData('campus', 'income'),
            aggregateData('course', 'income'),
            aggregateData('teacher', 'income'),
            // 退费总览 (也可以按维度拆分，这里先取总和或按原因分组)
            TuitionRecord.aggregate([
                {
                    $match: {
                        type: 'refund',
                        transactionDate: { $gte: start, $lte: end }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRefund: { $sum: "$amount" },
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);

        res.json({
            income: {
                byCampus: incomeByCampus,
                byCourse: incomeByCourse,
                byTeacher: incomeByTeacher
            },
            refund: refundData[0] || { totalRefund: 0, count: 0 }
        });

    } catch (e) { 
        console.error(e);
        res.status(500).json({ message: "分析数据获取失败" }); 
    }
});

// 获取所有教师列表 (供下拉选择)
router.get('/teachers', async (req, res) => {
    try {
        // 返回所有用户作为潜在教师列表
        const users = await User.find({}, 'name');
        res.json(users);
    } catch (e) { res.status(500).json(e); }
});

module.exports = router;