const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

router.use(auth);

// 辅助日志函数
const logAction = async (user, target, action, details) => {
    try {
        await Activity.create({
            actorId: user.id, actorName: user.name, actorAvatar: user.avatar,
            targetType: 'project', targetId: target._id, targetName: target.title,
            action, details
        });
    } catch(e) { console.error(e); }
};

// 1. 获取项目 (不变)
router.get('/', async (req, res) => {
    try {
        const canViewAll = req.hasPerm('tasks', 'view_all');
        let matchStage = canViewAll ? {} : { $or: [{ ownerId: req.userId }, { members: req.userId }] };
        const projects = await Project.aggregate([
            { $match: matchStage },
            { $lookup: { from: 'tasks', localField: '_id', foreignField: 'projectId', as: 'tasks' } },
            { $addFields: { 
                totalTasks: { $size: "$tasks" }, 
                doneTasks: { $size: { $filter: { input: "$tasks", as: "t", cond: { $eq: ["$$t.status", "done"] } } } },
                calculatedProgress: { $cond: [{ $eq: ["$totalTasks", 0] }, 0, { $multiply: [{ $divide: ["$doneTasks", "$totalTasks"] }, 100] }] }
            }},
            { $sort: { createdAt: -1 } }
        ]);
        res.json(projects);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. 统计 (不变)
router.get('/:id/stats', async (req, res) => {
    try {
        if (!req.hasPerm('tasks', 'view_stats')) return res.status(403).json({ message: '无权' });
        const projectId = req.params.id;
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: '无项目' });
        
        const doneTasks = await Task.find({ projectId: projectId, status: 'done' });
        const membersList = project.members || [];
        const allUserIds = [...new Set([project.ownerId, ...membersList.map(id=>id.toString()), ...doneTasks.map(t=>t.ownerId)])];
        const usersInfo = await User.find({ _id: { $in: allUserIds } }, 'name avatar');
        const userMap = {}; usersInfo.forEach(u => userMap[u._id.toString()] = u);
        
        const statsMap = {};
        allUserIds.forEach(uid => { const u=userMap[uid]; if(u) statsMap[uid] = { id:uid, name:u.name, avatar:u.avatar||'', role:(uid===project.ownerId)?'Owner':'Member', totalKPI:0, tasks:[] }; });
        doneTasks.forEach(task => { if(statsMap[task.ownerId]) { statsMap[task.ownerId].totalKPI+=(task.kpiValue||0); statsMap[task.ownerId].tasks.push({title:task.title, kpi:task.kpiValue}); } });
        
        res.json({ project: { title: project.title, ownerName: project.ownerName }, stats: Object.values(statsMap).sort((a,b)=>b.totalKPI-a.totalKPI) });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 3. 创建项目 (🔥 日志)
router.post('/', async (req, res) => {
    try {
        if (!req.hasPerm('projects', 'create')) return res.status(403).json({ message: '无权创建' });
        const { title, desc, start, end, members, ownerId } = req.body;
        let targetOwnerId = ownerId || req.user.id;
        let targetOwnerName = req.user.name;
        if (targetOwnerId !== req.user.id) { const u = await User.findById(targetOwnerId); if(u) targetOwnerName=u.name; }
        
        const newProject = new Project({ title, desc, start, end, members: members || [], ownerId: targetOwnerId, ownerName: targetOwnerName });
        await newProject.save();
        
        // Log
        await logAction(req.user, newProject, '创建项目', `项目负责人: ${targetOwnerName}`);
        res.status(201).json(newProject);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// 4. 修改项目 (🔥 日志)
router.put('/:id', async (req, res) => {
    try {
        if (!req.hasPerm('projects', 'edit')) return res.status(403).json({ message: '无权编辑' });
        const oldProj = await Project.findById(req.params.id);
        
        if (req.body.ownerId) { const u = await User.findById(req.body.ownerId); if(u) req.body.ownerName=u.name; }
        const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        // Simple log for project update
        await logAction(req.user, updated, '更新项目', `修改了项目信息`);
        res.json(updated);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// 5. 删除项目 (🔥 日志)
router.delete('/:id', async (req, res) => {
    try {
        if (!req.hasPerm('projects', 'delete')) return res.status(403).json({ message: '无权删除' });
        const p = await Project.findByIdAndDelete(req.params.id);
        await Task.updateMany({ projectId: req.params.id }, { $set: { projectId: null } });
        
        if(p) await logAction(req.user, p, '删除项目', `删除了项目及其关联`);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;