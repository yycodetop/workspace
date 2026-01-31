const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // 引入 fs 模块

const app = express();

app.use(cors());
app.use(express.json());

// 👇 数据库配置 (请确认密码正确)
const DB_URI = 'mongodb+srv://zhoujy_codeTop_user:ZOmojDYBWHLp3QR5@cluster0.tthdthf.mongodb.net/?appName=Cluster0';

mongoose.connect(DB_URI)
    .then(() => console.log("✅ MongoDB 连接成功"))
    .catch(err => console.error("❌ MongoDB 连接失败:", err));

// --- 📂 关键配置：处理文件上传目录 ---
// 我们要把图片存在前端文件夹里，这样前端直接就能访问
const clientPath = path.join(__dirname, '../My-tools-web');
const uploadPath = path.join(clientPath, 'uploads');

// 如果 uploads 文件夹不存在，自动创建它
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log("📂 自动创建上传目录:", uploadPath);
}

// 注册路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ideas', require('./routes/ideaRoutes')); // 👈 新增这一行
app.use('/api/projects', require('./routes/projectRoutes')); // 👈 新增这行
app.use('/api/activities', require('./routes/activityRoutes')); // 👈 新增
app.use('/api/resources', require('./routes/resourceRoutes'));
// 🔥 新增：注册用户/团队接口 (用于技能墙)
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/scripts', require('./routes/scriptRoutes'));
// 新增：打卡记录接口
app.use('/api/checkins', require('./routes/checkInRoutes'));
// 🚀 静态资源托管
// 1. 托管前端主目录
app.use(express.static(clientPath));
// 2. 显式托管 uploads 目录 (虽然他在 clientPath 里，但显式声明更安全)
app.use('/uploads', express.static(uploadPath));

// 兜底路由
app.get(/.*/, (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ message: 'API Not Found' });
    res.sendFile(path.join(clientPath, 'index.html'));
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 全栈服务运行中: http://localhost:${PORT}`);
});