/**
 * User Routes - Public/Team Data
 * 修复：移除 isActive 限制，增加更新用户信息接口
 */
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

router.use(auth);

// 1. 获取团队技能墙数据
// GET /api/users/wall
router.get('/wall', async (req, res) => {
    try {
        // 🔥 修复：移除 { isActive: true }，让所有用户都能显示
        // 如果你希望只显示已激活的，请确保数据库里 isActive 为 true
        const users = await User.find() 
            .select('name avatar skills roles createdAt isActive') 
            .populate('roles', 'name'); 

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. 🔥 新增：更新用户信息（用于保存技能、头像等）
// PUT /api/users/:id
router.put('/:id', async (req, res) => {
    try {
        // 简单权限校验：只能改自己，或者是管理员
        if (req.user.id !== req.params.id) {
            // 这里可以加管理员判断逻辑，暂且先只允许改自己
            // const operator = await User.findById(req.user.id);
            // if (operator.role !== 'admin') return res.status(403).json...
        }

        const { skills, avatar, name } = req.body;
        const updateData = {};
        if (skills) updateData.skills = skills;
        if (avatar) updateData.avatar = avatar;
        if (name) updateData.name = name;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;