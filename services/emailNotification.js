const nodemailer = require('nodemailer');

// 邮件配置
const EMAIL_CONFIG = {
  // 管理员邮箱列表
  adminEmails: ['18264190169@163.com', 'zzw814@163.com'],
  
  // 发送邮箱配置（可以使用163邮箱）
  smtp: {
    host: 'smtp.163.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER || '18264190169@163.com', // 发送邮箱
      pass: process.env.SMTP_PASS || 'your_smtp_password'   // 邮箱授权码
    }
  }
};

// 创建邮件发送器
const transporter = nodemailer.createTransport(EMAIL_CONFIG.smtp);

// 验证邮件配置
async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('邮件服务配置验证成功');
    return true;
  } catch (error) {
    console.error('邮件服务配置验证失败:', error.message);
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

module.exports = {
  sendNotification,
  verifyEmailConfig,
  EMAIL_CONFIG
};