const express = require('express');
const mongoose = require('mongoose'); // 确保引入 mongoose
const router = express.Router();
let SOPTemplate, SOPTask, Role, Task, User, SOPCategory;

// --- 动态定义/加载模型 ---
try {
    SOPTemplate = require('../models/SOPTemplate');
    SOPTask = require('../models/SOPTask');
    Role = require('../models/Role');
    Task = require('../models/Task'); 
    User = require('../models/User'); 
    
    // 🔥 定义 SOPCategory 模型 (如果文件中不存在则动态定义)
    if (mongoose.models.SOPCategory) {
        SOPCategory = mongoose.model('SOPCategory');
    } else {
        const categorySchema = new mongoose.Schema({
            name: { type: String, required: true, unique: true },
            createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            createdAt: { type: Date, default: Date.now }
        });
        SOPCategory = mongoose.model('SOPCategory', categorySchema);
    }

} catch (e) { console.error("❌ 模型加载/定义失败:", e); }

const auth = require('../middleware/auth');
const getUid = (req) => req.user?.id || req.userId;

// 辅助：检查管理员权限
const checkAdmin = async (req) => {
    const uid = getUid(req);
    const user = await User.findById(uid).populate('roles');
    if (!user) return false;
    if (user.isAdmin) return true;
    if (user.roles && user.roles.some(r => (r.name||r).toLowerCase().includes('admin'))) return true;
    return false;
};

router.use(auth);

// === 🔥 0. 分类管理 API (新增) ===

// 获取所有分类
router.get('/categories', async (req, res) => {
    try {
        const cats = await SOPCategory.find().sort({ createdAt: 1 });
        res.json(cats);
    } catch (e) { res.status(500).json(e); }
});

// 新增分类 (Admin only)
router.post('/categories', async (req, res) => {
    try {
        if (!(await checkAdmin(req))) return res.status(403).json({ message: '无权操作' });
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: '分类名称不能为空' });
        const newCat = new SOPCategory({ name, createdBy: getUid(req) });
        await newCat.save();
        res.json(newCat);
    } catch (e) { res.status(400).json({ message: e.code === 11000 ? '分类已存在' : e.message }); }
});

// 修改分类 (Admin only)
router.put('/categories/:id', async (req, res) => {
    try {
        if (!(await checkAdmin(req))) return res.status(403).json({ message: '无权操作' });
        const { name } = req.body;
        const updated = await SOPCategory.findByIdAndUpdate(req.params.id, { name }, { new: true });
        res.json(updated);
    } catch (e) { res.status(500).json(e); }
});

// 删除分类 (Admin only)
router.delete('/categories/:id', async (req, res) => {
    try {
        if (!(await checkAdmin(req))) return res.status(403).json({ message: '无权操作' });
        await SOPCategory.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (e) { res.status(500).json(e); }
});


// === 1. 模版管理 ===
router.get('/templates', async (req, res) => {
    try { const t = await SOPTemplate.find().sort({ createdAt: -1 }); res.json(t); } catch (e) { res.status(500).json(e); }
});
router.post('/templates', async (req, res) => {
    try { const n = new SOPTemplate({ ...req.body, createdBy: getUid(req) }); await n.save(); res.status(201).json(n); } catch (e) { res.status(400).json(e); }
});
router.put('/templates/:id', async (req, res) => {
    try { const u = await SOPTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(u); } catch (e) { res.status(400).json(e); }
});
router.delete('/templates/:id', async (req, res) => {
    try { await SOPTemplate.findByIdAndDelete(req.params.id); res.json({ msg: 'Deleted' }); } catch (e) { res.status(500).json(e); }
});

// === 2. 任务管理 ===

router.get('/tasks/my', async (req, res) => {
    try {
        const tasks = await SOPTask.find({ userId: getUid(req) })
            .populate('reviewerId', 'name')
            .populate('relatedTaskId', 'title progress status')
            .sort({ updatedAt: -1 });
        res.json(tasks);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/tasks/all', async (req, res) => {
    try {
        const tasks = await SOPTask.find({})
            .populate('userId', 'name avatar') 
            .populate('reviewerId', 'name')
            .populate('relatedTaskId', 'title progress')
            .sort({ updatedAt: -1 });
        res.json(tasks);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/tasks/pending-review', async (req, res) => {
    try {
        const uid = getUid(req);
        const tasks = await SOPTask.find({ 
            status: { $in: ['submitted', 'reviewing'] },
            reviewerId: uid 
        })
        .populate('userId', 'name avatar')
        .populate('reviewerId', 'name')
        .populate('relatedTaskId', 'title progress')
        .sort({ updatedAt: 1 });
        res.json(tasks);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/tasks', async (req, res) => {
    try {
        const { templateId, reviewerId, relatedTaskId } = req.body;
        const template = await SOPTemplate.findById(templateId);
        if (!template) return res.status(404).json({ message: '模版不存在' });

        const initialStepData = template.steps.map((step, index) => ({
            stepIndex: index, status: 'pending', attachments: []
        }));

        const snapshotData = {
            title: template.title, desc: template.desc, category: template.category,
            steps: template.steps, attachments: template.attachments || []
        };

        const newTask = new SOPTask({
            templateId: template._id,
            templateVersion: template.version,
            userId: getUid(req),
            reviewerId: reviewerId || null,
            relatedTaskId: relatedTaskId || null,
            snapshot: snapshotData,
            stepData: initialStepData,
            status: 'in_progress'
        });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 任务详情获取 (严格鉴权)
router.get('/tasks/:id', async (req, res) => {
    try {
        const task = await SOPTask.findById(req.params.id)
            .populate('userId', 'name avatar')
            .populate('reviewerId', 'name')
            .populate('relatedTaskId', 'title progress');
        
        if (!task) return res.status(404).json({ message: '任务不存在' });

        const currentUidStr = String(getUid(req));
        const ownerIdStr = task.userId ? String(task.userId._id) : 'unknown';
        const reviewerIdStr = task.reviewerId ? String(task.reviewerId._id) : null;

        const isOwner = ownerIdStr === currentUidStr;
        const isReviewer = reviewerIdStr === currentUidStr;
        
        let isAdmin = false;
        if (!isOwner && !isReviewer) {
            isAdmin = await checkAdmin(req);
        }

        if (!isOwner && !isReviewer && !isAdmin) {
            return res.status(403).json({ message: '无权查看此任务详情' });
        }

        return res.json(task);

    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/tasks/:id', async (req, res) => { try { await SOPTask.findByIdAndDelete(req.params.id); res.json({ msg: 'Deleted' }); } catch (e) { res.status(500).json(e); } });

router.put('/tasks/:id/step', async (req, res) => {
    try {
        const { stepIndex, content, attachments } = req.body;
        const task = await SOPTask.findById(req.params.id);
        let s = task.stepData.find(x => x.stepIndex === stepIndex);
        if (!s) { task.stepData.push({ stepIndex, status: 'pending', attachments:[] }); s = task.stepData[task.stepData.length-1]; }
        if(content!==undefined) s.content = content;
        if(attachments!==undefined) s.attachments = attachments;
        s.submittedAt = new Date();
        if(s.status === 'rejected') s.status = 'pending';
        if(task.status === 'rejected') task.status = 'in_progress';
        await task.save(); res.json(task);
    } catch (e) { res.status(500).json(e); }
});

router.put('/tasks/:id/submit', async (req, res) => { 
    try { 
        const task = await SOPTask.findById(req.params.id);
        if(task.status === 'completed') return res.status(400).json({message:'任务已归档'});
        task.status = 'submitted';
        await task.save();
        res.json({msg:'ok'}); 
    } catch(e){res.status(500).json(e);} 
});

router.post('/tasks/:id/audit', async (req, res) => {
    try {
        const { action, stepIndex, comment } = req.body;
        const task = await SOPTask.findById(req.params.id);
        const uid = String(getUid(req));

        if (!task.reviewerId) return res.status(403).json({ message: '未指定审核人' });
        if (String(task.reviewerId) !== uid) return res.status(403).json({ message: '权限拒绝' });

        task.auditLogs.push({ action, comment, operatorId: uid, date: new Date() });
        
        if (action === 'reject_step') { 
            const s = task.stepData.find(x=>x.stepIndex===stepIndex); 
            if(s){s.status='rejected';s.rejectReason=comment;} 
            task.status='rejected'; 
        }
        else if (action === 'reject_all') {
            task.status = 'rejected';
        }
        else if (action === 'approve_step') { 
            const s = task.stepData.find(x=>x.stepIndex===stepIndex); 
            if(s){s.status='approved';s.rejectReason='';} 
        }
        else if (action === 'approve_all') { 
            task.status='completed'; 
            task.reviewerId=uid;
            task.stepData.forEach(s=>s.status='approved'); 
        }
        await task.save(); res.json(task);
    } catch(e){res.status(500).json(e);}
});

module.exports = router;