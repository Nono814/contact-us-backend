const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { sendNotification } = require('../services/emailNotification');

// 获取客户端IP地址
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

// 获取用户代理
function getUserAgent(req) {
  return req.headers['user-agent'] || '';
}

// 验证邮箱格式
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 通用表单提交处理
router.post('/contact', async (req, res) => {
  try {
    const { service, _language = 'en', ...formData } = req.body;
    
    // 验证必填字段
    if (!service) {
      return res.status(400).json({
        success: false,
        error: 'Service type is required'
      });
    }

    const clientIP = getClientIP(req);
    const userAgent = getUserAgent(req);
    const language = _language || 'en';

    let result;
    
    switch (service) {
      case 'hiring':
        result = await handleHiringSubmission(formData, language, clientIP, userAgent);
        break;
      case 'employerBranding':
        result = await handleEmployerBrandingSubmission(formData, language, clientIP, userAgent);
        break;
      case 'humanData':
        result = await handleHumanDataSubmission(formData, language, clientIP, userAgent);
        break;
      case 'digitalClone':
        result = await handleDigitalCloneSubmission(formData, language, clientIP, userAgent);
        break;
      case 'other':
        result = await handleOtherInquirySubmission(formData, language, clientIP, userAgent);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid service type'
        });
    }

    // 发送邮件通知（异步执行，不阻塞响应）
    sendNotification(service, formData, result.insertId).catch(error => {
      console.error('邮件通知发送失败，但不影响主流程:', error);
    });

    res.json({
      success: true,
      message: 'Contact form submitted successfully',
      id: result.insertId,
      redirectUrl: `/thank-you?lang=${language}`
    });

  } catch (error) {
    console.error('表单提交错误:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process contact form submission'
    });
  }
});

// 处理招聘服务提交
async function handleHiringSubmission(data, language, ip, userAgent) {
  // 兼容多种字段名格式
  const name = data.name || data.hiring_name || data.hiringName;
  const email = data.email || data.hiring_email || data.hiringEmail;
  const { company, companySize, roleType, specialRequirements } = data;
  
  if (!name || !email || name.trim() === '' || email.trim() === '') {
    console.log('Missing fields - received data:', JSON.stringify(data, null, 2));
    throw new Error('Name and email are required');
  }
  
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  const sql = `
    INSERT INTO hiring_submissions 
    (language, name, email, company, company_size, role_type, special_requirements, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  return await query(sql, [
    language, name, email, company || null, companySize || null, roleType || null, specialRequirements || null, ip, userAgent
  ]);
}

// 处理雇主品牌服务提交
async function handleEmployerBrandingSubmission(data, language, ip, userAgent) {
  const { 
    employerBranding_companyName, 
    employerBranding_email, 
    employerBranding_name,
    employerBranding_companySize,
    industry,
    website,
    additionalInfo
  } = data;
  
  if (!employerBranding_name || !employerBranding_email || !employerBranding_companyName || 
      employerBranding_name.trim() === '' || employerBranding_email.trim() === '' || employerBranding_companyName.trim() === '') {
    throw new Error('Name, email and company name are required');
  }
  
  if (!isValidEmail(employerBranding_email)) {
    throw new Error('Invalid email format');
  }

  const sql = `
    INSERT INTO employer_branding_submissions 
    (language, name, email, company_name, company_size, industry, website, additional_info, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  return await query(sql, [
    language, 
    employerBranding_name, 
    employerBranding_email, 
    employerBranding_companyName,
    employerBranding_companySize || null, 
    industry || null, 
    website || null, 
    additionalInfo || null, 
    ip, 
    userAgent
  ]);
}

// 处理人工数据服务提交
async function handleHumanDataSubmission(data, language, ip, userAgent) {
  const { 
    humanData_name, 
    humanData_email, 
    dataType, 
    expertiseArea, 
    timeline, 
    projectDetails 
  } = data;
  
  if (!humanData_name || !humanData_email || humanData_name.trim() === '' || humanData_email.trim() === '') {
    throw new Error('Name and email are required');
  }
  
  if (!isValidEmail(humanData_email)) {
    throw new Error('Invalid email format');
  }

  const sql = `
    INSERT INTO human_data_submissions 
    (language, name, email, data_type, expertise_area, timeline, project_details, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  return await query(sql, [
    language, 
    humanData_name, 
    humanData_email, 
    dataType || null, 
    expertiseArea || null, 
    timeline || null, 
    projectDetails || null, 
    ip, 
    userAgent
  ]);
}

// 处理数字克隆服务提交
async function handleDigitalCloneSubmission(data, language, ip, userAgent) {
  const { 
    name, 
    email, 
    expertiseField
  } = data;
  
  // 获取background字段，支持多种可能的字段名
  const background = data.background || data.backgroundDescription || null;
  
  if (!name || !email || name.trim() === '' || email.trim() === '') {
    throw new Error('Name and email are required');
  }
  
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  const sql = `
    INSERT INTO digital_clone_submissions 
    (language, name, email, expertise_field, background, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  return await query(sql, [
    language, 
    name, 
    email, 
    expertiseField || null, 
    background || null, 
    ip, 
    userAgent
  ]);
}

// 处理其他咨询提交
async function handleOtherInquirySubmission(data, language, ip, userAgent) {
  const { name, email, company, phone, message } = data;
  
  if (!name || !email || !message || name.trim() === '' || email.trim() === '' || message.trim() === '') {
    throw new Error('Name, email and message are required');
  }
  
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  const sql = `
    INSERT INTO other_inquiries 
    (language, name, email, company, phone, message, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  return await query(sql, [
    language, name, email, company || null, phone || null, message, ip, userAgent
  ]);
}

module.exports = router; 