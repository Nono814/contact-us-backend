# 🚀 云服务器部署指南

## 概述
本指南将帮助你将 Contact Form API 部署到云服务器上。

## 前置要求

### 1. 服务器要求
- **操作系统**: Ubuntu 20.04+ 或 CentOS 8+
- **内存**: 最少 1GB RAM
- **存储**: 最少 10GB 可用空间
- **网络**: 公网 IP 地址

### 2. 域名和SSL证书
- 域名（可选，但推荐）
- SSL证书（可使用 Let's Encrypt 免费证书）

## 部署步骤

### 第一步：服务器环境准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version

# 安装 PM2
sudo npm install -g pm2

# 安装 Nginx
sudo apt install nginx -y

# 安装防火墙
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
```

### 第二步：代码部署

```bash
# 克隆项目
git clone <你的仓库地址>
cd project

# 设置执行权限
chmod +x deploy-production.sh

# 运行部署脚本
./deploy-production.sh
```

### 第三步：配置 Nginx

```bash
# 备份默认配置
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# 复制我们的配置
sudo cp nginx.conf /etc/nginx/sites-available/contact-api

# 创建软链接
sudo ln -s /etc/nginx/sites-available/contact-api /etc/nginx/sites-enabled/

# 删除默认配置
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 第四步：SSL证书配置（可选）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com

# 设置自动续期
sudo crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 第五步：监控和日志

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs contact-form-api

# 监控资源使用
pm2 monit

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/contact-api-access.log
sudo tail -f /var/log/nginx/contact-api-error.log
```

## 环境变量配置

确保 `config.production.env` 文件包含正确的配置：

```env
# 数据库配置
DB_HOST=dbconn.sealosbja.site
DB_PORT=43919
DB_USER=root
DB_PASSWORD=qrzk4ts4
DB_NAME=get in touch

# 服务器配置
PORT=8080
NODE_ENV=production

# 邮件通知配置
SMTP_USER=18264190169@163.com
SMTP_PASS=XUnRzEm8M89jcfQe
ADMIN_EMAILS=18264190169@163.com,zzw814@163.com
```

## 常用管理命令

### PM2 管理
```bash
# 重启应用
pm2 restart contact-form-api

# 停止应用
pm2 stop contact-form-api

# 查看详细信息
pm2 show contact-form-api

# 查看日志
pm2 logs contact-form-api --lines 100
```

### Nginx 管理
```bash
# 重启 Nginx
sudo systemctl restart nginx

# 查看状态
sudo systemctl status nginx

# 重新加载配置
sudo nginx -s reload
```

## 故障排除

### 1. 应用无法启动
```bash
# 检查日志
pm2 logs contact-form-api

# 检查端口占用
sudo netstat -tlnp | grep :8080

# 检查环境变量
pm2 env contact-form-api
```

### 2. 数据库连接失败
```bash
# 测试数据库连接
mysql -h dbconn.sealosbja.site -P 43919 -u root -p

# 检查防火墙
sudo ufw status
```

### 3. Nginx 配置错误
```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

## 安全建议

1. **定期更新系统**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **配置防火墙**
   ```bash
   sudo ufw enable
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw allow 80
   sudo ufw allow 443
   ```

3. **定期备份**
   ```bash
   # 备份数据库
   mysqldump -h dbconn.sealosbja.site -P 43919 -u root -p get\ in\ touch > backup.sql

   # 备份应用代码
   tar -czf app-backup-$(date +%Y%m%d).tar.gz /path/to/your/app
   ```

4. **监控系统资源**
   ```bash
   # 安装监控工具
   sudo apt install htop -y
   htop
   ```

## 性能优化

1. **启用 Nginx 缓存**
2. **配置 PM2 集群模式**
3. **使用 CDN 加速静态资源**
4. **定期清理日志文件**

## 联系支持

如果遇到问题，请检查：
1. 应用日志：`pm2 logs contact-form-api`
2. Nginx 日志：`sudo tail -f /var/log/nginx/contact-api-error.log`
3. 系统日志：`sudo journalctl -u nginx` 