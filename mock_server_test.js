#!/usr/bin/env node

const express = require('express');
const cors = require('cors');

// 模拟数据库操作
const mockDB = {
  records: [],
  
  async insertBooking(data) {
    const record = {
      id: Math.floor(Math.random() * 10000) + 1,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.records.push(record);
    return record;
  },
  
  async findBookings(query = {}) {
    let results = [...this.records];
    
    if (query.email) {
      results = results.filter(r => r.email === query.email);
    }
    if (query.id) {
      results = results.filter(r => r.id == query.id);
    }
    
    return results;
  }
};

// 从routes/demoBooking.js复制的验证函数
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

  // 手机号验证（可选字段）
  if (data.phone) {
    if (typeof data.phone !== 'string') {
      errors.phone = 'Phone must be a string';
    } else if (data.phone.length > 20) {
      errors.phone = 'Phone must be 20 characters or less';
    }
  }

  if (!data.company || typeof data.company !== 'string' || data.company.trim().length === 0) {
    errors.company = 'Company name is required';
  } else if (data.company.length > 100) {
    errors.company = 'Company name must be 100 characters or less';
  }

  // 验证roles数组
  const fieldOptions = {
    roles: ['research', 'engineering', 'product', 'operations', 'recruiting', 'executive', 'procurement', 'other'],
    mainGoal: ['aiTraining', 'hiring', 'platform'],
    budget: ['large', 'medium', 'small', 'explore'],
    emailUpdates: ['yes', 'no'],
    language: ['en', 'zh']
  };

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

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// 创建Express应用
const app = express();
const PORT = 3001; // 使用不同端口避免冲突

// 中间件
app.use(cors());
app.use(express.json());

// POST接口 - 创建预约
app.post('/api/demo-booking', async (req, res) => {
  const requestId = Math.random().toString(36).substring(2, 15);
  console.log(`[${requestId}] 收到POST请求:`, JSON.stringify(req.body, null, 2));

  try {
    // 数据验证
    const validation = validateDemoBooking(req.body);
    if (!validation.isValid) {
      console.log(`[${requestId}] 验证失败:`, validation.errors);
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
      phone,
      company,
      roles,
      mainGoal,
      budget,
      emailUpdates,
      language = 'en'
    } = req.body;

    // 检查重复提交（简单版本）
    const existingRecords = await mockDB.findBookings({ email: email.trim().toLowerCase() });
    if (existingRecords.length > 0) {
      const recentRecord = existingRecords.find(r => {
        const timeDiff = Date.now() - new Date(r.created_at).getTime();
        return timeDiff < 5 * 60 * 1000; // 5分钟内
      });
      
      if (recentRecord) {
        console.log(`[${requestId}] 重复提交检测到`);
        return res.status(400).json({
          success: false,
          message: 'A demo booking with this email was already submitted recently',
          error_code: 'DUPLICATE_SUBMISSION'
        });
      }
    }

    // 保存到模拟数据库
    const savedRecord = await mockDB.insertBooking({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      company: company.trim(),
      roles: JSON.stringify(roles),
      mainGoal,
      budget,
      emailUpdates,
      language
    });

    console.log(`[${requestId}] 预约保存成功，ID: ${savedRecord.id}`);
    console.log(`[${requestId}] phone字段值: ${savedRecord.phone || 'null'}`);

    // 返回成功响应
    res.status(200).json({
      success: true,
      message: 'Demo booking submitted successfully',
      id: `db_${savedRecord.id}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`[${requestId}] 处理错误:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error_id: `err_${Date.now().toString(36)}`
    });
  }
});

// GET接口 - 查询预约
app.get('/api/demo-booking', async (req, res) => {
  const requestId = Math.random().toString(36).substring(2, 15);
  console.log(`[${requestId}] 收到GET请求:`, req.query);

  try {
    const { id, email, limit = 10, offset = 0 } = req.query;
    
    // 查询数据
    let results = await mockDB.findBookings({ id, email });
    
    // 分页
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    results = results.slice(startIndex, endIndex);
    
    // 格式化返回数据
    const bookings = results.map(row => ({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phone: row.phone, // 重点：确保包含phone字段
      company: row.company,
      roles: JSON.parse(row.roles || '[]'),
      mainGoal: row.mainGoal,
      budget: row.budget,
      emailUpdates: row.emailUpdates,
      language: row.language,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    console.log(`[${requestId}] 查询完成，返回${bookings.length}条记录`);
    if (bookings.length > 0) {
      console.log(`[${requestId}] 示例记录phone字段:`, bookings[0].phone);
    }

    res.status(200).json({
      success: true,
      data: bookings,
      count: bookings.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`[${requestId}] 查询错误:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error_id: `err_${Date.now().toString(36)}`
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log('🚀 Mock服务器启动成功!');
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`📋 POST接口: http://localhost:${PORT}/api/demo-booking`);
  console.log(`📋 GET接口: http://localhost:${PORT}/api/demo-booking`);
  console.log('');
  console.log('✅ 支持phone字段功能:');
  console.log('  • POST请求中phone字段为可选参数');
  console.log('  • phone字段最大长度20字符'); 
  console.log('  • GET请求返回数据包含phone字段');
  console.log('');
  console.log('🧪 运行测试请执行: node simple_phone_test.js');
  console.log('💡 或者使用curl命令直接测试接口');
});

// 导出模块
module.exports = { app, mockDB, validateDemoBooking };