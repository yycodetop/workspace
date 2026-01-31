const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const authMiddleware = require('../middleware/auth');
const multer = require('multer'); // 引入上传库
const path = require('path');

const JWT_SECRET = 'my_super_secret_key_888';

// === 📤 上传配置 (Multer) ===
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 存到前端项目的 uploads 文件夹
        cb(null, path.join(__dirname, '../../My-tools-web/uploads'));
    },
    filename: function (req, file, cb) {
        // 文件名：user-{id}-{timestamp}.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'avatar-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage });

// =======================
// 1. 注册 & 登录 (保持原有逻辑，增加返回 avatar)
// =======================
router.post('/register', async (req, res) => {
    // ... (保持原有的注册逻辑)
    // 为节省篇幅，这里简写，请确保你的注册逻辑包含 roles 初始化
    // 建议直接复制上一个版本的 register 代码，或者使用下面的简化版：
    const { username, password, name } = req.body;
    try {
        if (await User.findOne({ username })) return res.status(400).json({ message: '账号已存在' });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // 赋予初始角色逻辑... (这里省略具体 Role 查找代码，沿用之前的逻辑即可)
        // 简单创建一个无角色的用户
        const newUser = new User({ username, password: hashedPassword, name, roles: [] });
        await newUser.save();
        res.status(201).json({ message: '注册成功' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username }).populate('roles');
        if (!user || !user.isActive) return res.status(403).json({ message: '用户不存在或被禁用' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: '密码错误' });

        // 计算权限
        const permissions = {};
        if (user.roles) {
            user.roles.forEach(role => {
                if (role.permissions) {
                    // 处理 Map 转 Object
                    let pMap = role.permissions;
                    if (pMap instanceof Map) pMap = Object.fromEntries(pMap);
                    else if (pMap.toJSON) pMap = pMap.toJSON();
                    
                    for (const [mid, acts] of Object.entries(pMap)) {
                        if(!permissions[mid]) permissions[mid]=[];
                        permissions[mid] = [...new Set([...permissions[mid], ...acts])];
                    }
                }
            });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ 
            token, username: user.username, name: user.name, userId: user._id, 
            avatar: user.avatar, // 🔥 返回头像
            permissions 
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// =======================
// 2. 更新个人资料 (昵称 & 头像)
// =======================
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { name, avatar } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (avatar) updateData.avatar = avatar;

        const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true });
        res.json({ name: user.name, avatar: user.avatar, message: '资料已更新' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =======================
// 3. 图片上传接口
// =======================
router.post('/upload-avatar', authMiddleware, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: '请选择文件' });
    // 返回相对路径
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// =======================
// 4. 修改密码
// =======================
router.put('/password', authMiddleware, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: '参数不完整' });

    try {
        const user = await User.findById(req.userId);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: '旧密码错误' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: '密码修改成功' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// =======================
// 5. 管理接口 (保持之前的逻辑)
// =======================
router.get('/users', authMiddleware, async (req, res) => { /*...略...*/ }); 
router.put('/users/:id', authMiddleware, async (req, res) => { /*...略...*/ });

// =======================
// 🔥 新增：更新我的技能树
// =======================
router.put('/profile/skills', authMiddleware, async (req, res) => {
    try {
        const { skills } = req.body; // 前端传来的 skills 数组
        
        // 简单校验
        if (!Array.isArray(skills)) {
            return res.status(400).json({ message: '数据格式错误' });
        }

        // 更新数据库
        const user = await User.findByIdAndUpdate(
            req.userId, 
            { skills: skills }, 
            { new: true } // 返回更新后的数据
        );

        res.json({ message: '技能树已保存', skills: user.skills });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;