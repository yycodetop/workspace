const mongoose = require('mongoose');
const User = require('./models/User');

// 👇【注意】请确保这里换成你 server.js 里一模一样的数据库地址！
const DB_URI = 'mongodb+srv://zhoujy_codeTop_user:ZOmojDYBWHLp3QR5@cluster0.tthdthf.mongodb.net/?appName=Cluster0';

async function fixAdmin() {
    try {
        console.log("🔌 正在连接数据库...");
        await mongoose.connect(DB_URI);
        console.log("✅ 数据库已连接");

        const adminUser = await User.findOne({ username: 'admin' });

        if (!adminUser) {
            console.log("❌ 未找到 admin 账号，请先注册或运行 create-admin.js");
        } else {
            console.log(`👤 找到用户: ${adminUser.username}`);
            
            // 强制赋予最高权限
            adminUser.isActive = true;   // 激活
            adminUser.canAssign = true;  // 允许派活
            adminUser.role = 'admin';    // 确保是管理员
            if (!adminUser.name) adminUser.name = '超级管理员'; // 补全姓名

            await adminUser.save();
            console.log("🎉 修复成功！admin 账号已激活且拥有最高权限。");
        }

        process.exit();
    } catch (err) {
        console.error("💥 出错啦:", err);
        process.exit(1);
    }
}

fixAdmin();