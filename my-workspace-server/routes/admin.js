const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const IdeaCategory = require('../models/IdeaCategory');
const auth = require('../middleware/auth');

// 🛡️ 鉴权中间件：带详细 Debug 日志
router.use(auth);
router.use(async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('roles');
        
        if (!user) {
            console.error(`❌ Admin Auth Fail: User not found (ID: ${req.user.id})`);
            return res.status(404).json({ message: '用户不存在' });
        }

        // 调试日志：打印当前请求的用户信息
        console.log(`🔍 Admin Check: [${user.username}] Role:${user.role} IsAdmin:${user.isAdmin}`);
        if (user.roles && user.roles.length > 0) {
            console.log(`   Roles: ${user.roles.map(r => r.name).join(', ')}`);
        } else {
            console.log(`   Roles: (Empty)`);
        }

        // 判定规则：满足任意一条即视为管理员
        const isSystemAdmin = (
            user.isAdmin === true || 
            user.role === 'admin' || 
            (user.roles && user.roles.some(r => r.name === 'admin'))
        );

        if (isSystemAdmin) {
            console.log("✅ Access Granted");
            next();
        } else {
            console.warn("⛔ Access Denied: User is not admin");
            res.status(403).json({ message: '权限拒绝：需要管理员权限 (Check server logs)' });
        }
    } catch (e) {
        console.error("❌ Admin Auth Error:", e);
        res.status(500).json({ message: '鉴权服务异常' });
    }
});

// ==========================================
// 1. 用户管理
// ==========================================
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password').populate('roles').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/users/:id', async (req, res) => {
    try {
        const { isActive, roles } = req.body;
        const updateData = {};
        if (typeof isActive === 'boolean') updateData.isActive = isActive;
        if (roles) updateData.roles = roles;
        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('roles');
        res.json(updatedUser);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ==========================================
// 2. 权限方案管理
// ==========================================
router.get('/roles', async (req, res) => {
    try {
        const roles = await Role.find().sort({ createdAt: -1 });
        res.json(roles);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/roles', async (req, res) => {
    try {
        const { name, description, permissions } = req.body;
        const newRole = new Role({ name, description, permissions });
        await newRole.save();
        res.json(newRole);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/roles/:id', async (req, res) => {
    try {
        await Role.findByIdAndDelete(req.params.id);
        res.json({ message: 'Role deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ==========================================
// 3. 创意分类管理
// ==========================================
router.get('/idea-categories', async (req, res) => {
    try {
        const cats = await IdeaCategory.find().sort({ createdAt: 1 });
        res.json(cats);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/idea-categories', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: '名称必填' });
        const exists = await IdeaCategory.findOne({ name });
        if(exists) return res.status(400).json({ message: '分类已存在' });
        const newCat = new IdeaCategory({ name });
        await newCat.save();
        res.json(newCat);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/idea-categories/:id', async (req, res) => {
    try {
        await IdeaCategory.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;