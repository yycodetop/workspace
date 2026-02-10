// 文件名: debug-sop.js
const mongoose = require('mongoose');
const path = require('path');

// 1. 数据库配置
//const DB_URI = 'mongodb+srv://zhoujy_codeTop_user:ZOmojDYBWHLp3QR5@cluster0.tthdthf.mongodb.net/?appName=Cluster0';
const DB_URI = 'mongodb://127.0.0.1:27017/test';
async function runDiagnostics() {
    console.log("🔍 开始 SOP 系统诊断...");

    try {
        // 2. 测试数据库连接
        console.log("⏳ 正在连接 MongoDB...");
        await mongoose.connect(DB_URI);
        console.log("✅ MongoDB 连接成功！");

        // 3. 尝试加载关键模型
        console.log("⏳ 正在加载模型文件...");
        
        // 显式加载 Role (模拟 sopRoutes 的行为)
        try {
            require('./models/Role');
            console.log("✅ Role 模型文件加载成功");
        } catch (e) {
            console.error("❌ Role 模型文件加载失败:", e.message);
        }

        // 加载 SOPTemplate
        try {
            require('./models/SOPTemplate');
            console.log("✅ SOPTemplate 模型文件加载成功");
        } catch (e) {
            console.error("❌ SOPTemplate 模型文件加载失败:", e.message);
        }

        // 4. 检查 Mongoose 模型注册表
        const registeredModels = mongoose.modelNames();
        console.log("📋 当前已注册的模型:", registeredModels);

        if (!registeredModels.includes('Role')) {
            console.error("❌ 严重错误: 'Role' 模型未注册！这会导致 populate 失败。");
        }
        if (!registeredModels.includes('SOPTemplate')) {
            console.error("❌ 严重错误: 'SOPTemplate' 模型未注册！");
        }

        // 5. 模拟查询 (复现报错场景)
        console.log("⏳ 正在尝试执行 SOPTemplate.find().populate()...");
        
        // 获取模型引用
        const SOPTemplate = mongoose.model('SOPTemplate');
        
        // 执行查询
        const templates = await SOPTemplate.find({})
            .populate('defaultReviewerRoleId', 'name') // 这是最容易报错的一步
            .limit(1);

        console.log(`✅ 查询成功！找到 ${templates.length} 个模版。`);
        console.log("🎉 诊断通过：数据库和模型层看似正常。问题可能出在 server.js 的路由挂载顺序或中间件。");

    } catch (err) {
        console.error("\n💥 诊断过程中捕获到异常！");
        console.error("---------------------------------------------------");
        console.error("错误名称:", err.name);
        console.error("错误信息:", err.message);
        console.error("---------------------------------------------------");
        
        if (err.name === 'MissingSchemaError') {
            console.log("💡 修复建议: 看起来 'Role' 模型没有被正确引用。请确保 models/Role.js 文件存在且内容正确。");
        }
    } finally {
        await mongoose.disconnect();
        console.log("👋 诊断结束");
    }
}

runDiagnostics();