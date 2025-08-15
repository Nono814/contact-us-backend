# 埋点采集服务（Analytics Ingest）传统部署（无 Docker）操作手册

说明：你已完成数据库库 `analytics` 的创建与最终版表 `analytics_events` 的创建。本手册跳过建库/建表步骤，从“准备代码和环境”开始，按顺序执行即可上线。

## 第1步：准备代码和环境
- 创建系统用户与部署目录
```bash
sudo useradd -r -s /bin/false analytics || true
sudo mkdir -p /opt/analytics-ingest
sudo chown -R $USER:$USER /opt/analytics-ingest
```
- 放置代码到指定目录（将当前项目拷贝/同步到部署目录）
```bash
# 示例
rsync -av --delete /home/devbox/project/ /opt/analytics-ingest/
```
- 创建 Python 虚拟环境并安装依赖（Python 3.11+）
```bash
cd /opt/analytics-ingest
python3 -m venv .venv
. ./.venv/bin/activate
pip install -r requirements.txt
```

## 第2步：创建环境变量文件
- 新建并编辑 `/etc/analytics-ingest.env`
```bash
sudo tee /etc/analytics-ingest.env >/dev/null <<'EOF'
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

## 第3步：创建 systemd 服务
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

## 第4步：配置 Nginx 同源代理
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

## 第5步：最终验证
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

## 第6步：日常运维
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
cd /opt/analytics-ingest
# 同步/拉取代码（如 git pull 或 rsync）
. ./.venv/bin/activate && pip install -r requirements.txt
sudo systemctl restart analytics-ingest
```
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
