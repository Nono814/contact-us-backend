# 📦 运维部署包说明

## 📋 包内容

**文件**: `ops-deployment-package-20250815-1248.tar.gz` (98KB)

### 🚨 紧急文档 (优先查看)
- `MESSAGE_TO_OPS_TEAM.md` - 运维团队紧急处理指南
- `MESSAGE_TO_FRONTEND_TEAM.md` - 前端团队集成说明
- `COMMUNICATION_PACKAGE.md` - 完整协调方案
- `diagnose_analytics.sh` - 自动诊断脚本

### 🛠️ 核心服务代码
- `app/` - FastAPI埋点采集服务
- `routes/` - Node.js API路由 (Demo预约)
- `services/` - 邮件通知服务
- `schema.sql` - 数据库表结构

### 📖 部署文档
- `deployment-package/DEPLOYMENT_GUIDE.md` - 完整部署指南
- `deployment-package/埋点采集服务-运维部署手册.md` - 中文部署手册
- `deployment-package/DEPLOYMENT_CHECKLIST.md` - 部署检查清单

### 🔧 配置文件
- `config.env` - 环境配置
- `package.json` - Node.js依赖
- `requirements.txt` - Python依赖
- `nginx.conf` - Nginx配置示例

## 🎯 立即行动

### 第一步：解压包
```bash
tar -xzf ops-deployment-package-20250815-1248.tar.gz
cd deployment-package/
```

### 第二步：阅读紧急文档
```bash
cat MESSAGE_TO_OPS_TEAM.md
```

### 第三步：运行诊断
```bash
chmod +x diagnose_analytics.sh
./diagnose_analytics.sh
```

## 📞 问题现状

**网站**: https://daboss.net.cn  
**错误**: `POST /api/analytics/track 404`  
**影响**: 埋点数据无法收集  
**预计修复时间**: 30分钟

## ✅ 修复后验证

```bash
# 健康检查
curl https://daboss.net.cn/healthz

# 埋点API测试  
curl -X POST https://daboss.net.cn/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"version":"v1","eventName":"test"}'
```

## 📧 联系支持

如有技术问题，请提供：
- 诊断脚本运行结果
- 当前Nginx配置
- 服务器进程状态

---

**部署成功后，埋点功能将自动恢复正常！** 🚀