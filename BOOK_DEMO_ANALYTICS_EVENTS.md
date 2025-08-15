# Book a Demo 页面埋点事件定义

本文档定义了Book a Demo（Demo预约）页面的所有埋点事件，用于用户行为分析和转化率追踪。

## 📊 事件概览

### 页面事件
- `demo_page_view` - Demo预约页面浏览
- `demo_page_exit` - Demo预约页面退出

### 表单交互事件
- `demo_form_start` - 开始填写表单
- `demo_form_field_focus` - 字段获得焦点
- `demo_form_field_blur` - 字段失去焦点
- `demo_form_validation_error` - 表单验证错误
- `demo_form_submit_attempt` - 表单提交尝试
- `demo_form_submit_success` - 表单提交成功
- `demo_form_submit_error` - 表单提交失败

### 用户行为事件
- `demo_form_abandon` - 表单填写放弃
- `demo_cta_click` - CTA按钮点击
- `demo_help_click` - 帮助信息点击

## 📝 详细事件定义

### 1. Demo预约页面浏览
```json
{
  "eventName": "demo_page_view",
  "eventId": "uuid-v4",
  "timestamp": "2024-01-15T10:30:00Z",
  "sessionId": "uuid-v4",
  "userIdHash": "optional-user-hash",
  "isLoggedIn": false,
  "language": "en|zh",
  "routeFrom": "/previous-page",
  "routeTo": "/demo-booking",
  "utm": {
    "source": "google",
    "medium": "cpc",
    "campaign": "demo-campaign",
    "term": "ai demo",
    "content": "ad-text"
  },
  "device": {
    "ua": "Mozilla/5.0...",
    "platform": "desktop|mobile|tablet",
    "screen": "1920x1080"
  },
  "eventProps": {
    "referrer": "https://example.com/pricing",
    "loadTime": 1200,
    "pageUrl": "https://yoursite.com/demo-booking"
  }
}
```

### 2. 开始填写表单
```json
{
  "eventName": "demo_form_start",
  "eventId": "uuid-v4",
  "timestamp": "2024-01-15T10:31:00Z",
  "sessionId": "uuid-v4",
  "eventProps": {
    "formId": "demo-booking-form",
    "firstField": "firstName",
    "timeOnPageBeforeStart": 30000
  }
}
```

### 3. 字段交互事件
```json
{
  "eventName": "demo_form_field_focus",
  "eventId": "uuid-v4",
  "timestamp": "2024-01-15T10:31:15Z",
  "sessionId": "uuid-v4",
  "eventProps": {
    "fieldName": "firstName|lastName|email|company|roles|mainGoal|budget|emailUpdates",
    "fieldType": "text|email|select|checkbox|radio",
    "fieldOrder": 1,
    "timeFromFormStart": 15000
  }
}
```

### 4. 表单验证错误
```json
{
  "eventName": "demo_form_validation_error",
  "eventId": "uuid-v4",
  "timestamp": "2024-01-15T10:35:00Z",
  "sessionId": "uuid-v4",
  "eventProps": {
    "errors": {
      "firstName": "First name is required",
      "email": "Invalid email format"
    },
    "errorCount": 2,
    "fieldName": "email",
    "errorMessage": "Invalid email format"
  }
}
```

### 5. 表单提交成功
```json
{
  "eventName": "demo_form_submit_success",
  "eventId": "uuid-v4",
  "timestamp": "2024-01-15T10:36:00Z",
  "sessionId": "uuid-v4",
  "eventProps": {
    "bookingId": "db_20240115103000_abc123",
    "formData": {
      "roles": ["engineering", "product"],
      "mainGoal": "aiTraining",
      "budget": "medium",
      "language": "en",
      "company": "Tech Company Inc."
    },
    "fillTime": 300000,
    "retryCount": 0,
    "validationAttempts": 1
  }
}
```

### 6. 表单提交失败
```json
{
  "eventName": "demo_form_submit_error",
  "eventId": "uuid-v4",
  "timestamp": "2024-01-15T10:36:00Z",
  "sessionId": "uuid-v4",
  "eventProps": {
    "errorType": "network|validation|server",
    "errorMessage": "Network request failed",
    "httpStatus": 500,
    "retryCount": 1,
    "fillTime": 300000
  }
}
```

### 7. 表单填写放弃
```json
{
  "eventName": "demo_form_abandon",
  "eventId": "uuid-v4",
  "timestamp": "2024-01-15T10:34:00Z",
  "sessionId": "uuid-v4",
  "eventProps": {
    "abandonAt": "company",
    "completionRate": 0.5,
    "fillTime": 180000,
    "filledFields": ["firstName", "lastName", "email"],
    "totalFields": 8,
    "exitMethod": "close_tab|navigate_away|refresh"
  }
}
```

### 8. 页面退出
```json
{
  "eventName": "demo_page_exit",
  "eventId": "uuid-v4",
  "timestamp": "2024-01-15T10:37:00Z",
  "sessionId": "uuid-v4",
  "eventProps": {
    "timeOnPage": 420000,
    "exitMethod": "submit_success|navigate_away|close_tab",
    "formCompleted": true,
    "scrollDepth": 85,
    "interactions": 12
  }
}
```

## 🔧 前端集成示例

### JavaScript集成
```javascript
// 埋点服务配置
const analytics = {
  track: async (eventName, properties = {}) => {
    const eventData = {
      eventName,
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(), // 你的session管理函数
      userIdHash: getUserIdHash(), // 可选
      isLoggedIn: isUserLoggedIn(),
      language: getCurrentLanguage(),
      routeTo: '/demo-booking',
      device: {
        ua: navigator.userAgent,
        platform: getPlatformType(),
        screen: `${screen.width}x${screen.height}`
      },
      eventProps: properties
    };

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }
};

// 页面浏览埋点
analytics.track('demo_page_view', {
  referrer: document.referrer,
  pageUrl: window.location.href,
  loadTime: performance.now()
});

// 表单开始埋点
document.getElementById('demo-form').addEventListener('focusin', (e) => {
  if (e.target.matches('input, select, textarea')) {
    if (!window.formStarted) {
      analytics.track('demo_form_start', {
        formId: 'demo-booking-form',
        firstField: e.target.name,
        timeOnPageBeforeStart: performance.now()
      });
      window.formStarted = true;
    }
  }
});

// 字段焦点埋点
document.addEventListener('focusin', (e) => {
  if (e.target.matches('#demo-form input, #demo-form select')) {
    analytics.track('demo_form_field_focus', {
      fieldName: e.target.name,
      fieldType: e.target.type,
      fieldOrder: getFieldOrder(e.target.name),
      timeFromFormStart: performance.now() - window.formStartTime
    });
  }
});

// 表单提交埋点
document.getElementById('demo-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  analytics.track('demo_form_submit_attempt', {
    fillTime: performance.now() - window.formStartTime,
    completionRate: getFormCompletionRate()
  });

  try {
    const formData = new FormData(e.target);
    const response = await fetch('/api/demo-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(formData))
    });

    if (response.ok) {
      const result = await response.json();
      analytics.track('demo_form_submit_success', {
        bookingId: result.id,
        formData: Object.fromEntries(formData),
        fillTime: performance.now() - window.formStartTime,
        retryCount: window.submitRetryCount || 0
      });
    } else {
      const error = await response.json();
      analytics.track('demo_form_submit_error', {
        errorType: 'validation',
        errorMessage: error.message,
        httpStatus: response.status,
        errors: error.errors
      });
    }
  } catch (error) {
    analytics.track('demo_form_submit_error', {
      errorType: 'network',
      errorMessage: error.message,
      fillTime: performance.now() - window.formStartTime
    });
  }
});

// 页面退出埋点
window.addEventListener('beforeunload', () => {
  const exitData = {
    timeOnPage: performance.now(),
    exitMethod: 'navigate_away',
    formCompleted: !!window.formCompleted,
    scrollDepth: getMaxScrollDepth(),
    interactions: window.interactionCount || 0
  };

  // 使用sendBeacon确保数据发送
  navigator.sendBeacon('/api/analytics/track', JSON.stringify({
    eventName: 'demo_page_exit',
    eventId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    eventProps: exitData
  }));
});
```

### React集成示例
```jsx
import { useEffect, useRef } from 'react';
import { trackEvent } from './analytics';

const DemoBookingForm = () => {
  const formRef = useRef();
  const startTimeRef = useRef();
  const [formStarted, setFormStarted] = useState(false);

  useEffect(() => {
    // 页面浏览埋点
    trackEvent('demo_page_view', {
      referrer: document.referrer,
      pageUrl: window.location.href,
      loadTime: performance.now()
    });

    // 页面退出埋点
    const handleBeforeUnload = () => {
      trackEvent('demo_page_exit', {
        timeOnPage: performance.now(),
        exitMethod: 'navigate_away',
        formCompleted: formCompleted,
        scrollDepth: getMaxScrollDepth()
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleFieldFocus = (fieldName) => {
    if (!formStarted) {
      trackEvent('demo_form_start', {
        formId: 'demo-booking-form',
        firstField: fieldName,
        timeOnPageBeforeStart: performance.now()
      });
      startTimeRef.current = performance.now();
      setFormStarted(true);
    }

    trackEvent('demo_form_field_focus', {
      fieldName,
      timeFromFormStart: performance.now() - startTimeRef.current
    });
  };

  const handleSubmit = async (formData) => {
    trackEvent('demo_form_submit_attempt', {
      fillTime: performance.now() - startTimeRef.current
    });

    try {
      const response = await submitDemoBooking(formData);
      
      trackEvent('demo_form_submit_success', {
        bookingId: response.id,
        formData,
        fillTime: performance.now() - startTimeRef.current
      });
    } catch (error) {
      trackEvent('demo_form_submit_error', {
        errorType: error.type || 'unknown',
        errorMessage: error.message,
        fillTime: performance.now() - startTimeRef.current
      });
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      {/* 表单字段 */}
    </form>
  );
};
```

## 🎯 关键指标定义

### 转化率指标
- **页面转化率**: `demo_form_submit_success` / `demo_page_view`
- **表单开始率**: `demo_form_start` / `demo_page_view`  
- **表单完成率**: `demo_form_submit_success` / `demo_form_start`

### 用户体验指标
- **平均填写时间**: `demo_form_submit_success.eventProps.fillTime`
- **表单放弃率**: `demo_form_abandon` / `demo_form_start`
- **验证错误率**: `demo_form_validation_error` / `demo_form_submit_attempt`

### 流量质量指标
- **页面停留时间**: `demo_page_exit.eventProps.timeOnPage`
- **用户交互深度**: `demo_page_exit.eventProps.interactions`
- **来源渠道分析**: 通过UTM参数分析

## 📈 数据分析建议

### 1. 漏斗分析
```sql
-- 转化漏斗查询示例
SELECT 
  event_name,
  COUNT(*) as event_count,
  COUNT(*) * 100.0 / LAG(COUNT(*)) OVER (ORDER BY stage) as conversion_rate
FROM (
  SELECT 'page_view' as event_name, 1 as stage FROM analytics_events WHERE event_name = 'demo_page_view'
  UNION ALL
  SELECT 'form_start' as event_name, 2 as stage FROM analytics_events WHERE event_name = 'demo_form_start'  
  UNION ALL
  SELECT 'form_submit' as event_name, 3 as stage FROM analytics_events WHERE event_name = 'demo_form_submit_success'
) t
GROUP BY event_name, stage
ORDER BY stage;
```

### 2. 用户行为分析
- 分析用户在哪个字段停留时间最长
- 识别最常见的验证错误
- 分析不同来源用户的转化差异

### 3. A/B测试支持
通过`eventProps`中添加实验标识，支持表单优化的A/B测试分析。

## 🚀 部署和监控

1. **确保埋点服务正常运行**
2. **配置数据看板监控关键指标**
3. **设置异常告警（如转化率骤降）**
4. **定期分析数据优化表单体验**

---

此文档应与产品和前端团队协作，确保埋点的准确实施和数据的有效利用。