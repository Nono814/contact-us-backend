# 前端埋点集成指导文档

## 🚨 问题说明

前端埋点功能报错 `POST https://daboss.net.cn/api/analytics/track 404 (Not Found)`

**原因**: 埋点采集服务没有正确部署或路由配置有问题。

## ✅ 后端埋点功能已开发完成

埋点功能已经完整开发并测试通过，包含：
- FastAPI埋点采集服务
- 完整的事件验证和存储
- 支持单个和批量事件处理

## 🔧 服务器端解决步骤

### 1. 确认埋点服务部署

运维团队需要确认以下服务是否正确启动：

```bash
# 检查埋点服务是否运行
curl https://daboss.net.cn/healthz

# 或者在服务器上检查
curl http://localhost:8080/healthz
```

### 2. Nginx配置检查

确认Nginx配置包含埋点路由转发：

```nginx
# 在 server {} 块中添加
location /api/analytics/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # 支持CORS
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

### 3. 启动埋点服务

如果埋点服务没有启动，需要运行：

```bash
# 进入项目目录
cd /path/to/project

# 启动埋点服务（FastAPI）
uvicorn app.main:app --host 0.0.0.0 --port 8080

# 或者使用Docker
docker-compose up -d analytics-service
```

## 📱 前端集成代码

### 方案1：使用现成的集成代码

我们已经准备好了完整的前端集成代码：

```javascript
// analytics.js - 埋点工具类
class Analytics {
  constructor(config = {}) {
    this.baseURL = config.baseURL || 'https://daboss.net.cn';
    this.apiPath = config.apiPath || '/api/analytics/track';
    this.sessionId = this.generateSessionId();
  }

  // 生成会话ID
  generateSessionId() {
    return crypto.randomUUID();
  }

  // 核心埋点方法
  async track(eventName, properties = {}) {
    const eventData = {
      version: "v1",
      eventName,
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      language: navigator.language.startsWith('zh') ? 'zh' : 'en',
      device: {
        ua: navigator.userAgent,
        platform: this.getPlatformType(),
        screen: \`\${screen.width}x\${screen.height}\`
      },
      eventProps: properties
    };

    try {
      const response = await fetch(\`\${this.baseURL}\${this.apiPath}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }

      console.log(\`✅ Event tracked: \${eventName}\`);
      return true;
    } catch (error) {
      console.warn(\`❌ Analytics tracking failed for \${eventName}:\`, error);
      return false;
    }
  }

  // 获取平台类型
  getPlatformType() {
    const ua = navigator.userAgent;
    if (/Mobile|Android|iPhone|iPad/.test(ua)) return 'mobile';
    if (/Tablet|iPad/.test(ua)) return 'tablet';
    return 'desktop';
  }

  // 页面浏览埋点
  trackPageView(pagePath) {
    this.track('page_view', {
      pagePath: pagePath || window.location.pathname,
      pageUrl: window.location.href,
      referrer: document.referrer
    });
  }

  // 用户行为埋点
  trackUserAction(action, target, properties = {}) {
    this.track('user_action', {
      action,
      target,
      ...properties
    });
  }

  // Demo页面专用埋点
  trackDemoPageView() {
    this.track('demo_page_view', {
      pageUrl: window.location.href,
      referrer: document.referrer,
      loadTime: Math.round(performance.now())
    });
  }

  trackDemoFormStart() {
    this.track('demo_form_start', {
      formId: 'demo-booking-form',
      timeOnPageBeforeStart: Math.round(performance.now())
    });
  }

  trackDemoFormSubmitSuccess(bookingId) {
    this.track('demo_form_submit_success', {
      bookingId,
      fillTime: Math.round(performance.now())
    });
  }
}

// 全局初始化
window.analytics = new Analytics();
```

### 方案2：Vue/React集成示例

#### Vue组合式API集成

```javascript
// composables/useAnalytics.js
import { ref, onMounted } from 'vue'

export function useAnalytics() {
  const analytics = ref(null)
  
  onMounted(() => {
    analytics.value = new Analytics({
      baseURL: 'https://daboss.net.cn'
    })
    
    // 自动追踪页面浏览
    analytics.value.trackPageView()
  })
  
  const track = (eventName, properties) => {
    if (analytics.value) {
      analytics.value.track(eventName, properties)
    }
  }
  
  return {
    track,
    trackPageView: () => analytics.value?.trackPageView(),
    trackUserAction: (action, target, props) => 
      analytics.value?.trackUserAction(action, target, props)
  }
}
```

#### React Hook集成

```javascript
// hooks/useAnalytics.js
import { useEffect, useRef } from 'react'

export function useAnalytics() {
  const analyticsRef = useRef(null)
  
  useEffect(() => {
    analyticsRef.current = new Analytics({
      baseURL: 'https://daboss.net.cn'
    })
    
    // 自动追踪页面浏览
    analyticsRef.current.trackPageView()
  }, [])
  
  const track = (eventName, properties) => {
    analyticsRef.current?.track(eventName, properties)
  }
  
  return {
    track,
    trackPageView: () => analyticsRef.current?.trackPageView(),
    trackUserAction: (action, target, props) => 
      analyticsRef.current?.trackUserAction(action, target, props)
  }
}
```

## 🧪 测试步骤

### 1. 服务端测试

```bash
# 测试埋点API是否可用
curl -X POST https://daboss.net.cn/api/analytics/track \\
  -H "Content-Type: application/json" \\
  -d '{
    "version": "v1",
    "eventName": "test_event",
    "eventId": "'$(uuidgen)'",
    "timestamp": "'$(date -Iseconds)'"
  }'
```

期望返回：`204 No Content`

### 2. 前端测试

在浏览器控制台运行：

```javascript
// 测试埋点功能
const testAnalytics = new Analytics();
testAnalytics.track('test_page_view', {
  testData: 'frontend_integration_test'
});
```

## 🔍 调试指南

### 1. 检查网络请求

在浏览器开发者工具的Network面板中查看：
- 请求URL是否正确
- 请求方法是否为POST
- 请求头是否包含Content-Type: application/json
- 响应状态码（应该是204）

### 2. 常见错误及解决方案

| 错误状态 | 原因 | 解决方案 |
|---------|------|----------|
| 404 | 路由不存在 | 检查Nginx配置和服务启动 |
| 403 | CORS问题 | 配置CORS头部 |
| 500 | 服务器错误 | 检查服务器日志 |
| 422 | 数据验证失败 | 检查事件数据格式 |

### 3. 验证服务状态

```bash
# 检查服务健康状态
curl https://daboss.net.cn/healthz

# 检查具体错误
curl -v https://daboss.net.cn/api/analytics/track
```

## 📋 前端集成清单

- [ ] 确认服务器端埋点服务已启动
- [ ] 配置Nginx转发规则
- [ ] 集成Analytics类到前端项目
- [ ] 在关键页面添加埋点调用
- [ ] 测试埋点功能正常工作
- [ ] 在控制台确认无404错误

## 🎯 Demo页面集成示例

```javascript
// 在Demo预约页面中使用
document.addEventListener('DOMContentLoaded', () => {
  const analytics = new Analytics();
  
  // 页面加载
  analytics.trackDemoPageView();
  
  // 表单开始
  document.querySelector('#demo-form').addEventListener('focusin', (e) => {
    if (e.target.matches('input, select') && !window.formStarted) {
      analytics.trackDemoFormStart();
      window.formStarted = true;
    }
  });
  
  // 表单提交成功
  // 在提交成功回调中调用
  analytics.trackDemoFormSubmitSuccess(response.id);
});
```

## 🔗 相关文档

- 完整埋点事件文档：`BOOK_DEMO_ANALYTICS_EVENTS.md`
- 服务端部署文档：`DEPLOYMENT_GUIDE.md`
- API测试工具：`test_demo_booking_api.js`

---

**请运维团队确认埋点服务部署状态，前端团队按照此文档进行集成。** 📧