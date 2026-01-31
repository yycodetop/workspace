/**
 * Task Routes - Analytics Edition (KPI Ranking & Details)
 */
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

router.use(auth);

// --- Logger ---
const logAction = async (user, targetType, target, action, details) => {
    try {
        await Activity.create({
            actorId: user.id, actorName: user.name, actorAvatar: user.avatar,
            targetType, targetId: target._id, targetName: target.title, projectId: target.projectId,
            action, details
        });
    } catch (e) { console.error("Log Error:", e); }
};

// 1. 获取任务列表
router.get('/', async (req, res) => {
    try {
        let filter = {};
        const canViewAll = req.hasPerm('tasks', 'view_all');
        const queryOwnerId = req.query.ownerId;
        if (!canViewAll) filter = { ownerId: req.userId };
        else if (queryOwnerId && queryOwnerId !== 'all' && queryOwnerId !== 'undefined') filter = { ownerId: queryOwnerId };
        const tasks = await Task.find(filter).sort({ start: 1 });
        res.json(tasks);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. 获取统计数据 (🔥 升级：增加成员排行榜)
router.get('/stats', async (req, res) => {
    try {
        if (!req.hasPerm('tasks', 'view_stats')) return res.status(403).json({ message: '无权查看统计' });
        
        let matchStage = {};
        const canViewAll = req.hasPerm('tasks', 'view_all');
        const queryOwnerId = req.query.ownerId; // 筛选特定人或全员

        // 基础过滤条件
        if (canViewAll) {
            if (queryOwnerId && queryOwnerId !== 'all' && queryOwnerId !== 'undefined') matchStage = { ownerId: queryOwnerId };
        } else { matchStage = { ownerId: req.userId }; }

        const [statusStats, kpiStats, trendStats, rankingsData] = await Promise.all([
            // A. 状态分布
            Task.aggregate([ { $match: matchStage }, { $group: { _id: "$status", count: { $sum: 1 } } } ]),
            
            // B. KPI 总计 (仅统计 done)
            Task.aggregate([ { $match: { ...matchStage, status: 'done' } }, { $group: { _id: null, totalKPI: { $sum: "$kpiValue" }, avgKPI: { $avg: "$kpiValue" }, count: { $sum: 1 } } } ]),
            
            // C. 7日趋势
            Task.aggregate([ { $match: { ...matchStage, status: 'done', end: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$end" } }, dailyKPI: { $sum: "$kpiValue" }, taskCount: { $sum: 1 } } }, { $sort: { _id: 1 } } ]),

            // D. 🔥 成员排行榜 (聚合所有人，即使 dashboard 只选了单人，这里我们也给出一个全局或筛选后的排行)
            Task.aggregate([
                { $match: { status: 'done', ...matchStage } }, // 基于当前筛选范围
                { $group: { 
                    _id: "$ownerId", 
                    totalKPI: { $sum: "$kpiValue" },
                    taskCount: { $sum: 1 }
                }},
                { $sort: { totalKPI: -1 } } // 分数高的在前面
            ])
        ]);

        // 补充用户信息 (Avatar, Name) - 避免 Task 里的 ownerName 过期
        const userIds = rankingsData.map(r => r._id);
        const users = await User.find({ _id: { $in: userIds } }, 'name avatar');
        const userMap = {};
        users.forEach(u => userMap[u._id.toString()] = u);

        const enrichedRankings = rankingsData.map(r => ({
            id: r._id,
            name: userMap[r._id]?.name || 'Unknown',
            avatar: userMap[r._id]?.avatar || '',
            totalKPI: r.totalKPI,
            taskCount: r.taskCount
        }));

        res.json({
            statusDistribution: statusStats,
            kpi: kpiStats[0] || { totalKPI: 0, avgKPI: 0, count: 0 },
            trend: trendStats,
            rankings: enrichedRankings // 🔥 返回排行榜
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 🔥 2.1 获取特定成员的 KPI 贡献详情 (钻取)
router.get('/stats/details/:userId', async (req, res) => {
    try {
        if (!req.hasPerm('tasks', 'view_stats')) return res.status(403).json({ message: '无权查看' });
        
        // 查询该用户所有已完成的任务，按 KPI 高低排序
        const tasks = await Task.find({ 
            ownerId: req.params.userId, 
            status: 'done' 
        }).select('title kpiValue end projectId').sort({ kpiValue: -1, end: -1 });

        const user = await User.findById(req.params.userId, 'name avatar');

        res.json({
            user,
            tasks
        });
    } catch(err) { res.status(500).json({ message: err.message }); }
});

// 3. 创建任务
router.post('/', async (req, res) => {
    try {
        if (!req.hasPerm('tasks', 'create')) return res.status(403).json({ message: '无权发布' });
        const { id, name } = req.user;
        let targetOwnerId = id; let targetOwnerName = name;
        if (req.hasPerm('tasks', 'assign') && req.body.ownerId) { targetOwnerId = req.body.ownerId; targetOwnerName = req.body.ownerName || 'Unknown'; }
        const initialLog = { progress: req.body.progress || 0, note: '任务创建', operator: name, timestamp: new Date() };
        const task = new Task({ ...req.body, ownerId: targetOwnerId, ownerName: targetOwnerName, progressLogs: [initialLog] });
        const newTask = await task.save();
        const detailText = targetOwnerId === id ? "创建并认领了任务" : `创建并指派给 ${targetOwnerName}`;
        await logAction(req.user, 'task', newTask, '创建任务', detailText);
        res.status(201).json(newTask);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// 4. 修改任务
router.put('/:id', async (req, res) => {
    try {
        if (!req.hasPerm('tasks', 'edit')) return res.status(403).json({ message: '无权编辑' });
        const oldTask = await Task.findById(req.params.id);
        if (!oldTask) return res.status(404).json({ message: '任务不存在' });

        const hasGlobalEdit = req.hasPerm('tasks', 'edit_all');
        const isOwner = oldTask.ownerId.toString() === req.userId;
        if (!hasGlobalEdit && !isOwner) return res.status(403).json({ message: '只能编辑自己的任务' });

        const { newLog, progressLogs, ...updateFields } = req.body;

        let updateOp = { $set: updateFields };
        if (newLog) {
            newLog.operator = req.user.name;
            newLog.timestamp = new Date();
            updateOp.$push = { progressLogs: newLog };
        }

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, updateOp, { new: true });

        const changes = [];
        if (updateFields.status && updateFields.status !== oldTask.status) changes.push(`状态: ${oldTask.status} -> ${updateFields.status}`);
        if (updateFields.progress !== undefined && updateFields.progress !== oldTask.progress) changes.push(`进度: ${oldTask.progress}% -> ${updateFields.progress}%`);
        if (updateFields.ownerId && updateFields.ownerId !== oldTask.ownerId) changes.push(`指派变更`);
        
        if (changes.length > 0 || newLog) {
            const action = newLog ? '更新进度' : '修改任务';
            const details = newLog ? newLog.note : changes.join('; ');
            await logAction(req.user, 'task', updatedTask, action, details);
        }
        res.json(updatedTask);
    } catch (err) { console.error("Update Error:", err); res.status(400).json({ message: err.message }); }
});

// 5. 删除日志
router.delete('/:id/logs/:logId', async (req, res) => {
    try {
        if (!req.hasPerm('tasks', 'edit')) return res.status(403).json({ message: '无权操作' });
        const task = await Task.findByIdAndUpdate(req.params.id, { $pull: { progressLogs: { _id: req.params.logId } } }, { new: true });
        if(task) await logAction(req.user, 'task', task, '删除日志', '删除了一条进度追踪记录');
        res.json(task);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 6. 删除任务
router.delete('/:id', async (req, res) => {
    try {
        if (!req.hasPerm('tasks', 'delete')) return res.status(403).json({ message: '无权删除' });
        const task = await Task.findOneAndDelete({ _id: req.params.id });
        if (task) await logAction(req.user, 'task', task, '删除任务', `删除了任务: ${task.title}`);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 7. 获取成员
router.get('/members', async (req, res) => {
    try {
        const users = await User.find({ isActive: true }, 'name username _id avatar');
        res.json(users);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;