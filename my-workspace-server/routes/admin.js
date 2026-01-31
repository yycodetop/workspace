const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const auth = require('../middleware/auth'); 
const IdeaCategory = require('../models/IdeaCategory');
// 🛡️ 全局拦截
router.use(auth);
router.use((req, res, next) => {
    // 只有拥有 manage_users 或 manage_roles 权限的人才能访问管理接口
    // 或者你是超级管理员 (admin:view)
    if (req.hasPerm('admin', 'view') || req.hasPerm('admin', 'manage_users') || req.hasPerm('admin', 'manage_roles')) {
        next();
    } else {
        res.status(403).json({ message: '系统禁区：权限不足' });
    }
});

// 1. 获取所有用户 (使用 .lean() 转为纯JSON)
router.get('/users', async (req, res) => {
    try {
        // populate('roles') 会把角色详情带出来
        const users = await User.find({}, '-password').populate('roles').sort({ createdAt: -1 }).lean();
        res.json(users);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. 更新用户 (分配角色)
router.put('/users/:id', async (req, res) => {
    try {
        const { isActive, roles } = req.body;
        const updateData = {};
        if (typeof isActive !== 'undefined') updateData.isActive = isActive;
        if (roles) updateData.roles = roles; 

        // 这里的 roles 是 ID 数组，Mongoose 会自动处理
        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('roles');
        res.json(updatedUser);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 3. 获取所有角色
router.get('/roles', async (req, res) => {
    try {
        // 使用 .lean() 确保 permissions Map 被转换为普通 Object
        const roles = await Role.find({}).lean();
        res.json(roles);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 4. 创建/更新角色
router.post('/roles', async (req, res) => {
    try {
        const { _id, name, description, permissions } = req.body;
        
        // permissions 前端传过来是 Object，Mongoose Schema 定义是 Map
        // Mongoose 会自动把 Object 转为 Map 存储，这没问题
        
        let role;
        if (_id) {
            role = await Role.findByIdAndUpdate(_id, { name, description, permissions }, { new: true });
        } else {
            role = new Role({ name, description, permissions });
            await role.save();
        }
        res.json(role);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 5. 删除角色
router.delete('/roles/:id', async (req, res) => {
    try {
        await Role.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});
// === 💡 创意分类管理接口 ===

// 6. 获取所有分类
router.get('/idea-categories', async (req, res) => {
    try {
        const cats = await IdeaCategory.find({}).sort({ createdAt: 1 });
        res.json(cats);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 7. 添加分类
router.post('/idea-categories', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: '名称不能为空' });
        const newCat = new IdeaCategory({ name });
        await newCat.save();
        res.json(newCat);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 8. 删除分类
router.delete('/idea-categories/:id', async (req, res) => {
    try {
        await IdeaCategory.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;