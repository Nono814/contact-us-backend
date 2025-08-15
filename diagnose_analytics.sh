#!/bin/bash

# 埋点服务诊断脚本
# 用于检查 daboss.net.cn 的埋点服务状态

echo "🔍 埋点服务诊断工具"
echo "==================="

DOMAIN="daboss.net.cn"
ANALYTICS_URL="https://${DOMAIN}/api/analytics/track"
HEALTH_URL="https://${DOMAIN}/healthz"

# 检查健康状况
echo "1. 检查埋点服务健康状态..."
if curl -f -s -m 10 "${HEALTH_URL}" > /dev/null 2>&1; then
    echo "✅ 埋点服务健康检查通过: ${HEALTH_URL}"
else
    echo "❌ 埋点服务健康检查失败: ${HEALTH_URL}"
    echo "   可能原因："
    echo "   - 埋点服务未启动"
    echo "   - Nginx未配置健康检查路由"
    echo "   - 端口未开放"
fi

# 检查埋点API路由
echo ""
echo "2. 检查埋点API路由..."

# 发送OPTIONS请求检查CORS
echo "   检查CORS配置..."
CORS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "${ANALYTICS_URL}" \
    -H "Origin: https://${DOMAIN}" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" 2>/dev/null)

if [ "$CORS_RESPONSE" = "204" ] || [ "$CORS_RESPONSE" = "200" ]; then
    echo "   ✅ CORS配置正常"
else
    echo "   ⚠️  CORS配置可能有问题 (状态码: $CORS_RESPONSE)"
fi

# 发送测试POST请求
echo "   检查POST请求..."
TEST_DATA='{
  "version": "v1",
  "eventName": "diagnostic_test",
  "eventId": "'$(uuidgen 2>/dev/null || echo "test-$(date +%s)")'",
  "timestamp": "'$(date -Iseconds 2>/dev/null || date)'"
}'

POST_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${ANALYTICS_URL}" \
    -H "Content-Type: application/json" \
    -d "$TEST_DATA" 2>/dev/null)

case "$POST_RESPONSE" in
    "204")
        echo "   ✅ 埋点API工作正常 (返回204)"
        ;;
    "404")
        echo "   ❌ 埋点API路由不存在 (返回404)"
        echo "      解决方案："
        echo "      1. 检查Nginx配置是否包含 /api/analytics/ 路由"
        echo "      2. 确认埋点服务(FastAPI)已启动"
        echo "      3. 检查upstream配置"
        ;;
    "422")
        echo "   ⚠️  埋点API存在但数据验证失败 (返回422)"
        echo "      这通常是正常的，说明路由配置正确"
        ;;
    "500")
        echo "   ❌ 服务器内部错误 (返回500)"
        echo "      解决方案："
        echo "      1. 检查埋点服务日志"
        echo "      2. 检查数据库连接"
        echo "      3. 检查服务配置"
        ;;
    "000")
        echo "   ❌ 无法连接到服务器"
        echo "      解决方案："
        echo "      1. 检查域名解析"
        echo "      2. 检查网络连接"
        echo "      3. 检查防火墙配置"
        ;;
    *)
        echo "   ⚠️  意外响应状态码: $POST_RESPONSE"
        ;;
esac

# 检查Nginx配置建议
echo ""
echo "3. Nginx配置检查..."
echo "   请确认Nginx配置包含以下内容："
echo ""
cat << 'EOF'
   location /api/analytics/ {
       proxy_pass http://127.0.0.1:8080;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       
       # CORS支持
       add_header Access-Control-Allow-Origin *;
       add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
       add_header Access-Control-Allow-Headers "Content-Type";
       
       if ($request_method = 'OPTIONS') {
           return 204;
       }
   }
   
   location /healthz {
       proxy_pass http://127.0.0.1:8080;
   }
EOF

# 服务启动检查
echo ""
echo "4. 服务启动检查..."
echo "   请在服务器上确认以下服务正在运行："
echo ""
echo "   # 检查埋点服务进程"
echo "   ps aux | grep uvicorn"
echo "   ps aux | grep 'app.main:app'"
echo ""
echo "   # 检查端口监听"
echo "   netstat -tlnp | grep :8080"
echo "   ss -tlnp | grep :8080"
echo ""
echo "   # 启动埋点服务（如果未运行）"
echo "   cd /path/to/project"
echo "   uvicorn app.main:app --host 0.0.0.0 --port 8080"

# 前端集成建议
echo ""
echo "5. 前端集成建议..."
echo "   当前错误: POST ${ANALYTICS_URL} 404"
echo ""
echo "   临时调试方案："
echo "   1. 在浏览器控制台测试："
echo ""
cat << 'EOF'
   fetch('https://daboss.net.cn/api/analytics/track', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       version: 'v1',
       eventName: 'test',
       eventId: crypto.randomUUID(),
       timestamp: new Date().toISOString()
     })
   }).then(r => console.log('Status:', r.status))
     .catch(e => console.error('Error:', e));
EOF
echo ""
echo "   2. 期望结果: Status: 204"

echo ""
echo "📞 如需技术支持，请提供："
echo "   1. 服务器上的进程状态 (ps aux | grep uvicorn)"
echo "   2. 端口监听情况 (netstat -tlnp | grep :8080)"
echo "   3. Nginx配置文件相关部分"
echo "   4. 埋点服务日志"

echo ""
echo "🎯 诊断完成！"