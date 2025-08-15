# 🔧 给运维团队的紧急通知

## 📋 问题描述

**网站**: daboss.net.cn  
**问题**: 前端埋点功能报错 404  
**错误URL**: `POST https://daboss.net.cn/api/analytics/track`  
**影响**: 用户行为数据无法收集，影响产品分析和优化

## ✅ 后端服务现状

埋点采集服务已经完整开发并测试通过：
- ✅ FastAPI埋点服务代码完成
- ✅ 数据库表结构就绪 (analytics.analytics_events)
- ✅ 完整的事件验证和存储逻辑
- ✅ 本地测试100%通过

**缺少的是服务器端的部署配置**

## 🚨 需要运维团队立即处理

### 1. 检查埋点服务是否运行

```bash
# 在服务器上执行
ps aux | grep uvicorn
ps aux | grep "app.main"
netstat -tlnp | grep :8080
```

**期望结果**: 应该看到uvicorn进程监听8080端口

### 2. 如果服务未运行，需要启动

```bash
# 进入项目目录
cd /path/to/project

# 启动埋点服务 (二选一)
# 方式1: 直接启动
uvicorn app.main:app --host 0.0.0.0 --port 8080

# 方式2: 后台启动
nohup uvicorn app.main:app --host 0.0.0.0 --port 8080 > analytics.log 2>&1 &
```

### 3. 检查Nginx配置

**必须确保Nginx配置包含以下路由转发**:

```nginx
# 在 server 块中添加
location /api/analytics/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # CORS支持 (重要!)
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}

# 健康检查路由
location /healthz {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
}
```

**配置完成后重新加载Nginx**:
```bash
nginx -t  # 检查配置语法
nginx -s reload  # 重新加载配置
```

### 4. 验证服务正常

```bash
# 健康检查
curl https://daboss.net.cn/healthz
# 期望返回: {"status":"ok"}

# 埋点API测试
curl -X POST https://daboss.net.cn/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"version":"v1","eventName":"test","eventId":"'$(uuidgen)'","timestamp":"'$(date -Iseconds)'"}'
# 期望返回: HTTP 204 (无内容体)
```

## 🛠️ 诊断工具

我已经准备了自动诊断脚本，请运行：

```bash
# 下载并运行诊断脚本
chmod +x diagnose_analytics.sh
./diagnose_analytics.sh
```

这个脚本会自动检查：
- 健康检查是否可用
- 埋点API是否正确响应
- CORS配置是否正确
- 提供详细的错误诊断

## 📁 相关文件位置

如果需要重新部署，相关文件在项目中的位置：

```
project/
├── app/                    # FastAPI埋点服务
│   ├── main.py            # 服务入口
│   ├── routers/analytics.py  # API路由
│   └── ...
├── requirements.txt        # Python依赖
├── diagnose_analytics.sh   # 诊断脚本
└── 埋点采集服务-运维部署手册.md  # 详细部署文档
```

## ⏰ 紧急程度

**高优先级** - 影响产品数据收集，需要尽快解决

## 🎯 成功标准

完成后应该满足：
1. ✅ `curl https://daboss.net.cn/healthz` 返回200
2. ✅ `curl -X POST https://daboss.net.cn/api/analytics/track` 返回204而不是404
3. ✅ 前端控制台不再出现404错误
4. ✅ 埋点数据开始正常写入数据库

## 📞 技术支持

如需支持，请提供：
- 诊断脚本运行结果
- 当前Nginx配置
- 服务器进程状态 (`ps aux | grep uvicorn`)
- 埋点服务日志

**预计解决时间**: 30分钟内（主要是配置工作）

---

**请优先处理此问题，埋点数据对产品优化非常重要！** 🚀