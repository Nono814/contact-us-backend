const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: './config.env' });

const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const demoBookingRoutes = require('./routes/demoBooking');
const { initDatabase } = require('./config/database');
const { verifyEmailConfig } = require('./services/emailNotification');

const app = express();
const PORT = process.env.PORT || 8080;

// 信任代理设置（解决 X-Forwarded-For 警告）
app.set('trust proxy', true);

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://yoursite.com',
    'https://qhdcfzhshdux.sealosbja.site',
    'https://daboss.net.cn'
  ],
  credentials: true
}));

// 请求频率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  },
  // 精确配置trust proxy，只信任来自Nginx的请求
  trustProxy: (ip) => {
    // 信任本地回环地址和私有网络地址（Nginx通常在同一网络）
    return ip === '127.0.0.1' || ip === '::1' || 
           ip.startsWith('10.') || 
           ip.startsWith('172.16.') || 
           ip.startsWith('192.168.') ||
           ip.startsWith('::ffff:127.0.0.1');
  },
  // 使用自定义键生成器获取真实IP
  keyGenerator: (req) => {
    // 从Nginx转发的头部获取真实IP
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    
    if (forwarded) {
      // X-Forwarded-For 可能包含多个IP，取第一个
      return forwarded.split(',')[0].trim();
    }
    
    if (realIp) {
      return realIp.trim();
    }
    
    // 降级到连接IP
    return req.connection.remoteAddress || req.socket.remoteAddress || req.ip;
  }
});
app.use('/api/', limiter);

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use(express.static('public'));

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Contact Form API'
  });
});

// API路由
app.use('/api', contactRoutes);
app.use('/api', demoBookingRoutes);
app.use('/api/admin', adminRoutes);

// 管理后台界面
app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/public/admin.html');
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在'
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Failed to process contact form submission'
  });
});

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库连接
    await initDatabase();
    
    // 验证邮件服务配置
    await verifyEmailConfig();
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`健康检查: http://localhost:${PORT}/health`);
      console.log(`管理后台: http://localhost:${PORT}/admin`);
    });
    
    // 设置超时时间
    server.timeout = 30000;
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

startServer(); 