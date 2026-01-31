const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');

// 👇 请务必确认数据库地址正确
const DB_URI = 'mongodb+srv://zhoujy_codeTop_user:ZOmojDYBWHLp3QR5@cluster0.tthdthf.mongodb.net/?appName=Cluster0';

async function initRBAC() {
    try {
        console.log("🔌 连接数据库...");
        await mongoose.connect(DB_URI);
        console.log("✅ 数据库已连接");

        // 1. 定义超级管理员权限
        const superPerms = {
            'tasks': ['view', 'create', 'edit', 'delete', 'assign', 'view_all', 'edit_all', 'delete_all'],
            'admin': ['view', 'manage_users', 'manage_roles'],
            'prompts': ['view']
        };

        // 2. 查找或创建角色
        let superRole = await Role.findOne({ name: '超级管理员' });
        if (!superRole) {
            superRole = new Role({ 
                name: '超级管理员', 
                description: '系统最高权限，自动初始化生成',
                permissions: superPerms 
            });
            await superRole.save();
            console.log("✨ '超级管理员' 角色创建成功！");
        } else {
            // 更新权限以防 outdated
            superRole.permissions = superPerms;
            await superRole.save();
            console.log("🔄 '超级管理员' 角色权限已更新。");
        }

        // 3. 赋予 admin 用户
        const adminUser = await User.findOne({ username: 'admin' });
        if (adminUser) {
            // 覆盖 roles 数组
            adminUser.roles = [superRole._id];
            adminUser.isActive = true; // 确保激活
            await adminUser.save();
            console.log(`👑 用户 [admin] 已升级为超级管理员！`);
        } else {
            console.log("⚠️ 未找到 admin 用户，请先注册一个名为 admin 的账号。");
        }

        process.exit();
    } catch (err) {
        console.error("❌ 发生错误:", err);
        process.exit(1);
    }
}

initRBAC();