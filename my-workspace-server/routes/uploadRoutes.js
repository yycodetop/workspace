const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. 存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 确保指向前端的 uploads 目录
    const uploadPath = path.join(__dirname, '../../My-tools-web/uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名 (保留原始后缀)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // 注意：这里的 file.originalname 可能已经是乱码了，但我们只取后缀，通常没问题
    const ext = path.extname(file.originalname); 
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 扩容到 100MB
});

// === API 1: 上传文件 ===
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: '请选择文件' });

    // 🔥🔥🔥 核心修复：解决中文文件名乱码问题
    // 将 latin1 编码的字符串还原为 Buffer，再用 utf8 重新解码
    let originalName = req.file.originalname;
    try {
        originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    } catch (e) {
        console.warn('文件名转码失败，使用原始值', e);
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: '上传成功',
      url: fileUrl,
      originalName: originalName, // 返回修复后的中文名
      size: req.file.size
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// === API 2: 下载文件 (修复下载时的文件名) ===
// 前端请求示例: /api/upload/download?url=/uploads/xxx.pdf&name=测试文档.pdf
router.get('/download', (req, res) => {
    try {
        const { url, name } = req.query;
        if (!url || !name) return res.status(400).send('缺少参数');

        // 从 URL 中提取真实的物理文件名 (例如 173824...pdf)
        const physicalFilename = path.basename(url);
        const filePath = path.join(__dirname, '../../My-tools-web/uploads', physicalFilename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).send('文件未找到');
        }

        // 🔥 设置响应头，强制浏览器以正确的中文名下载
        // RFC 5987 标准: filename*=UTF-8''xxxx
        const encodedName = encodeURIComponent(name);
        
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedName}`);
        
        // 流式发送文件
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);

    } catch (e) {
        console.error(e);
        res.status(500).send('下载出错');
    }
});

module.exports = router;