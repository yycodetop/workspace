const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// 数据库连接
// const DB_URI = 'mongodb+srv://zhoujy_codeTop_user:ZOmojDYBWHLp3QR5@cluster0.tthdthf.mongodb.net/?appName=Cluster0';
const DB_URI = 'mongodb://127.0.0.1:27017/test';
mongoose.connect(DB_URI)
    .then(() => console.log("✅ MongoDB 连接成功"))
    .catch(err => console.error("❌ MongoDB 连接失败:", err));

// 静态路径
const clientPath = path.join(__dirname, '../My-tools-web');
const uploadPath = path.join(clientPath, 'uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// === API 路由区 ===
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ideas', require('./routes/ideaRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/scripts', require('./routes/scriptRoutes'));
app.use('/api/checkins', require('./routes/checkInRoutes'));
app.use('/api/work-logs', require('./routes/workLogRoutes'));
// 在其他 app.use 附近添加
app.use('/api/tuition', require('./routes/tuitionRoutes'));

// 🔥🔥 核心修复：SOP 路由必须在这里，且在 404 之前！
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/sop', require('./routes/sopRoutes')); 
// 🔥 新增：C++ 题目研发路由
app.use('/api/problems', require('./routes/problemRoutes')); // 👈 Add this line
// 静态资源托管
app.use(express.static(clientPath));
app.use('/uploads', express.static(uploadPath));

// === 兜底路由 (Catch-All) ===
// ⚠️ 任何未匹配的 API 返回 404，页面请求返回 index.html
app.get(/.*/, (req, res) => {
    if (req.path.startsWith('/api')) {
        console.log(`⚠️ 404 API Not Found: ${req.path}`);
        return res.status(404).json({ message: 'API Not Found' });
    }
    res.sendFile(path.join(clientPath, 'index.html'));
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 服务重启完成: http://localhost:${PORT}`);
});