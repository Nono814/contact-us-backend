const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');
const { sendDemoBookingNotification } = require('../services/emailNotification');

// 专门的频率限制 - 每5分钟最多1次预约请求
const demoBookingLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5分钟
  max: 1, // 最多1次请求
  message: {
    success: false,
    message: 'Too many demo booking requests, please try again later',
    error_code: 'RATE_LIMIT_EXCEEDED'
  },
  // 简化代理配置
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // 获取客户端IP，结合邮箱作为限制键
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    return clientIp + '_' + (req.body.email || 'no-email');
  }
});

// 字段选项验证映射
const fieldOptions = {
  roles: ['research', 'engineering', 'product', 'operations', 'recruiting', 'executive', 'procurement', 'other'],
  mainGoal: ['aiTraining', 'hiring', 'platform'],
  budget: ['large', 'medium', 'small', 'explore'],
  emailUpdates: ['yes', 'no'],
  language: ['en', 'zh']
};

// 字段标签映射
const fieldLabels = {
  roles: {
    research: { label_en: 'Research', label_zh: '研究' },
    engineering: { label_en: 'Engineering', label_zh: '工程技术' },
    product: { label_en: 'Product', label_zh: '产品' },
    operations: { label_en: 'Operations', label_zh: '运营' },
    recruiting: { label_en: 'Recruiting / HR', label_zh: '招聘 / 人力资源' },
    executive: { label_en: 'Executive', label_zh: '高管' },
    procurement: { label_en: 'Procurement / Legal', label_zh: '采购 / 法务' },
    other: { label_en: 'Other', label_zh: '其他' }
  },
  mainGoal: {
    aiTraining: { 
      label_en: 'Finding talent for AI training data & evaluation', 
      label_zh: '寻找AI训练数据与评估相关人才' 
    },
    hiring: { 
      label_en: 'Hiring full-time or contract workers to join my team', 
      label_zh: '招聘全职或合同员工加入我的团队' 
    },
    platform: { 
      label_en: 'I want to learn more about your platform', 
      label_zh: '我想了解更多关于您的平台' 
    }
  },
  budget: {
    large: { 
      label_en: '> $200,000 / quarter (10+ people)', 
      label_zh: '> ¥200万 / 季度 (10+ 人)' 
    },
    medium: { 
      label_en: '$50,000 - $200,000 / quarter (3 - 10 people)', 
      label_zh: '¥50万 - ¥200万 / 季度 (3 - 10 人)' 
    },
    small: { 
      label_en: '< $50,000 / quarter (1 - 2 people)', 
      label_zh: '< ¥50万 / 季度 (1 - 2 人)' 
    },
    explore: { 
      label_en: 'No specific project in mind yet, I just want to learn more', 
      label_zh: '暂无具体项目，只想了解更多' 
    }
  },
  emailUpdates: {
    yes: { label_en: 'Yes', label_zh: '是的' },
    no: { label_en: 'Not right now', label_zh: '暂时不需要' }
  }
};

// 数据验证函数
function validateDemoBooking(data) {
  const errors = {};

  // 验证必填字段
  if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim().length === 0) {
    errors.firstName = 'First name is required';
  } else if (data.firstName.length > 50) {
    errors.firstName = 'First name must be 50 characters or less';
  }

  if (!data.lastName || typeof data.lastName !== 'string' || data.lastName.trim().length === 0) {
    errors.lastName = 'Last name is required';
  } else if (data.lastName.length > 50) {
    errors.lastName = 'Last name must be 50 characters or less';
  }

  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || typeof data.email !== 'string' || !emailRegex.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (!data.company || typeof data.company !== 'string' || data.company.trim().length === 0) {
    errors.company = 'Company name is required';
  } else if (data.company.length > 100) {
    errors.company = 'Company name must be 100 characters or less';
  }

  // 验证roles数组
  if (!Array.isArray(data.roles) || data.roles.length === 0) {
    errors.roles = 'At least one role must be selected';
  } else {
    const invalidRoles = data.roles.filter(role => !fieldOptions.roles.includes(role));
    if (invalidRoles.length > 0) {
      errors.roles = `Invalid role options: ${invalidRoles.join(', ')}`;
    }
  }

  // 验证选择字段
  if (!fieldOptions.mainGoal.includes(data.mainGoal)) {
    errors.mainGoal = 'Invalid main goal option';
  }

  if (!fieldOptions.budget.includes(data.budget)) {
    errors.budget = 'Invalid budget option';
  }

  if (!fieldOptions.emailUpdates.includes(data.emailUpdates)) {
    errors.emailUpdates = 'Invalid email updates option';
  }

  // 验证可选字段
  if (data.language && !fieldOptions.language.includes(data.language)) {
    errors.language = 'Invalid language option';
  }

  if (data.timestamp) {
    const timestamp = new Date(data.timestamp);
    if (isNaN(timestamp.getTime())) {
      errors.timestamp = 'Invalid timestamp format';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// 生成唯一ID
function generateBookingId() {
  const timestamp = new Date().toISOString().replace(/[:\-T]/g, '').split('.')[0];
  const random = Math.random().toString(36).substring(2, 8);
  return `db_${timestamp}_${random}`;
}

// Demo预约接口
router.post('/demo-booking', demoBookingLimiter, async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 15);
  
  console.log(`[${requestId}] Demo booking request started`);

  let connection = null;
  
  try {
    // 数据验证
    const validation = validateDemoBooking(req.body);
    if (!validation.isValid) {
      console.log(`[${requestId}] Validation failed:`, validation.errors);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validation.errors
      });
    }

    const {
      firstName,
      lastName,
      email,
      company,
      roles,
      mainGoal,
      budget,
      emailUpdates,
      language = 'en',
      timestamp: userTimestamp
    } = req.body;

    // 时间戳处理（用于邮件通知）
    const timestamp = userTimestamp ? new Date(userTimestamp) : new Date();

    // 获取数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    // 检查是否存在重复提交（相同邮箱在5分钟内）
    const [duplicateCheck] = await connection.execute(
      'SELECT id FROM demo_bookings WHERE email = ? AND created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)',
      [email.trim().toLowerCase()]
    );

    if (duplicateCheck.length > 0) {
      console.log(`[${requestId}] Duplicate submission detected for email: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'A demo booking with this email was already submitted recently',
        error_code: 'DUPLICATE_SUBMISSION'
      });
    }

    // 插入数据库 - 适配实际表结构
    const [result] = await connection.execute(
      `INSERT INTO demo_bookings 
       (first_name, last_name, email, company, roles, main_goal, budget, email_updates, language, user_ip, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName.trim(),
        lastName.trim(),
        email.trim().toLowerCase(),
        company.trim(),
        JSON.stringify(roles),
        mainGoal,
        budget,
        emailUpdates,
        language,
        req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip || 'unknown',
        req.headers['user-agent'] || 'unknown'
      ]
    );

    // 获取自动生成的ID
    const generatedId = result.insertId;

    console.log(`[${requestId}] Demo booking saved with ID: ${generatedId}`);

    // 异步发送邮件通知
    setImmediate(async () => {
      try {
        await sendDemoBookingNotification({
          bookingId: `db_${generatedId}`,
          firstName,
          lastName,
          email,
          company,
          roles,
          mainGoal,
          budget,
          emailUpdates,
          language,
          timestamp: new Date().toISOString(),
          fieldLabels
        });
        console.log(`[${requestId}] Email notification sent successfully`);
      } catch (emailError) {
        console.error(`[${requestId}] Failed to send email notification:`, emailError);
      }
    });

    const processingTime = Date.now() - startTime;
    console.log(`[${requestId}] Demo booking completed in ${processingTime}ms`);

    // 返回成功响应
    res.status(200).json({
      success: true,
      message: 'Demo booking submitted successfully',
      id: `db_${generatedId}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[${requestId}] Demo booking error (${processingTime}ms):`, {
      message: error.message,
      stack: error.stack,
      sql: error.sql
    });

    const errorId = `err_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error_id: errorId
    });
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        console.error(`[${requestId}] Error closing database connection:`, closeError);
      }
    }
  }
});

module.exports = router;