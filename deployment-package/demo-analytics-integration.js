/**
 * Book a Demo 页面埋点集成示例
 * 用于追踪用户在Demo预约页面的行为
 */

// 埋点工具类
class DemoAnalytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.formStartTime = null;
    this.formStarted = false;
    this.interactionCount = 0;
    this.maxScrollDepth = 0;
    
    this.init();
  }

  // 生成会话ID
  generateSessionId() {
    return crypto.randomUUID();
  }

  // 获取当前语言
  getCurrentLanguage() {
    return document.documentElement.lang || 'en';
  }

  // 获取平台类型
  getPlatformType() {
    const ua = navigator.userAgent;
    if (/Mobile|Android|iPhone|iPad/.test(ua)) return 'mobile';
    if (/Tablet|iPad/.test(ua)) return 'tablet';
    return 'desktop';
  }

  // 核心埋点方法
  async track(eventName, properties = {}) {
    const eventData = {
      eventName,
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      language: this.getCurrentLanguage(),
      routeTo: '/demo-booking',
      device: {
        ua: navigator.userAgent,
        platform: this.getPlatformType(),
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

  // 初始化
  init() {
    this.trackPageView();
    this.setupFormTracking();
    this.setupScrollTracking();
    this.setupExitTracking();
  }

  // 1. 页面浏览埋点
  trackPageView() {
    this.track('demo_page_view', {
      referrer: document.referrer,
      pageUrl: window.location.href,
      loadTime: Math.round(performance.now())
    });
  }

  // 2. 表单交互埋点设置
  setupFormTracking() {
    const form = document.getElementById('demo-form');
    if (!form) return;

    // 表单开始埋点
    form.addEventListener('focusin', (e) => {
      if (e.target.matches('input, select, textarea') && !this.formStarted) {
        this.formStartTime = performance.now();
        this.formStarted = true;
        
        this.track('demo_form_start', {
          formId: 'demo-booking-form',
          firstField: e.target.name,
          timeOnPageBeforeStart: Math.round(this.formStartTime)
        });
      }
    });

    // 字段焦点埋点
    form.addEventListener('focusin', (e) => {
      if (e.target.matches('input, select, textarea')) {
        this.interactionCount++;
        
        this.track('demo_form_field_focus', {
          fieldName: e.target.name,
          fieldType: e.target.type,
          timeFromFormStart: this.formStartTime ? Math.round(performance.now() - this.formStartTime) : 0
        });
      }
    });

    // 表单提交埋点
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // 提交尝试埋点
      this.track('demo_form_submit_attempt', {
        fillTime: this.formStartTime ? Math.round(performance.now() - this.formStartTime) : 0,
        completionRate: this.getFormCompletionRate(form)
      });

      // 执行实际提交
      await this.handleFormSubmit(form);
    });
  }

  // 表单提交处理
  async handleFormSubmit(form) {
    try {
      const formData = new FormData(form);
      const jsonData = Object.fromEntries(formData);
      
      const response = await fetch('/api/demo-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
      });

      if (response.ok) {
        const result = await response.json();
        
        // 成功埋点
        this.track('demo_form_submit_success', {
          bookingId: result.id,
          formData: {
            roles: jsonData.roles,
            mainGoal: jsonData.mainGoal,
            budget: jsonData.budget,
            language: jsonData.language,
            company: jsonData.company
          },
          fillTime: this.formStartTime ? Math.round(performance.now() - this.formStartTime) : 0,
          retryCount: 0
        });

        // 重定向到成功页面
        window.location.href = '/demo-success';
        
      } else {
        const error = await response.json();
        
        // 失败埋点
        this.track('demo_form_submit_error', {
          errorType: 'validation',
          errorMessage: error.message,
          httpStatus: response.status,
          errors: error.errors,
          fillTime: this.formStartTime ? Math.round(performance.now() - this.formStartTime) : 0
        });

        // 显示错误信息
        this.showValidationErrors(error.errors);
      }
      
    } catch (error) {
      // 网络错误埋点
      this.track('demo_form_submit_error', {
        errorType: 'network',
        errorMessage: error.message,
        fillTime: this.formStartTime ? Math.round(performance.now() - this.formStartTime) : 0
      });

      alert('提交失败，请检查网络连接后重试');
    }
  }

  // 计算表单完成率
  getFormCompletionRate(form) {
    const allFields = form.querySelectorAll('input[required], select[required], textarea[required]');
    const filledFields = Array.from(allFields).filter(field => {
      if (field.type === 'checkbox' || field.type === 'radio') {
        return field.checked;
      }
      return field.value.trim() !== '';
    });
    
    return allFields.length > 0 ? filledFields.length / allFields.length : 0;
  }

  // 显示验证错误
  showValidationErrors(errors) {
    // 清除之前的错误
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // 显示新错误
    Object.keys(errors).forEach(fieldName => {
      const field = document.querySelector(`[name="${fieldName}"]`);
      if (field) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = 'red';
        errorDiv.style.fontSize = '12px';
        errorDiv.textContent = errors[fieldName];
        field.parentNode.appendChild(errorDiv);
      }
    });
  }

  // 3. 滚动深度追踪
  setupScrollTracking() {
    let ticking = false;
    
    const updateScrollDepth = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollPercent);
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDepth);
        ticking = true;
      }
    });
  }

  // 4. 页面退出埋点
  setupExitTracking() {
    const trackExit = (exitMethod) => {
      const exitData = {
        timeOnPage: Math.round(performance.now()),
        exitMethod,
        formCompleted: window.location.href.includes('/demo-success'),
        scrollDepth: this.maxScrollDepth,
        interactions: this.interactionCount
      };

      // 使用sendBeacon确保数据发送
      const eventData = {
        eventName: 'demo_page_exit',
        eventId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        eventProps: exitData
      };

      navigator.sendBeacon('/api/analytics/track', JSON.stringify(eventData));
    };

    // 页面关闭/刷新
    window.addEventListener('beforeunload', () => {
      trackExit('navigate_away');
    });

    // 页面隐藏（切换标签页等）
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        trackExit('page_hidden');
      }
    });
  }

  // 5. 表单放弃埋点
  trackFormAbandon(abandonedField) {
    if (!this.formStarted) return;

    const form = document.getElementById('demo-form');
    const filledFields = this.getFilledFields(form);
    
    this.track('demo_form_abandon', {
      abandonAt: abandonedField,
      completionRate: this.getFormCompletionRate(form),
      fillTime: this.formStartTime ? Math.round(performance.now() - this.formStartTime) : 0,
      filledFields: filledFields,
      totalFields: form.querySelectorAll('input, select, textarea').length,
      exitMethod: 'navigate_away'
    });
  }

  // 获取已填写字段
  getFilledFields(form) {
    const fields = form.querySelectorAll('input, select, textarea');
    return Array.from(fields)
      .filter(field => field.value.trim() !== '')
      .map(field => field.name);
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  window.demoAnalytics = new DemoAnalytics();
});

// 导出给其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DemoAnalytics;
}