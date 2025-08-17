# 环境变量配置说明

## 概述

本应用已完全移除对 `.env` 文件的依赖，现在只从进程环境变量 (process.env) 中读取配置。这符合生产环境的最佳实践，实现了配置与代码的完全分离。

## 环境变量列表

### 必需的环境变量

#### 数据库配置
```bash
DB_HOST=dbconn.sealosbja.site     # 数据库主机地址
DB_PORT=43919                     # 数据库端口
DB_USER=root                      # 数据库用户名
DB_PASSWORD=qrzk4ts4              # 数据库密码
DB_NAME="get in touch"            # 数据库名称
```

#### 邮件服务配置
```bash
SMTP_HOST=smtp.163.com            # SMTP服务器地址
SMTP_PORT=465                     # SMTP端口
SMTP_SECURE=true                  # 是否使用SSL
SMTP_USER=18264190169@163.com     # 发送邮箱
SMTP_PASS=XUnRzEm8M89jcfQe        # 邮箱密码/授权码
```

#### 邮件通知配置
```bash
ADMIN_EMAILS="18264190169@163.com,zzw814@163.com,aiden328877@gmail.com"
DEMO_NOTIFICATION_EMAIL="18264190169@163.com,zzw814@163.com,aiden328877@gmail.com"
```

### 可选的环境变量

#### 服务器配置
```bash
PORT=8080                         # 服务端口 (默认: 8080)
NODE_ENV=production               # 运行环境 (默认: development)
```

#### 安全配置
```bash
TRUST_PROXY=true                  # 是否信任代理 (默认: false)
DB_SSL=false                      # 数据库是否使用SSL (默认: false)
```

## 部署方式

### 1. 使用 PM2 (推荐)

创建 `ecosystem.config.js` 文件：

```javascript
module.exports = {
  apps: [{
    name: 'officialwebbackend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    env: {
      "DB_HOST": "dbconn.sealosbja.site",
      "DB_PORT": "43919",
      "DB_USER": "root",
      "DB_PASSWORD": "qrzk4ts4",
      "DB_NAME": "get in touch",
      "PORT": "8080",
      "NODE_ENV": "production",
      "SMTP_HOST": "smtp.163.com",
      "SMTP_PORT": "465",
      "SMTP_SECURE": "true",
      "SMTP_USER": "18264190169@163.com",
      "SMTP_PASS": "XUnRzEm8M89jcfQe",
      "ADMIN_EMAILS": "18264190169@163.com,zzw814@163.com,aiden328877@gmail.com",
      "DEMO_NOTIFICATION_EMAIL": "18264190169@163.com,zzw814@163.com,aiden328877@gmail.com",
      "TRUST_PROXY": "true"
    }
  }]
};
```

启动命令：
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. 使用 Systemd

创建 `/etc/systemd/system/officialwebbackend.service` 文件：

```ini
[Unit]
Description=Official Web Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/app
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

# 环境变量
Environment=DB_HOST=dbconn.sealosbja.site
Environment=DB_PORT=43919
Environment=DB_USER=root
Environment=DB_PASSWORD=qrzk4ts4
Environment=DB_NAME="get in touch"
Environment=PORT=8080
Environment=NODE_ENV=production
Environment=SMTP_HOST=smtp.163.com
Environment=SMTP_PORT=465
Environment=SMTP_SECURE=true
Environment=SMTP_USER=18264190169@163.com
Environment=SMTP_PASS=XUnRzEm8M89jcfQe
Environment=ADMIN_EMAILS="18264190169@163.com,zzw814@163.com,aiden328877@gmail.com"
Environment=DEMO_NOTIFICATION_EMAIL="18264190169@163.com,zzw814@163.com,aiden328877@gmail.com"
Environment=TRUST_PROXY=true

[Install]
WantedBy=multi-user.target
```

启动命令：
```bash
sudo systemctl daemon-reload
sudo systemctl enable officialwebbackend
sudo systemctl start officialwebbackend
```

### 3. 直接使用环境变量启动

```bash
DB_HOST=dbconn.sealosbja.site \
DB_PORT=43919 \
DB_USER=root \
DB_PASSWORD=qrzk4ts4 \
DB_NAME="get in touch" \
SMTP_HOST=smtp.163.com \
SMTP_PORT=465 \
SMTP_SECURE=true \
SMTP_USER=18264190169@163.com \
SMTP_PASS=XUnRzEm8M89jcfQe \
ADMIN_EMAILS="18264190169@163.com,zzw814@163.com,aiden328877@gmail.com" \
DEMO_NOTIFICATION_EMAIL="18264190169@163.com,zzw814@163.com,aiden328877@gmail.com" \
PORT=8080 \
NODE_ENV=production \
node server.js
```

## 默认值说明

应用为所有配置项都设置了合理的默认值，确保在环境变量缺失时不会崩溃：

- **数据库**: 默认连接 localhost:3306，数据库名 'get_in_touch'
- **邮件**: 默认使用163邮箱配置
- **端口**: 默认 8080
- **环境**: 默认 development

## 验证配置

启动应用后，可以通过以下方式验证配置：

1. **健康检查**: `curl http://localhost:8080/health`
2. **管理后台**: `http://localhost:8080/admin`
3. **API测试**: 使用提供的测试脚本

## 安全建议

1. **生产环境**: 确保所有敏感信息（密码、密钥）通过环境变量传递，不要硬编码
2. **权限控制**: 限制对配置文件的访问权限
3. **日志安全**: 确保环境变量不会被记录到日志中
4. **定期更新**: 定期更换数据库密码和邮箱授权码

## 故障排除

如果应用无法启动，请检查：

1. **环境变量**: 确保所有必需的环境变量都已设置
2. **数据库连接**: 验证数据库服务是否可访问
3. **邮件配置**: 验证SMTP服务器配置是否正确
4. **端口占用**: 确保指定端口未被占用

## 迁移说明

从旧版本（使用 .env 文件）迁移到新版本：

1. **移除文件**: 删除或重命名 `config.env`、`config.production.env` 等文件
2. **更新部署**: 使用上述任一种方式配置环境变量
3. **验证功能**: 确保所有功能正常工作
4. **清理依赖**: 运行 `npm install` 更新依赖（已移除 dotenv）

---

**注意**: 本次修改确保了应用完全依赖环境变量，符合 12-Factor App 原则和生产环境最佳实践。
