/**
 * 前端埋点集成代码 - 解决404错误
 * 适用于 daboss.net.cn 网站
 */

class DaBossAnalytics {
  constructor() {
    this.baseURL = 'https://daboss.net.cn';
    this.sessionId = this.generateSessionId();
    this.ready = false;
    this.init();
  }

  // 初始化并检查服务可用性
  async init() {
    try {
      // 检查埋点服务是否可用
      const healthCheck = await fetch(`${this.baseURL}/healthz`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (healthCheck.ok) {
        this.ready = true;
        console.log('✅ DaBoss Analytics initialized successfully');
      } else {
        console.warn('⚠️  DaBoss Analytics health check failed');
      }
    } catch (error) {
      console.warn('⚠️  DaBoss Analytics initialization failed:', error.message);
    }
  }

  // 生成会话ID
  generateSessionId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // 兼容性回退
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // 核心埋点方法
  async track(eventName, properties = {}) {
    // 如果服务不可用，静默失败
    if (!this.ready) {
      console.warn(`Analytics not ready, skipping event: ${eventName}`);
      return false;
    }

    const eventData = {
      version: "v1",
      eventName,
      eventId: this.generateSessionId(),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      language: navigator.language.startsWith('zh') ? 'zh' : 'en',
      routeTo: window.location.pathname,
      device: {
        ua: navigator.userAgent,
        platform: this.getPlatformType(),
        screen: `${screen.width}x${screen.height}`
      },
      eventProps: properties
    };

    try {
      const response = await fetch(`${this.baseURL}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (response.status === 204) {
        console.log(`✅ Event tracked: ${eventName}`);
        return true;
      } else if (response.status === 404) {
        console.error('❌ Analytics endpoint not found. Please check server configuration.');
        this.ready = false; // 标记为不可用
        return false;
      } else {
        console.warn(`⚠️  Analytics tracking warning for ${eventName}: HTTP ${response.status}`);
        return false;
      }
    } catch (error) {
      console.warn(`❌ Analytics tracking failed for ${eventName}:`, error.message);
      return false;
    }
  }

  // 获取平台类型
  getPlatformType() {
    const ua = navigator.userAgent;
    if (/Mobile|Android|iPhone/.test(ua)) return 'mobile';
    if (/Tablet|iPad/.test(ua)) return 'tablet';
    return 'desktop';
  }

  // 页面浏览埋点
  trackPageView(pagePath) {
    this.track('page_view', {
      pagePath: pagePath || window.location.pathname,
      pageUrl: window.location.href,
      referrer: document.referrer,
      loadTime: Math.round(performance.now())
    });
  }

  // 用户交互埋点
  trackClick(element, properties = {}) {
    const elementInfo = {
      tagName: element.tagName,
      className: element.className,
      id: element.id,
      text: element.textContent?.substring(0, 50) || ''
    };

    this.track('click', {
      ...elementInfo,
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

  trackDemoFormSubmitError(error) {
    this.track('demo_form_submit_error', {
      errorType: error.type || 'unknown',
      errorMessage: error.message,
      fillTime: Math.round(performance.now())
    });
  }

  // 检查服务状态
  async checkStatus() {
    try {
      const response = await fetch(`${this.baseURL}/healthz`);
      return {
        healthy: response.ok,
        status: response.status,
        endpoint: `${this.baseURL}/api/analytics/track`
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        endpoint: `${this.baseURL}/api/analytics/track`
      };
    }
  }
}

// 全局初始化
window.dabossAnalytics = new DaBossAnalytics();

// 自动页面浏览追踪
document.addEventListener('DOMContentLoaded', () => {
  if (window.dabossAnalytics) {
    window.dabossAnalytics.trackPageView();
  }
});

// 导出供模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DaBossAnalytics;
}

// Vue插件形式
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use({
    install(Vue) {
      Vue.prototype.$analytics = window.dabossAnalytics;
    }
  });
}

// 调试工具
window.debugAnalytics = async function() {
  const analytics = window.dabossAnalytics;
  const status = await analytics.checkStatus();
  
  console.log('=== DaBoss Analytics Debug Info ===');
  console.log('Service Status:', status);
  console.log('Ready:', analytics.ready);
  console.log('Session ID:', analytics.sessionId);
  console.log('Base URL:', analytics.baseURL);
  
  // 发送测试事件
  console.log('Sending test event...');
  const result = await analytics.track('debug_test', { 
    timestamp: new Date().toISOString(),
    debugMode: true 
  });
  console.log('Test event result:', result);
  
  return status;
};