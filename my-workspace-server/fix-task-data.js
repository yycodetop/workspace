const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');

// 👇 确保地址正确
//const DB_URI = 'mongodb+srv://zhoujy_codeTop_user:ZOmojDYBWHLp3QR5@cluster0.tthdthf.mongodb.net/?appName=Cluster0';
const DB_URI = 'mongodb://127.0.0.1:27017/test';
async function fixData() {
    try {
        console.log("🔌 连接数据库...");
        await mongoose.connect(DB_URI);
        console.log("✅ 数据库已连接");

        // 1. 找到现在的 Admin 用户
        const adminUser = await User.findOne({ username: 'admin' });
        if (!adminUser) {
            console.log("❌ 找不到 admin 用户");
            process.exit(1);
        }
        console.log(`👤 当前 Admin ID: ${adminUser._id}`);

        // 2. 找到所有看起来像是 Admin 的任务 (通过名字匹配，或 ownerId 不存在的)
        // 这里简单粗暴：把所有 ownerName 是 '超级管理员' 或 'admin' 的任务都归给他
        const res = await Task.updateMany(
            { $or: [{ ownerName: '超级管理员' }, { ownerName: 'admin' }, { ownerName: 'Admin' }] },
            { $set: { ownerId: adminUser._id.toString(), ownerName: adminUser.name } }
        );

        console.log(`✨ 修复完成！已更新 ${res.modifiedCount} 个任务的归属权。`);
        console.log("现在这些任务都属于当前的 Admin 了。");

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixData();