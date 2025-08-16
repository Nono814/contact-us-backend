# 生产环境部署指南

## 项目结构

```
production-deployment-package/
├── nodejs-service/          # Node.js 联系表单和Demo预约服务
│   ├── server.js           # 主服务文件
│   ├── package.json        # 依赖配置
│   ├── package-lock.json   # 锁定版本
│   ├── config.env          # 环境变量配置
│   ├── schema.sql          # 数据库表结构
│   ├── routes/             # API路由
│   ├── services/           # 业务逻辑服务
│   ├── config/             # 配置文件
│   └── public/             # 静态文件
└── python-analytics-service/ # Python 埋点数据采集服务
    ├── app/                # FastAPI应用
    ├── requirements.txt    # Python依赖
    └── .env.template       # 环境变量模板
```

## 部署步骤

### 1. Node.js 服务部署 (端口: 8080)

```bash
cd nodejs-service

# 安装依赖
npm install --production

# 导入数据库表结构 (如果是新部署)
mysql -h dbconn.sealosbja.site -P 43919 -u root -p demo-booking < schema.sql

# 启动服务
npm start
# 或使用 PM2
pm2 start ecosystem.config.js
```

### 2. Python 服务部署 (端口: 8081)

```bash
cd python-analytics-service

# 安装Python依赖
pip install -r requirements.txt

# 创建环境变量文件
cp .env.template .env
# 编辑 .env 文件配置数据库等信息

# 启动服务
uvicorn app.main:app --host 0.0.0.0 --port 8081
```

## 环境变量配置

### Node.js 服务 (config.env)
已包含完整配置，确认以下信息正确：
- 数据库连接信息
- SMTP邮件服务配置  
- 管理员邮箱列表

### Python 服务 (.env)
创建 `.env` 文件，参考以下配置：

```bash
# 数据库配置
DB_HOST=dbconn.sealosbja.site
DB_PORT=43919
DB_USER=root
DB_PASSWORD=qrzk4ts4
DB_NAME=analytics

# 服务配置
PORT=8081
LOG_LEVEL=INFO

# CORS配置 (如需要)
ALLOWED_ORIGINS=["https://daboss.net.cn"]
```

## 重要更新

### CORS 配置已更新
Node.js 服务已添加 `https://daboss.net.cn` 到 CORS 允许列表，解决跨域问题。

### 端口分配
- Node.js 服务: 8080
- Python 服务: 8081

## 健康检查

### Node.js 服务
```bash
curl http://localhost:8080/health
```

### Python 服务
```bash
curl http://localhost:8081/health
```

## 注意事项

1. **数据库**: 两个服务使用相同数据库连接，但不同的数据库名称
2. **邮件服务**: 确保 SMTP 配置正确，测试邮件发送功能
3. **SSL证书**: 生产环境需要配置 HTTPS
4. **防火墙**: 确保端口 8080 和 8081 对外开放
5. **日志**: 建议配置日志轮转和监控

## 联系方式
如有部署问题，请联系开发团队。