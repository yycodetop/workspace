const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

router.use(auth);

// 获取动态列表 (只取最近 50 条，按时间倒序)
router.get('/', async (req, res) => {
    try {
        const logs = await Activity.find({})
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;