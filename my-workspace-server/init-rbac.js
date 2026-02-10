const mongoose = require('mongoose');
const Role = require('./models/Role');
require('dotenv').config();

// 数据库连接
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/my-workspace', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected for RBAC Init'))
  .catch(err => console.log(err));

// 🔥 定义系统全量权限列表
// 这里涵盖了您目前所有的业务模块
const ALL_PERMISSIONS = [
    { code: 'sys_admin', name: '系统管理', desc: '用户管理、权限分配' },
    { code: 'tuition', name: '学费管理', desc: '收费、退费、财务分析' },
    { code: 'sop', name: 'SOP流程', desc: 'SOP模板查看与执行' },
    { code: 'problem', name: '问题/题库', desc: '问题追踪与解决方案' },
    { code: 'idea', name: '灵感库', desc: '想法记录与分类' },
    { code: 'resource', name: '资源库', desc: '文件与脚本管理' },
    { code: 'task', name: '任务管理', desc: '日常Todo与任务分配' },
    { code: 'teleprompter', name: '提词器', desc: '视频录制提词工具' },
    { code: 'worklog', name: '工作日志', desc: '工时与日志记录' }
];

const initRBAC = async () => {
    try {
        // 1. 初始化或更新 Admin 角色 (拥有所有权限)
        const adminPerms = ALL_PERMISSIONS.map(p => p.code);
        await Role.findOneAndUpdate(
            { name: 'admin' },
            { 
                name: 'admin',
                permissions: adminPerms,
                description: '超级管理员，拥有所有模块权限'
            },
            { upsert: true, new: true }
        );
        console.log('✅ Admin role updated with full permissions.');

        // 2. 初始化或更新 User 角色 (默认权限，不含财务和系统管理)
        const userPerms = ['task', 'idea', 'resource', 'problem', 'teleprompter', 'worklog', 'sop'];
        await Role.findOneAndUpdate(
            { name: 'user' },
            { 
                name: 'user',
                permissions: userPerms,
                description: '普通成员，拥有除财务和系统管理外的常规权限'
            },
            { upsert: true, new: true }
        );
        console.log('✅ User role updated with standard permissions.');

        // 3. (可选) 初始化 财务 角色
        await Role.findOneAndUpdate(
            { name: 'finance' },
            { 
                name: 'finance',
                permissions: ['tuition', 'worklog'],
                description: '财务专员，仅处理学费相关'
            },
            { upsert: true, new: true }
        );
        console.log('✅ Finance role updated.');

    } catch (error) {
        console.error('RBAC Init Error:', error);
    } finally {
        mongoose.disconnect();
    }
};

initRBAC();