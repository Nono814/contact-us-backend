# 后端项目部署包

## 📦 包含内容

- **Demo预约表单API** - 完整的表单处理和邮件通知
- **Contact Us API** - 联系表单处理  
- **埋点采集服务** - 用户行为分析数据收集
- **管理后台** - 数据查看和管理界面

## 🚀 快速部署

### 方式一：自动部署（推荐）

```bash
# 1. 解压部署包
unzip backend-deployment-package.zip
cd deployment-package

# 2. 配置环境变量
cp config.env.template config.env
vim config.env  # 编辑配置

# 3. 运行自动部署脚本
./deploy.sh
```

### 方式二：Docker部署

```bash
# 1. 配置环境变量
cp config.env.template config.env
vim config.env

# 2. 启动服务
docker-compose up -d

# 3. 验证部署
curl http://localhost:8080/health
```

### 方式三：手动部署

```bash
# 1. 安装依赖
npm install
pip install -r requirements.txt

# 2. 配置环境变量
cp config.env.template config.env
vim config.env

# 3. 初始化数据库
mysql -u username -p demo-booking < schema.sql

# 4. 启动服务
npm start
```

## ⚙️ 配置要求

### 系统要求
- Node.js 16+
- Python 3.8+
- MySQL 5.7+

### 必须配置
- 数据库连接信息
- SMTP邮件服务
- 邮件通知接收地址

## 🧪 验证部署

```bash
# 健康检查
curl http://localhost:8080/health

# 功能测试
node test_demo_booking_api.js

# 完整验证
./verify_deployment.sh
```

## 📚 详细文档

- `DEPLOYMENT_GUIDE.md` - 完整部署指南
- `DEMO_BOOKING_DEPLOYMENT.md` - Demo预约功能说明
- `BOOK_DEMO_ANALYTICS_EVENTS.md` - 埋点事件文档

## 📞 技术支持

部署遇到问题请查看详细文档或联系开发团队。

---

**快速开始**: 运行 `./deploy.sh` 即可一键部署！