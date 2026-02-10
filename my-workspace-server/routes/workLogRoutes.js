// my-workspace-server/routes/workLogRoutes.js
const express = require('express');
const router = express.Router();
const WorkLog = require('../models/WorkLog');
const auth = require('../middleware/auth');
//const moment = require('moment'); // 如果没有moment，可以用原生Date处理，这里建议用 moment 或 dayjs

router.use(auth);

// 获取日志流 (支持分页或按日期范围)
router.get('/', async (req, res) => {
  try {
    const { days = 7 } = req.query; // 默认获取最近7天
    // 简单的权限控制：管理员看所有，普通人看自己 (或者您可以改为全员公开)
    // 这里假设默认全员公开，促进透明协作
    const query = {}; 
    
    const logs = await WorkLog.find(query)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(100); // 限制数量防止卡顿

    // 按日期分组逻辑交由前端处理，后端只给流数据
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 发布日志
router.post('/', async (req, res) => {
  try {
    const { content, tags } = req.body;
    
    // 简单的标签提取逻辑 (如果前端没传tags，后端也可以正则提取)
    const extractedTags = tags || (content.match(/#[^\s]+/g) || []);

    const log = new WorkLog({
      user: req.user.id,
      content,
      tags: extractedTags,
      dateStr: new Date().toISOString().split('T')[0] // 简单生成 YYYY-MM-DD
    });

    await log.save();
    // 填充用户信息后返回，方便前端直接显示
    await log.populate('user', 'name avatar');
    
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 删除日志 (仅限本人或管理员)
router.delete('/:id', async (req, res) => {
  try {
    const log = await WorkLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });

    if (log.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权删除' });
    }

    await log.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;