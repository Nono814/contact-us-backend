# 🚀 部署清单

## 📋 部署前准备

### 环境要求
- [ ] Node.js 16+ 已安装
- [ ] Python 3.8+ 已安装  
- [ ] MySQL 5.7+ 数据库可用
- [ ] 服务器端口8080可用

### 配置准备
- [ ] 复制 `config.env.template` 为 `config.env`
- [ ] 配置数据库连接信息
- [ ] 配置SMTP邮件服务
- [ ] 设置邮件通知接收地址

### 数据库准备
- [ ] 创建 `demo-booking` 数据库
- [ ] 创建 `analytics` 数据库  
- [ ] 导入表结构: `mysql -u user -p demo-booking < schema.sql`

## 🛠️ 部署步骤

### 自动部署（推荐）
- [ ] 解压部署包
- [ ] 配置 `config.env` 文件
- [ ] 运行 `./deploy.sh`
- [ ] 验证部署结果

### 手动部署
- [ ] 安装Node.js依赖: `npm install`
- [ ] 安装Python依赖: `pip install -r requirements.txt`
- [ ] 启动服务: `npm start` 或 `pm2 start ecosystem.config.js`

## ✅ 部署验证

### 健康检查
- [ ] Node.js服务: `curl http://localhost:8080/health`
- [ ] 埋点服务: `curl http://localhost:8080/healthz`

### 功能测试  
- [ ] Demo预约API: `node test_demo_booking_api.js`
- [ ] 管理后台访问: `http://localhost:8080/admin`
- [ ] 邮件通知测试

### 完整验证
- [ ] 运行验证脚本: `./verify_deployment.sh`

## 🔍 监控检查

### 进程监控
- [ ] 服务进程正常运行
- [ ] 端口正常监听 (8080)
- [ ] 内存使用合理

### 日志检查
- [ ] 应用日志正常
- [ ] 无错误信息
- [ ] 数据库连接正常

### 功能验证
- [ ] Demo预约表单提交成功
- [ ] 邮件通知正常接收
- [ ] 埋点数据正常记录

## 🚨 常见问题

| 问题 | 解决方案 |
|------|----------|
| 端口占用 | 检查8080端口，或修改配置 |
| 数据库连接失败 | 验证数据库配置和网络 |
| 邮件发送失败 | 检查SMTP配置和密码 |
| 权限错误 | 执行 `chmod +x *.sh` |

## 📞 技术支持

部署遇到问题请：
1. 查看相关文档
2. 检查日志文件
3. 联系开发团队

---

**提示**: 按顺序完成清单项目，确保部署成功！