# 环境变量配置清单

## Node.js 服务环境变量 (config.env)

### 数据库配置
```bash
DB_HOST=dbconn.sealosbja.site
DB_PORT=43919
DB_USER=root
DB_PASSWORD=qrzk4ts4
DB_NAME=demo-booking
```

### 服务配置
```bash
PORT=8080
NODE_ENV=production
```

### 邮件服务配置
```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contact@daboss.ai
SMTP_PASS=TuPu123456
```

### 通知邮箱配置
```bash
ADMIN_EMAILS=18264190169@163.com,zzw814@163.com,aiden328877@gmail.com
DEMO_NOTIFICATION_EMAIL=18264190169@163.com,zzw814@163.com,aiden328877@gmail.com
```

## Python 服务环境变量 (.env)

### 服务配置
```bash
APP_NAME=analytics-ingest-service
LOG_LEVEL=INFO
PORT=8081
```

### CORS配置
```bash
ALLOWED_ORIGINS=["https://daboss.net.cn"]
```

### 数据库配置
```bash
DB_HOST=dbconn.sealosbja.site
DB_PORT=43919
DB_USER=root
DB_PASSWORD=qrzk4ts4
DB_NAME=analytics
DB_MIN_POOL_SIZE=1
DB_MAX_POOL_SIZE=10
```

### 数据处理限制
```bash
MAX_BATCH_EVENTS=50
MAX_REQUEST_BYTES=204800
```

## 部署说明

1. **Node.js服务**: 直接使用 `config.env` 文件
2. **Python服务**: 复制 `.env.template` 为 `.env` 并根据需要修改
3. **重要**: Python服务大部分配置有默认值，但建议在生产环境明确配置所有参数