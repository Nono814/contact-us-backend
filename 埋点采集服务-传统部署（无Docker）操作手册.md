# 埋点采集服务（Analytics Ingest）传统部署（无 Docker）操作手册

说明：你已完成数据库库 `analytics` 的创建与最终版表 `analytics_events` 的创建。本手册跳过建库/建表步骤，从"准备代码和环境"开始，按顺序执行即可上线。

**重要**：本服务使用 8081 端口，避免与主业务 Node.js 服务（8080 端口）冲突。

## 第1步：代码部署到云服务器

### 方案一：rsync 同步（推荐，适用于密码登录）

**前提条件**：
- 云服务器 IP：115.190.117.78
- SSH 端口：22
- 登录密码：Aiedn531
- SSH 用户：将 `<user>` 替换为实际用户名（如 root、ubuntu）

**1) 本地安装依赖工具**
```bash
sudo apt install -y sshpass rsync
```

**2) 同步代码到云服务器**
```bash
# 预演（确认要传输的文件）
SSHPASS='Aiedn531' sshpass -e rsync -avz --dry-run --delete \
  --exclude ".git" --exclude "node_modules" --exclude "logs" --exclude "*.log" \
  --exclude "config.env" --exclude "config.production.env" --exclude ".vscode" --exclude ".env*" \
  --exclude "__pycache__" --exclude ".venv" --exclude "lib/" \
  -e "ssh -p 22 -o StrictHostKeyChecking=no" \
  /home/devbox/project/ <user>@115.190.117.78:/tmp/project-sync/

# 实际同步
SSHPASS='Aiedn531' sshpass -e rsync -avz --delete \
  --exclude ".git" --exclude "node_modules" --exclude "logs" --exclude "*.log" \
  --exclude "config.env" --exclude "config.production.env" --exclude ".vscode" --exclude ".env*" \
  --exclude "__pycache__" --exclude ".venv" --exclude "lib/" \
  -e "ssh -p 22 -o StrictHostKeyChecking=no" \
  /home/devbox/project/ <user>@115.190.117.78:/tmp/project-sync/
```

### 方案二：Git 同步（推荐，适用于有 Git 权限）

**1) 本地推送到远程仓库**
```bash
# 如果 Git SSH 有问题，先配置 SSH key
ssh-keygen -t ed25519 -C "your@email.com" -f ~/.ssh/id_ed25519 -N ""
eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub  # 复制输出，添加到 GitHub SSH Keys

# 测试连接并推送
ssh -T git@github.com
git push origin main
```

**2) 服务器上克隆代码**
```bash
# 在云服务器上执行
sudo mkdir -p /tmp/project-sync
sudo chown -R $USER:$USER /tmp/project-sync
cd /tmp/project-sync
git clone https://github.com/Nono814/contact-us-backend.git .
```

### 方案三：打包传输

**1) 本地打包**
```bash
cd /home/devbox/project
tar --exclude=".git" --exclude="node_modules" --exclude="logs" --exclude="*.log" \
    --exclude="config.env" --exclude="config.production.env" --exclude=".vscode" \
    --exclude="__pycache__" --exclude=".venv" --exclude="lib/" \
    -czf officialwebbackend-$(date +%Y%m%d-%H%M).tar.gz .
```

**2) 传输并解压**
```bash
# 传输
SSHPASS='Aiedn531' sshpass -e scp -P 22 -o StrictHostKeyChecking=no \
  officialwebbackend-*.tar.gz <user>@115.190.117.78:/tmp/

# 在服务器解压
sudo mkdir -p /tmp/project-sync
sudo chown -R $USER:$USER /tmp/project-sync
cd /tmp/project-sync
tar -xzf /tmp/officialwebbackend-*.tar.gz
```

## 第2步：准备代码和环境

**在云服务器上执行以下命令：**

- 创建系统用户与部署目录
```bash
sudo useradd -r -s /bin/false analytics || true
sudo mkdir -p /opt/analytics-ingest
sudo chown -R $USER:$USER /opt/analytics-ingest
```

- 复制代码到部署目录
```bash
# 从临时同步目录复制到最终部署目录
rsync -av --delete /tmp/project-sync/ /opt/analytics-ingest/
```

- 创建 Python 虚拟环境并安装依赖（Python 3.11+）
```bash
cd /opt/analytics-ingest
python3 -m venv .venv
. ./.venv/bin/activate
pip install -r requirements.txt
```

## 第3步：创建环境变量文件
- 新建并编辑 `/etc/analytics-ingest.env`
```bash
sudo tee /etc/analytics-ingest.env >/dev/null <<'EOF'
# 服务配置
PORT=8081

# 数据库配置
DB_HOST=dbconn.sealosbja.site
DB_PORT=43919
DB_USER=root
DB_PASSWORD=qrzk4ts4
DB_NAME=analytics

# CORS 同源放行（按需填写你们的官网域名）
ALLOWED_ORIGINS=["https://<YOUR_DOMAIN>"]

# 接收限制（可保持默认）
MAX_BATCH_EVENTS=50
MAX_REQUEST_BYTES=204800
EOF
```

## 第4步：创建 systemd 服务
- 新建 `/etc/systemd/system/analytics-ingest.service`
```ini
[Unit]
Description=Analytics Ingest Service (FastAPI)
After=network.target

[Service]
User=analytics
Group=analytics
WorkingDirectory=/opt/analytics-ingest
EnvironmentFile=/etc/analytics-ingest.env
Environment=PYTHONUNBUFFERED=1
ExecStart=/opt/analytics-ingest/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8081
Restart=always
RestartSec=3
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```
- 启动并设为开机自启
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now analytics-ingest
systemctl status analytics-ingest
curl -s http://127.0.0.1:8081/healthz  # 预期 {"status":"ok"}
```

## 第5步：配置 Nginx 同源代理
- 在官网域名对应的 `server {}` 中增加（或更新）：
```nginx
# 同源代理：外部 /api/analytics/* -> 本机服务 127.0.0.1:8081
location ^~ /api/analytics/ {
  proxy_pass         http://127.0.0.1:8081;  # 服务内部已注册 /api/analytics/* 路由
  proxy_http_version 1.1;

  # 真实源与可观测
  proxy_set_header Host               $host;
  proxy_set_header X-Real-IP          $remote_addr;
  proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto  $scheme;
  proxy_set_header X-Server-IP        $server_addr;

  # 与服务限制对齐
  client_max_body_size 200k;
  proxy_connect_timeout 1s;
  proxy_read_timeout    3s;
  proxy_send_timeout    3s;

  # 预检（通常同源不触发；留作兜底）
  if ($request_method = OPTIONS) { return 204; }
}
```
- 重载 Nginx
```bash
sudo nginx -t && sudo nginx -s reload
```

## 第6步：最终验证
- 外网同源验证（替换为你们官网域名）
```bash
curl -i -X POST https://<YOUR_DOMAIN>/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"version":"v1","eventName":"page_view","eventId":"c1c3c0c1-1e2f-4b5a-9ac1-0000000000aa","rid":"2f7a6c10-5b0c-4b7e-8b7e-0000000000aa","timestamp":"2025-08-11T09:00:00.000Z"}'
# 预期：204 No Content；响应头含 X-Request-Id
```
- 批量上报（可选）
```bash
SID=$(python -c 'import uuid;print(uuid.uuid4())'); E1=$(python -c 'import uuid;print(uuid.uuid4())'); E2=$(python -c 'import uuid;print(uuid.uuid4())'); RID1=$(python -c 'import uuid;print(uuid.uuid4())'); RID2=$(python -c 'import uuid;print(uuid.uuid4())')

curl -i -X POST https://<YOUR_DOMAIN>/api/analytics/track/batch \
  -H 'Content-Type: application/json' \
  -d "{\"version\":\"v1\",\"events\":[{\"eventName\":\"session_start\",\"eventId\":\"$E1\",\"timestamp\":\"2025-08-11T16:58:00.000Z\",\"sessionId\":\"$SID\",\"rid\":\"$RID1\",\"language\":\"zh\"},{\"eventName\":\"page_view\",\"eventId\":\"$E2\",\"timestamp\":\"2025-08-11T16:58:01.000Z\",\"sessionId\":\"$SID\",\"rid\":\"$RID2\",\"routeFrom\":\"/\",\"routeTo\":\"/candidates\",\"language\":\"zh\"}]}"
# 预期：204 No Content
```

## 第7步：日常运维
- 查看/跟随日志
```bash
journalctl -u analytics-ingest -f
```
- 重启服务
```bash
sudo systemctl restart analytics-ingest
```
- 升级上线（拉新代码并装依赖）
```bash
# 方案一：使用 rsync 更新
SSHPASS='Aiedn531' sshpass -e rsync -avz --delete \
  --exclude ".git" --exclude "node_modules" --exclude "logs" --exclude "*.log" \
  --exclude "config.env" --exclude "config.production.env" --exclude ".vscode" --exclude ".env*" \
  --exclude "__pycache__" --exclude ".venv" --exclude "lib/" \
  -e "ssh -p 22 -o StrictHostKeyChecking=no" \
  /home/devbox/project/ <user>@115.190.117.78:/tmp/project-sync/

# 在服务器上更新部署
rsync -av --delete /tmp/project-sync/ /opt/analytics-ingest/
cd /opt/analytics-ingest
. ./.venv/bin/activate && pip install -r requirements.txt
sudo systemctl restart analytics-ingest

# 方案二：使用 Git 更新（如果已配置 Git）
cd /opt/analytics-ingest
git pull --rebase
. ./.venv/bin/activate && pip install -r requirements.txt
sudo systemctl restart analytics-ingest
```
- 与主业务服务协同部署
  - Node.js 主服务（officialwebbackend）：8080 端口，处理联系表单等业务
  - Python 埋点服务（analytics-ingest）：8081 端口，处理埋点数据采集
  - 两服务可独立部署和重启，互不影响
- 切换域名
  - 更新 Nginx 的 `server_name` 和证书为新域名
  - 更新 `/etc/analytics-ingest.env` 中 `ALLOWED_ORIGINS=["https://new-domain.com"]`
  - `sudo systemctl restart analytics-ingest && sudo nginx -s reload`
- 常见问题速查
  - 404：Nginx 路由未生效或未 reload；或服务未启动
  - 413：请求体超 200KB；请前端分批；确认 `client_max_body_size 200k`
  - 422：校验失败（`eventId/rid/sessionId` 必须 UUID v4；`sessionId` 可不传）
  - 5xx：`journalctl -u analytics-ingest -n 200` 查看错误
  - CORS：如跨域来源变化，更新 `ALLOWED_ORIGINS` 并重启服务

## 第8步：前端接口调用说明

### 服务架构概览
部署完成后的服务结构：
```
域名/IP (80/443) 
    ↓ Nginx 反向代理
    ├── /api/ → Node.js 服务 (8080端口) - 联系表单等业务接口
    └── /api/analytics/ → Python 服务 (8081端口) - 埋点数据接口
```

### 1. Node.js 主业务接口调用

**接口地址格式**：
```
https://your-domain.com/api/{endpoint}
或 http://115.190.117.78/api/{endpoint}  (无域名时)
```

**主要接口**：
- `POST /api/hiring` - 招聘服务提交
- `POST /api/employer-branding` - 雇主品牌服务提交  
- `POST /api/human-data` - 人工数据服务提交
- `POST /api/digital-clone` - 数字克隆服务提交
- `POST /api/other-inquiry` - 其他咨询提交
- `GET /api/admin/submissions` - 管理后台数据获取

**前端调用示例**：
```javascript
// 招聘服务提交
const response = await fetch('https://your-domain.com/api/hiring', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: '张三',
    email: 'zhang@example.com',
    company: '某科技公司',
    company_size: '100-500人',
    role_type: '技术岗位',
    special_requirements: '需要React经验'
  })
});

const result = await response.json();
console.log(result); // { success: true, message: "提交成功" }
```

### 2. Python 埋点接口调用

**接口地址格式**：
```
https://your-domain.com/api/analytics/{endpoint}
```

**主要接口**：
- `POST /api/analytics/track` - 单个事件上报
- `POST /api/analytics/track/batch` - 批量事件上报
- `GET /healthz` - 健康检查（直接访问，不经过 /api/analytics 前缀）

**前端调用示例**：
```javascript
// 单个埋点事件
const trackEvent = async (eventData) => {
  try {
    const response = await fetch('https://your-domain.com/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'v1',
        eventName: 'page_view',
        eventId: crypto.randomUUID(), // 生成 UUID v4
        rid: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        sessionId: getSessionId(), // 你的会话ID
        language: 'zh',
        routeFrom: '/',
        routeTo: '/about'
      })
    });
    
    // 埋点接口返回 204 No Content
    if (response.status === 204) {
      console.log('埋点上报成功');
    }
  } catch (error) {
    console.error('埋点上报失败:', error);
  }
};

// 批量埋点事件
const trackBatch = async (events) => {
  const response = await fetch('https://your-domain.com/api/analytics/track/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'v1',
      events: events // 事件数组
    })
  });
};
```

### 3. 前端集成完整示例

创建 API 工具类：
```javascript
// api.js
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  // 业务接口调用
  async submitHiring(data) {
    return this.post('/api/hiring', data);
  }

  async submitEmployerBranding(data) {
    return this.post('/api/employer-branding', data);
  }

  // 埋点接口调用
  async trackEvent(eventData) {
    const response = await fetch(`${this.baseURL}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: 'v1',
        eventId: crypto.randomUUID(),
        rid: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ...eventData
      })
    });
    return response.status === 204;
  }

  // 通用 POST 方法
  async post(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

// 使用示例
const api = new APIClient('https://your-domain.com');

// 提交表单
const result = await api.submitHiring({
  name: '张三',
  email: 'zhang@example.com',
  // ... 其他字段
});

// 埋点上报
await api.trackEvent({
  eventName: 'form_submit',
  eventProps: { form_type: 'hiring' }
});
```

### 4. CORS 配置说明

**Node.js 服务 CORS**：
已配置允许的域名，支持跨域请求。

**Python 服务 CORS**：
需要在 `/etc/analytics-ingest.env` 中正确配置：
```env
# 将 <YOUR_DOMAIN> 替换为实际域名
ALLOWED_ORIGINS=["https://your-domain.com", "https://www.your-domain.com"]
```

### 5. 域名配置建议

**如果有域名**：
1. 配置 DNS 解析指向 `115.190.117.78`
2. 使用 Let's Encrypt 配置 SSL 证书
3. 前端使用 `https://your-domain.com` 调用

**如果暂无域名**：
1. 直接使用 IP：`http://115.190.117.78`
2. 注意浏览器可能有跨域限制
3. 建议尽快配置域名和 HTTPS

### 6. 接口调试和测试

```bash
# 测试业务接口
curl -X POST https://your-domain.com/api/hiring \
  -H "Content-Type: application/json" \
  -d '{"name":"测试","email":"test@example.com"}'

# 测试埋点接口  
curl -X POST https://your-domain.com/api/analytics/track \
  -H "Content-Type: application/json" \
  -d '{"version":"v1","eventName":"test","eventId":"'$(uuidgen | tr '[:upper:]' '[:lower:]')'","timestamp":"'$(date -Iseconds)'"}'

# 测试健康检查
curl https://your-domain.com/healthz
```
