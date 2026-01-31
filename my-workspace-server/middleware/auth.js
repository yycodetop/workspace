const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role'); 

const JWT_SECRET = 'my_super_secret_key_888';

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: '未提供认证令牌' });

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 🔥 关键：查询用户，并把关联的 roles 也查出来
        const user = await User.findById(decoded.id).populate('roles');

        if (!user) throw new Error('User not found');
        if (!user.isActive) return res.status(403).json({ message: '账号已被禁用' });

        // === 🚀 权限计算核心逻辑 ===
        const permissions = {};

        if (user.roles && user.roles.length > 0) {
            user.roles.forEach(role => {
                // Mongoose 的 Map 既可以用 .get() 也可以在某些情况下直接访问
                // 为了保险，我们先拿到它的 object 形式
                let permsMap = role.permissions;
                
                // 如果是 Mongoose Map，转换为 Object 方便遍历
                if (permsMap instanceof Map) {
                    permsMap = Object.fromEntries(permsMap);
                } else if (permsMap && typeof permsMap.toJSON === 'function') {
                    permsMap = permsMap.toJSON();
                }

                // 开始合并权限
                if (permsMap) {
                    for (const [menuId, actions] of Object.entries(permsMap)) {
                        if (!permissions[menuId]) permissions[menuId] = [];
                        // 合并数组并去重
                        permissions[menuId] = [...new Set([...permissions[menuId], ...actions])];
                    }
                }
            });
        }

        // === 🔍 调试日志 (只会打印在后端终端) ===
        // console.log(`👤 用户 [${user.username}] 登录。角色数: ${user.roles.length}`);
        // console.log(`🔑 最终权限表:`, JSON.stringify(permissions));

        // 挂载到 req
        req.user = user;
        req.permissions = permissions;
        req.userId = user._id;
        
        // 辅助判断方法
        req.hasPerm = (menuId, action) => {
            // 1. 超级管理员策略：如果有 admin:view 权限，通杀所有检查
            if (permissions['admin'] && permissions['admin'].includes('view')) return true;
            // 2. 普通检查
            return permissions[menuId] && permissions[menuId].includes(action);
        };

        next();
    } catch (e) {
        console.error("Auth Middleware Error:", e.message);
        res.status(401).json({ message: '认证失败' });
    }
};

module.exports = auth;