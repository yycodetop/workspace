const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// 👇 配置你的数据库地址
//const DB_URI = 'mongodb+srv://zhoujy_codeTop_user:ZOmojDYBWHLp3QR5@cluster0.tthdthf.mongodb.net/?appName=Cluster0';
const DB_URI = 'mongodb://127.0.0.1:27017/test';
// 👇 配置你要创建的账号密码
const ADMIN_USER = 'admin';
const ADMIN_PASS = '123456'; // 建议改复杂点

async function createAdmin() {
    try {
        await mongoose.connect(DB_URI);
        console.log("🔗 数据库已连接");

        // 检查是否已存在
        const exist = await User.findOne({ username: ADMIN_USER });
        if (exist) {
            console.log("⚠️ 管理员账号已存在，无需创建");
            process.exit();
        }

        // 加密密码
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASS, salt);

        // 创建用户
        const user = new User({
            username: ADMIN_USER,
            password: hashedPassword
        });

        await user.save();
        console.log(`✅ 管理员创建成功！\n账号: ${ADMIN_USER}\n密码: ${ADMIN_PASS}`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createAdmin();