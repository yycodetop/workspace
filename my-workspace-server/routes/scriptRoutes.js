const express = require('express');
const router = express.Router();
const Script = require('../models/Script');
const auth = require('../middleware/auth');

router.use(auth);

const getUid = (req) => req.user?.id || req.userId;

// 1. 获取列表 (返回分类数据：我的 + 团队共享)
router.get('/', async (req, res) => {
    try {
        const uid = getUid(req);
        
        // 我的课件
        const myScripts = await Script.find({ userId: uid })
            .select('title lastModified content isShared scrollSpeed')
            .sort({ lastModified: -1 });

        // 团队共享课件 (排除我自己的)
        const sharedScripts = await Script.find({ userId: { $ne: uid }, isShared: true })
            .populate('userId', 'name avatar') // 获取作者信息
            .select('title lastModified content userId isShared')
            .sort({ lastModified: -1 });

        res.json({ myScripts, sharedScripts });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. 获取详情 (权限检查)
router.get('/:id', async (req, res) => {
    try {
        const uid = getUid(req);
        const script = await Script.findById(req.params.id);
        
        if (!script) return res.status(404).json({ message: 'Script not found' });
        
        // 权限：我是作者 OR 课件已共享
        if (script.userId.toString() !== uid && !script.isShared) {
            return res.status(403).json({ message: '无权访问私有课件' });
        }
        
        res.json(script);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 3. 保存/更新
router.post('/', async (req, res) => {
    try {
        const uid = getUid(req);
        const { _id, title, content, notes, overrides, lineOrder, isShared, scrollSpeed, fontSize, contentWidth } = req.body;
        
        let script;
        if (_id) {
            script = await Script.findById(_id);
            if (!script) return res.status(404).json({ message: 'Not found' });

            // 权限：我是作者 OR (课件已共享 且 需求允许协作修改)
            if (script.userId.toString() !== uid && !script.isShared) {
                return res.status(403).json({ message: '无权修改' });
            }

            // 更新字段
            script.title = title;
            if(content) script.content = content;
            script.notes = notes;
            script.overrides = overrides;
            script.lineOrder = lineOrder;
            script.lastModified = Date.now();
            
            // 界面设置更新
            if(scrollSpeed) script.scrollSpeed = scrollSpeed;
            if(fontSize) script.fontSize = fontSize;
            if(contentWidth) script.contentWidth = contentWidth;

            // 只有作者可以更改共享状态 (防止他人恶意取消共享)
            if (script.userId.toString() === uid && isShared !== undefined) {
                script.isShared = isShared;
            }

            await script.save();
        } else {
            // 新建
            script = new Script({
                userId: uid,
                title, content, notes, overrides, lineOrder,
                isShared: isShared || false,
                scrollSpeed: scrollSpeed || 3.5,
                fontSize: fontSize || 46,
                contentWidth: contentWidth || 85
            });
            await script.save();
        }
        res.json(script);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// 4. 删除 (仅限作者)
router.delete('/:id', async (req, res) => {
    try {
        const uid = getUid(req);
        const script = await Script.findById(req.params.id);
        if(!script) return res.status(404).json({ message: 'Not found' });
        
        if (script.userId.toString() !== uid) {
            return res.status(403).json({ message: '只有作者可以删除课件' });
        }
        
        await Script.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;