/**
 * User Routes - Public/Team Data
 * 更新：增加 createdAt 字段用于排序
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

router.use(auth);

// 获取团队技能墙数据
// GET /api/users/wall
router.get('/wall', async (req, res) => {
    try {
        // 🔥 新增：select 中加入了 'createdAt'
        const users = await User.find({ isActive: true })
            .select('name avatar skills roles createdAt') 
            .populate('roles', 'name'); 

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;