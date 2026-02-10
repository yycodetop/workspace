const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');

// 您的数据库地址
//const DB_URI = 'mongodb+srv://zhoujy_codeTop_user:ZOmojDYBWHLp3QR5@cluster0.tthdthf.mongodb.net/?appName=Cluster0';
const DB_URI = 'mongodb://127.0.0.1:27017/test';

async function fixAdmin() {
    try {
        console.log("🔌 正在连接数据库...");
        await mongoose.connect(DB_URI);
        console.log("✅ 数据库已连接");

        // 1. 确保数据库里有一个 'admin' 角色 (权限方案)
        let adminRole = await Role.findOne({ name: 'admin' });
        if (!adminRole) {
            console.log("⚙️  正在创建 'admin' 角色方案...");
            adminRole = new Role({
                name: 'admin',
                description: '系统超级管理员，拥有所有权限',
                permissions: { admin: ['view', 'manage'] } // 赋予基础管理权限
            });
            await adminRole.save();
        }
        console.log(`🛡️  Admin 角色 ID: ${adminRole._id}`);

        // 2. 查找用户
        // ⚠️ 如果您的用户名是 'zhousir' 而不是 'admin'，请修改这里！
        // 为了保险，我查找所有用户，并把第一个找到的用户设为管理员
        const users = await User.find({});
        
        if (users.length === 0) {
            console.error("❌ 数据库是空的！请先启动前端并在页面上注册一个账号，然后再运行此脚本。");
            process.exit(1);
        }

        // 这里默认提升第一个用户 (通常是您自己)
        // 或者您可以指定用户名： const targetUser = await User.findOne({ username: 'zhousir' });
        const targetUser = users[0]; 

        console.log(`👤 正在提权用户: [${targetUser.username}] (${targetUser.name})`);
        
        // 3. 强制赋予最高权限
        targetUser.isActive = true;   
        targetUser.isAdmin = true;    // 设置超级管理员标志
        targetUser.role = 'admin';    // 设置字符串角色
        
        // 4. 将 Admin 角色的 ID 加入到用户的 roles 数组中
        // 先清空旧的，防止重复
        targetUser.roles = [adminRole._id];

        await targetUser.save();
        
        console.log("---------------------------------------------------");
        console.log(`🎉 修复成功！用户 [${targetUser.username}] 现已是超级管理员。`);
        console.log("👉 请重启后端服务 (node server.js)，然后刷新前端页面。");
        console.log("---------------------------------------------------");

        process.exit();
    } catch (err) {
        console.error("💥 出错啦:", err);
        process.exit(1);
    }
}

fixAdmin();