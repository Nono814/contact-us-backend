const nodemailer = require('nodemailer');

// 邮件配置
const EMAIL_CONFIG = {
  // 管理员邮箱列表（从环境变量读取，fallback到默认值）
  adminEmails: process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['18264190169@163.com', 'zzw814@163.com'],
  
  // 发送邮箱配置（支持多种SMTP服务器）
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com', // 默认使用Gmail SMTP，支持自定义域名
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true' || false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER || 'contact@daboss.ai', // 发送邮箱
      pass: process.env.SMTP_PASS || 'your_smtp_password'   // 邮箱密码或应用专用密码
    }
  }
};

// 创建邮件发送器
const transporter = nodemailer.createTransport(EMAIL_CONFIG.smtp);

// 验证邮件配置
async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('✅ 邮件服务配置验证成功');
    console.log(`📧 SMTP配置: ${EMAIL_CONFIG.smtp.host}:${EMAIL_CONFIG.smtp.port}`);
    console.log(`👤 发送账户: ${EMAIL_CONFIG.smtp.auth.user}`);
    return true;
  } catch (error) {
    console.error('❌ 邮件服务配置验证失败:', error.message);
    console.error('🔍 详细错误信息:', error);
    
    // 针对Office 365认证失败提供具体建议
    if (error.message.includes('535') || error.message.includes('Authentication unsuccessful')) {
      console.error('');
      console.error('🚨 邮件认证失败解决建议:');
      console.error('1. 检查 contact@daboss.ai 是否启用了多重身份验证(MFA)');
      console.error('2. 如果启用了MFA，需要生成应用专用密码替换当前的SMTP_PASS');
      console.error('3. 登录 https://portal.office.com -> 安全信息 -> 应用密码 -> 新建应用密码');
      console.error('4. 将生成的应用密码更新到环境变量 SMTP_PASS 中');
      console.error('');
    }
    
    return false;
  }
}

// HTML转义函数
function escapeHtml(text) {
  if (!text) return text;
  return text.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 生成邮件HTML内容
function generateEmailHTML(service, data, submissionId) {
  const serviceNames = {
    hiring: '招聘服务',
    employerBranding: '雇主品牌服务',
    humanData: '人工数据服务',
    digitalClone: '数字克隆服务',
    other: '其他咨询'
  };

  const serviceName = serviceNames[service] || service;
  const currentTime = new Date().toLocaleString('zh-CN');

  // 根据不同服务类型生成不同的字段展示
  let fieldsHTML = '';
  
  switch (service) {
    case 'hiring':
      fieldsHTML = `
        <tr><td><strong>联系人姓名:</strong></td><td>${escapeHtml(data.name) || '-'}</td></tr>
        <tr><td><strong>邮箱地址:</strong></td><td>${escapeHtml(data.email) || '-'}</td></tr>
        <tr><td><strong>公司名称:</strong></td><td>${escapeHtml(data.company) || '-'}</td></tr>
        <tr><td><strong>公司规模:</strong></td><td>${escapeHtml(data.companySize) || '-'}</td></tr>
        <tr><td><strong>职位类型:</strong></td><td>${escapeHtml(data.roleType) || '-'}</td></tr>
        <tr><td><strong>特殊要求:</strong></td><td>${escapeHtml(data.specialRequirements) || '-'}</td></tr>
      `;
      break;
      
    case 'employerBranding':
      fieldsHTML = `
        <tr><td><strong>联系人姓名:</strong></td><td>${escapeHtml(data.employerBranding_name) || '-'}</td></tr>
        <tr><td><strong>邮箱地址:</strong></td><td>${escapeHtml(data.employerBranding_email) || '-'}</td></tr>
        <tr><td><strong>公司名称:</strong></td><td>${escapeHtml(data.employerBranding_companyName) || '-'}</td></tr>
        <tr><td><strong>公司规模:</strong></td><td>${escapeHtml(data.employerBranding_companySize) || '-'}</td></tr>
        <tr><td><strong>行业:</strong></td><td>${escapeHtml(data.industry) || '-'}</td></tr>
        <tr><td><strong>公司网站:</strong></td><td>${escapeHtml(data.website) || '-'}</td></tr>
        <tr><td><strong>附加信息:</strong></td><td>${escapeHtml(data.additionalInfo) || '-'}</td></tr>
      `;
      break;
      
    case 'humanData':
      fieldsHTML = `
        <tr><td><strong>联系人姓名:</strong></td><td>${escapeHtml(data.humanData_name) || '-'}</td></tr>
        <tr><td><strong>邮箱地址:</strong></td><td>${escapeHtml(data.humanData_email) || '-'}</td></tr>
        <tr><td><strong>数据类型:</strong></td><td>${escapeHtml(data.dataType) || '-'}</td></tr>
        <tr><td><strong>专业领域:</strong></td><td>${escapeHtml(data.expertiseArea) || '-'}</td></tr>
        <tr><td><strong>项目时间线:</strong></td><td>${escapeHtml(data.timeline) || '-'}</td></tr>
        <tr><td><strong>项目详情:</strong></td><td>${escapeHtml(data.projectDetails) || '-'}</td></tr>
      `;
      break;
      
    case 'digitalClone':
      fieldsHTML = `
        <tr><td><strong>联系人姓名:</strong></td><td>${escapeHtml(data.name) || '-'}</td></tr>
        <tr><td><strong>邮箱地址:</strong></td><td>${escapeHtml(data.email) || '-'}</td></tr>
        <tr><td><strong>专业领域:</strong></td><td>${escapeHtml(data.expertiseField) || '-'}</td></tr>
        <tr><td><strong>个人背景:</strong></td><td>${escapeHtml(data.background) || '-'}</td></tr>
      `;
      break;
      
    case 'other':
      fieldsHTML = `
        <tr><td><strong>联系人姓名:</strong></td><td>${escapeHtml(data.name) || '-'}</td></tr>
        <tr><td><strong>邮箱地址:</strong></td><td>${escapeHtml(data.email) || '-'}</td></tr>
        <tr><td><strong>公司名称:</strong></td><td>${escapeHtml(data.company) || '-'}</td></tr>
        <tr><td><strong>手机号:</strong></td><td>${escapeHtml(data.phone) || '-'}</td></tr>
        <tr><td><strong>留言内容:</strong></td><td>${escapeHtml(data.message) || '-'}</td></tr>
      `;
      break;
  }

  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>新的Contact Us提交通知</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .service-badge { display: inline-block; background: #4CAF50; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-bottom: 10px; }
            .details-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .details-table td { padding: 8px; border-bottom: 1px solid #ddd; vertical-align: top; }
            .details-table td:first-child { width: 120px; color: #666; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .urgent { background: #ff5722 !important; }
            .id-badge { background: #2196F3; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>🔔 新的Contact Us提交通知</h2>
                <p>您的官网收到了一条新的${serviceName}咨询</p>
            </div>
            <div class="content">
                <div class="service-badge ${service === 'hiring' ? 'urgent' : ''}">${serviceName}</div>
                <span class="id-badge">ID: ${submissionId}</span>
                
                <table class="details-table">
                    <tr><td><strong>提交时间:</strong></td><td>${currentTime}</td></tr>
                    ${fieldsHTML}
                </table>
                
                <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-left: 4px solid #2196F3; border-radius: 4px;">
                    <strong>💡 处理建议:</strong><br>
                    建议在24小时内回复客户咨询，可直接回复到客户邮箱地址。
                </div>
            </div>
            <div class="footer">
                <p>此邮件由Contact Us系统自动发送 | ${currentTime}</p>
                <p>管理后台: <a href="http://localhost:8080/admin">点击查看详情</a></p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// 发送邮件通知
async function sendNotification(service, data, submissionId) {
  try {
    const serviceNames = {
      hiring: '招聘服务',
      employerBranding: '雇主品牌服务', 
      humanData: '人工数据服务',
      digitalClone: '数字克隆服务',
      other: '其他咨询'
    };

    const serviceName = serviceNames[service] || service;
    const contactName = data.name || data.employerBranding_name || data.humanData_name || '未提供姓名';
    
    const mailOptions = {
      from: `"Contact Us系统" <${EMAIL_CONFIG.smtp.auth.user}>`,
      to: EMAIL_CONFIG.adminEmails.join(', '),
      subject: `🔔 新的${serviceName}咨询 - ${escapeHtml(contactName)} (ID: ${submissionId})`,
      html: generateEmailHTML(service, data, submissionId),
      // 文本版本作为备选
      text: `
        新的${serviceName}咨询提交
        
        提交时间: ${new Date().toLocaleString('zh-CN')}
        联系人: ${contactName}
        邮箱: ${data.email || data.employerBranding_email || data.humanData_email}
        
        详细信息请查看邮件HTML版本或登录管理后台。
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ 邮件通知发送成功 - ${serviceName} - ID: ${submissionId}`);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ 邮件发送失败:', error);
    // 邮件发送失败不应该影响主流程，只记录错误
    return { success: false, error: error.message };
  }
}

// 发送Demo预约邮件通知
async function sendDemoBookingNotification(bookingData) {
  try {
    const {
      bookingId,
      firstName,
      lastName,
      email,
      company,
      roles,
      mainGoal,
      budget,
      emailUpdates,
      language,
      timestamp,
      fieldLabels
    } = bookingData;

    const currentTime = new Date(timestamp).toLocaleString('zh-CN');
    
    // 获取角色标签
    const roleLabels = roles.map(role => {
      const roleLabel = fieldLabels.roles[role];
      return language === 'zh' ? roleLabel.label_zh : roleLabel.label_en;
    }).join(', ');

    // 获取其他字段标签
    const mainGoalLabel = fieldLabels.mainGoal[mainGoal];
    const budgetLabel = fieldLabels.budget[budget];
    const emailUpdatesLabel = fieldLabels.emailUpdates[emailUpdates];

    const mainGoalText = language === 'zh' ? mainGoalLabel.label_zh : mainGoalLabel.label_en;
    const budgetText = language === 'zh' ? budgetLabel.label_zh : budgetLabel.label_en;
    const emailUpdatesText = language === 'zh' ? emailUpdatesLabel.label_zh : emailUpdatesLabel.label_en;

    const subject = `[Demo预约] ${escapeHtml(company)} - ${escapeHtml(firstName)} ${escapeHtml(lastName)}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>新的Demo预约申请</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
              .booking-badge { display: inline-block; background: #FF5722; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-bottom: 10px; }
              .details-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              .details-table td { padding: 8px; border-bottom: 1px solid #ddd; vertical-align: top; }
              .details-table td:first-child { width: 120px; color: #666; font-weight: bold; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
              .id-badge { background: #2196F3; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
              .urgent-note { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 15px 0; border-radius: 4px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h2>🎯 新的Demo预约申请</h2>
                  <p>收到了一个新的产品演示预约请求</p>
              </div>
              <div class="content">
                  <div class="booking-badge">Demo预约</div>
                  <span class="id-badge">ID: ${bookingId}</span>
                  
                  <h3>基本信息：</h3>
                  <table class="details-table">
                      <tr><td>姓名:</td><td>${escapeHtml(firstName)} ${escapeHtml(lastName)}</td></tr>
                      <tr><td>邮箱:</td><td>${escapeHtml(email)}</td></tr>
                      <tr><td>公司:</td><td>${escapeHtml(company)}</td></tr>
                  </table>
                  
                  <h3>详细信息：</h3>
                  <table class="details-table">
                      <tr><td>职位:</td><td>${escapeHtml(roleLabels)}</td></tr>
                      <tr><td>主要需求:</td><td>${escapeHtml(mainGoalText)}</td></tr>
                      <tr><td>预算范围:</td><td>${escapeHtml(budgetText)}</td></tr>
                      <tr><td>邮件订阅:</td><td>${escapeHtml(emailUpdatesText)}</td></tr>
                      <tr><td>语言偏好:</td><td>${language === 'zh' ? '中文' : '英文'}</td></tr>
                  </table>
                  
                  <table class="details-table">
                      <tr><td>提交时间:</td><td>${currentTime}</td></tr>
                      <tr><td>提交ID:</td><td>${bookingId}</td></tr>
                  </table>
                  
                  <div class="urgent-note">
                      <strong>⏰ 处理建议：</strong><br>
                      请及时联系客户安排Demo演示。建议在1个工作日内回复客户。
                  </div>
              </div>
              <div class="footer">
                  <p>此邮件由Demo预约系统自动发送 | ${currentTime}</p>
              </div>
          </div>
      </body>
      </html>
    `;

    const textContent = `
新的Demo预约申请

基本信息：
- 姓名：${firstName} ${lastName}
- 邮箱：${email}
- 公司：${company}

详细信息：
- 职位：${roleLabels}
- 主要需求：${mainGoalText}
- 预算范围：${budgetText}
- 邮件订阅：${emailUpdatesText}

提交时间：${currentTime}
提交ID：${bookingId}

请及时联系客户安排Demo演示。
    `;

    const mailOptions = {
      from: `"Demo预约系统" <${EMAIL_CONFIG.smtp.auth.user}>`,
      to: process.env.DEMO_NOTIFICATION_EMAIL || EMAIL_CONFIG.adminEmails.join(', '),
      subject: subject,
      html: htmlContent,
      text: textContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Demo预约邮件通知发送成功 - ID: ${bookingId}`);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Demo预约邮件发送失败:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendNotification,
  sendDemoBookingNotification,
  verifyEmailConfig,
  EMAIL_CONFIG
};