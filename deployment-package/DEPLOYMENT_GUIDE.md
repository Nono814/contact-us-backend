# 后端项目部署指南

## 📋 项目概述

这是一个包含Demo预约表单和埋点采集的完整后端系统，包含两个独立的服务：

1. **主后端服务** (Node.js Express) - 处理Demo预约、Contact Us表单和邮件通知
2. **埋点采集服务** (Python FastAPI) - 处理用户行为分析数据

## 🏗️ 系统架构

```
├── Node.js Express 服务 (端口8080)
│   ├── Demo预约API (/api/demo-booking)
│   ├── Contact US API (/api/contact)
│   ├── 管理后台 (/admin)
│   └── 邮件通知服务
│
├── Python FastAPI 服务 (端口8080)
│   ├── 埋点数据采集 (/api/analytics/track)
│   ├── 批量事件处理 (/api/analytics/track/batch)
│   └── 健康检查 (/healthz)
│
└── MySQL数据库
    ├── demo-booking schema (Demo预约和Contact数据)
    └── analytics schema (埋点数据)
```

## 🚀 快速部署

### 方案1：Docker部署 (推荐)

1. **构建并启动所有服务**:
   ```bash
   docker-compose up -d
   ```

2. **验证部署**:
   ```bash
   # 检查Node.js服务
   curl http://localhost:8080/health
   
   # 检查埋点服务
   curl http://localhost:8080/healthz
   ```

### 方案2：传统部署

#### Node.js服务部署

1. **安装依赖**:
   ```bash
   npm install
   ```

2. **配置环境变量** (见配置章节)

3. **启动服务**:
   ```bash
   # 开发环境
   npm run dev
   
   # 生产环境
   npm start
   
   # 使用PM2 (推荐)
   pm2 start ecosystem.config.js
   ```

#### Python埋点服务部署

1. **创建虚拟环境**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # 或 venv\Scripts\activate  # Windows
   ```

2. **安装依赖**:
   ```bash
   pip install -r requirements.txt
   ```

3. **启动服务**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8080
   ```

## ⚙️ 配置说明

### 环境变量配置

创建 `config.env` 文件：

```env
# 数据库配置
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=demo-booking
PORT=8080
NODE_ENV=production

# 邮件服务配置
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contact@daboss.ai
SMTP_PASS=your-email-password

# 邮件通知收件人
ADMIN_EMAILS=admin1@company.com,admin2@company.com
DEMO_NOTIFICATION_EMAIL=demo@company.com
```

### 数据库初始化

1. **创建数据库**:
   ```sql
   CREATE DATABASE `demo-booking`;
   CREATE DATABASE `analytics`;
   ```

2. **导入表结构**:
   ```bash
   mysql -u username -p demo-booking < schema.sql
   ```

## 🌐 Nginx配置

如果使用Nginx作为反向代理：

```nginx
upstream backend {
    server 127.0.0.1:8080;
}

server {
    listen 80;
    server_name your-domain.com;

    # 主要API路由
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 管理后台
    location /admin {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 健康检查
    location /health {
        proxy_pass http://backend;
    }
}
```

## 🧪 部署验证

### 1. 运行验证脚本
```bash
chmod +x verify_deployment.sh
./verify_deployment.sh
```

### 2. API功能测试
```bash
# 测试Demo预约API
node test_demo_booking_api.js

# 测试埋点API
curl -X POST http://localhost:8080/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"eventName":"test","eventId":"'$(uuidgen)'","timestamp":"'$(date -Iseconds)'"}'
```

### 3. 手动验证

- **健康检查**: `GET /health` 和 `GET /healthz`
- **管理后台**: 访问 `http://your-domain/admin`
- **Demo预约**: 提交测试表单
- **邮件通知**: 检查邮件是否正常接收

## 📊 监控建议

### 1. 应用监控
- **PM2监控**: `pm2 monit`
- **日志监控**: `pm2 logs`
- **进程状态**: `pm2 status`

### 2. 数据库监控
- 连接数监控
- 慢查询日志
- 存储空间监控

### 3. 关键指标
- API响应时间
- 错误率统计
- 邮件发送成功率
- 埋点数据写入量

## 🔒 安全配置

### 1. 环境变量保护
- 使用环境变量管理敏感信息
- 不要将密码提交到版本控制

### 2. 网络安全
- 启用HTTPS
- 配置防火墙规则
- 限制数据库访问

### 3. 应用安全
- 启用频率限制
- 输入数据验证
- SQL注入防护

## 📁 文件结构说明

```
deployment-package/
├── README.md                           # 本文档
├── DEMO_BOOKING_DEPLOYMENT.md          # Demo预约详细部署说明
├── BOOK_DEMO_ANALYTICS_EVENTS.md       # 埋点事件文档
├── 埋点采集服务-运维部署手册.md        # 埋点服务部署手册
│
├── package.json                        # Node.js依赖
├── requirements.txt                    # Python依赖
├── server.js                          # Node.js主入口
├── ecosystem.config.js                # PM2配置
├── docker-compose.yml                 # Docker编排
├── Dockerfile                         # Docker镜像构建
├── nginx.conf                         # Nginx配置示例
├── schema.sql                         # 数据库表结构
│
├── app/                               # Python FastAPI应用
│   ├── main.py                        # FastAPI入口
│   ├── routers/                       # API路由
│   ├── schemas/                       # 数据模型
│   └── services/                      # 业务逻辑
│
├── routes/                            # Node.js路由
│   ├── demoBooking.js                 # Demo预约API
│   ├── contact.js                     # Contact Us API
│   └── admin.js                       # 管理后台API
│
├── services/                          # Node.js服务
│   └── emailNotification.js           # 邮件服务
│
├── config/                            # 配置文件
│   └── database.js                    # 数据库配置
│
├── public/                            # 静态文件
│   ├── admin.html                     # 管理后台页面
│   └── ...
│
├── test_demo_booking_api.js           # API测试脚本
├── verify_deployment.sh               # 部署验证脚本
├── demo-analytics-integration.js     # 前端埋点集成代码
└── demo-booking-page-example.html    # 页面示例
```

## 🆘 故障排除

### 常见问题

1. **端口冲突**
   - 检查8080端口是否被占用
   - 修改配置文件中的端口设置

2. **数据库连接失败**
   - 验证数据库连接参数
   - 检查数据库服务状态
   - 确认网络连通性

3. **邮件发送失败**
   - 检查SMTP服务器配置
   - 验证邮箱密码或应用专用密码
   - 查看邮件服务日志

4. **权限问题**
   - 确保脚本有执行权限: `chmod +x *.sh`
   - 检查文件所有者和权限

### 日志位置

- **PM2日志**: `~/.pm2/logs/`
- **应用日志**: `server.log`
- **Docker日志**: `docker logs <container-name>`

## 📞 技术支持

如有部署问题，请提供以下信息：
- 操作系统版本
- Node.js和Python版本
- 错误日志
- 配置文件内容（隐藏敏感信息）

---

## 🎯 部署检查清单

- [ ] 服务器环境准备 (Node.js 16+, Python 3.11+)
- [ ] 数据库创建和表结构导入
- [ ] 环境变量配置
- [ ] 依赖安装 (npm install, pip install)
- [ ] 防火墙端口开放
- [ ] Nginx配置 (如需要)
- [ ] SSL证书配置 (如需要)
- [ ] 服务启动
- [ ] 健康检查验证
- [ ] API功能测试
- [ ] 邮件通知测试
- [ ] 埋点功能测试
- [ ] 监控配置
- [ ] 备份策略制定

**祝您部署顺利！** 🚀