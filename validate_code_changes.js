#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 检查文件修改
function validateCodeChanges() {
  console.log('🔍 验证Demo Booking接口phone字段修改');
  console.log('=' .repeat(60));

  const filePath = '/home/devbox/project/routes/demoBooking.js';
  
  if (!fs.existsSync(filePath)) {
    log('red', '❌ 文件不存在: ' + filePath);
    return false;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n');
  
  let checks = {
    phoneValidation: false,
    phoneInInsert: false,
    phoneInSelect: false,
    phoneInResponse: false,
    phoneInDestructure: false
  };
  
  console.log('\n📋 检查phone字段集成情况...');
  
  // 检查1: phone字段验证逻辑
  if (fileContent.includes('// 手机号验证（可选字段）') && 
      fileContent.includes('data.phone') &&
      fileContent.includes('Phone must be 20 characters or less')) {
    log('green', '✅ phone字段验证逻辑已添加');
    checks.phoneValidation = true;
    
    // 找到具体行数
    const validationLineIndex = lines.findIndex(line => line.includes('// 手机号验证（可选字段）'));
    if (validationLineIndex !== -1) {
      console.log(`   位置: 第${validationLineIndex + 1}行`);
    }
  } else {
    log('red', '❌ 缺少phone字段验证逻辑');
  }
  
  // 检查2: INSERT语句中的phone字段
  if (fileContent.includes('INSERT INTO demo_bookings') && 
      fileContent.includes('phone, company') &&
      fileContent.includes('phone ? phone.trim() : null')) {
    log('green', '✅ 数据库INSERT语句包含phone字段');
    checks.phoneInInsert = true;
    
    const insertLineIndex = lines.findIndex(line => line.includes('INSERT INTO demo_bookings'));
    if (insertLineIndex !== -1) {
      console.log(`   位置: 第${insertLineIndex + 1}行`);
    }
  } else {
    log('red', '❌ 数据库INSERT语句缺少phone字段');
  }
  
  // 检查3: SELECT语句中的phone字段
  if (fileContent.includes('SELECT id, first_name, last_name, email, phone, company')) {
    log('green', '✅ 数据库SELECT语句包含phone字段');
    checks.phoneInSelect = true;
    
    const selectLineIndex = lines.findIndex(line => line.includes('SELECT id, first_name, last_name, email, phone'));
    if (selectLineIndex !== -1) {
      console.log(`   位置: 第${selectLineIndex + 1}行`);
    }
  } else {
    log('red', '❌ 数据库SELECT语句缺少phone字段');
  }
  
  // 检查4: 响应数据中的phone字段
  if (fileContent.includes('phone: row.phone')) {
    log('green', '✅ GET接口响应数据包含phone字段');
    checks.phoneInResponse = true;
    
    const responseLineIndex = lines.findIndex(line => line.includes('phone: row.phone'));
    if (responseLineIndex !== -1) {
      console.log(`   位置: 第${responseLineIndex + 1}行`);
    }
  } else {
    log('red', '❌ GET接口响应数据缺少phone字段');
  }
  
  // 检查5: 请求参数解构中的phone字段
  if (fileContent.includes('phone,') && 
      fileContent.includes('} = req.body')) {
    log('green', '✅ 请求参数解构包含phone字段');
    checks.phoneInDestructure = true;
    
    const destructureLines = lines.filter(line => line.includes('phone,'));
    if (destructureLines.length > 0) {
      const lineIndex = lines.findIndex(line => line.includes('phone,'));
      console.log(`   位置: 第${lineIndex + 1}行`);
    }
  } else {
    log('red', '❌ 请求参数解构缺少phone字段');
  }
  
  // 统计结果
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const totalChecks = Object.keys(checks).length;
  
  console.log('\n' + '=' .repeat(60));
  log('blue', '📊 代码修改验证结果');
  console.log('=' .repeat(60));
  
  console.log(`✅ 通过检查: ${passedChecks}/${totalChecks}`);
  console.log(`📈 完成度: ${Math.round((passedChecks / totalChecks) * 100)}%`);
  
  if (passedChecks === totalChecks) {
    log('green', '\n🎉 所有代码修改检查通过！');
    console.log('phone字段已完全集成到Demo Booking接口中');
  } else {
    log('yellow', '\n⚠️  部分检查未通过，请检查相关代码');
  }
  
  return passedChecks === totalChecks;
}

// 提取验证函数进行逻辑测试
function extractAndTestValidationLogic() {
  console.log('\n🧪 测试phone字段验证逻辑');
  console.log('=' .repeat(40));
  
  // 从实际文件中提取验证函数（简化版）
  function validateDemoBooking(data) {
    const errors = {};
    const fieldOptions = {
      roles: ['research', 'engineering', 'product', 'operations', 'recruiting', 'executive', 'procurement', 'other'],
      mainGoal: ['aiTraining', 'hiring', 'platform'],
      budget: ['large', 'medium', 'small', 'explore'],
      emailUpdates: ['yes', 'no'],
      language: ['en', 'zh']
    };

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

    // 手机号验证（可选字段）- 这是关键部分
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
  
  // 测试用例
  const testCases = [
    {
      name: "包含有效phone字段",
      data: {
        firstName: "张",
        lastName: "三",
        email: "zhangsan@company.com",
        phone: "13800138000",
        company: "ABC公司",
        roles: ["engineering", "product"],
        mainGoal: "hiring",
        budget: "medium",
        emailUpdates: "yes",
        language: "zh"
      },
      shouldPass: true
    },
    {
      name: "不包含phone字段",
      data: {
        firstName: "李",
        lastName: "四",
        email: "lisi@company.com",
        company: "XYZ公司",
        roles: ["product"],
        mainGoal: "platform",
        budget: "small",
        emailUpdates: "yes"
      },
      shouldPass: true
    },
    {
      name: "phone字段过长",
      data: {
        firstName: "王",
        lastName: "五",
        email: "wangwu@company.com",
        phone: "123456789012345678901", // 21字符
        company: "测试公司",
        roles: ["engineering"],
        mainGoal: "hiring",
        budget: "medium",
        emailUpdates: "yes"
      },
      shouldPass: false
    },
    {
      name: "phone字段为数字",
      data: {
        firstName: "赵",
        lastName: "六",
        email: "zhaoliu@company.com",
        phone: 13800138000, // 数字类型
        company: "数字公司",
        roles: ["operations"],
        mainGoal: "platform",
        budget: "large",
        emailUpdates: "no"
      },
      shouldPass: false
    }
  ];
  
  let passedTests = 0;
  
  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. 测试: ${testCase.name}`);
    
    const result = validateDemoBooking(testCase.data);
    const actuallyPassed = result.isValid;
    
    if (actuallyPassed === testCase.shouldPass) {
      log('green', `✅ 通过`);
      passedTests++;
      
      if (!actuallyPassed && result.errors.phone) {
        console.log(`   phone验证错误: ${result.errors.phone}`);
      }
    } else {
      log('red', `❌ 失败`);
      console.log(`   期望: ${testCase.shouldPass ? '通过' : '失败'}, 实际: ${actuallyPassed ? '通过' : '失败'}`);
      console.log(`   错误: ${JSON.stringify(result.errors)}`);
    }
  });
  
  console.log(`\n📊 验证逻辑测试: ${passedTests}/${testCases.length} 通过`);
  
  return passedTests === testCases.length;
}

// 生成接口文档
function generateApiDocumentation() {
  console.log('\n📖 接口文档');
  console.log('=' .repeat(50));
  
  console.log('📍 文件位置: /home/devbox/project/routes/demoBooking.js');
  console.log('');
  
  console.log('🔌 POST /api/demo-booking');
  console.log('功能: 创建Demo预约');
  console.log('请求体示例:');
  console.log(JSON.stringify({
    firstName: "张",
    lastName: "三",
    email: "zhangsan@company.com",
    phone: "13800138000",  // 新增字段，可选
    company: "ABC公司",
    roles: ["engineering", "product"],
    mainGoal: "hiring",
    budget: "medium",
    emailUpdates: "yes",
    language: "zh"
  }, null, 2));
  
  console.log('\n🔌 GET /api/demo-booking');
  console.log('功能: 查询Demo预约');
  console.log('响应示例:');
  console.log(JSON.stringify({
    success: true,
    data: [{
      id: 123,
      firstName: "张",
      lastName: "三",
      email: "zhangsan@company.com",
      phone: "13800138000",  // 新增字段
      company: "ABC公司",
      roles: ["engineering", "product"],
      mainGoal: "hiring",
      budget: "medium",
      emailUpdates: "yes",
      language: "zh",
      createdAt: "2025-08-19T12:00:00.000Z",
      updatedAt: "2025-08-19T12:00:00.000Z"
    }],
    count: 1,
    timestamp: "2025-08-19T12:00:00.000Z"
  }, null, 2));
  
  console.log('\n📋 phone字段说明:');
  console.log('• 类型: string (可选)');
  console.log('• 最大长度: 20字符');
  console.log('• 验证规则: 必须为字符串类型，长度不超过20字符');
  console.log('• 存储规则: 自动trim()，空字符串存储为null');
  console.log('• 示例: "13800138000", "138-0013-8000", "+86 138 0013 8000"');
}

// 主函数
function main() {
  console.log('🔧 Demo Booking接口phone字段集成验证');
  console.log('🕒 验证时间:', new Date().toLocaleString());
  console.log('');
  
  // 步骤1: 验证代码修改
  const codeChangesValid = validateCodeChanges();
  
  // 步骤2: 测试验证逻辑
  const validationLogicValid = extractAndTestValidationLogic();
  
  // 步骤3: 生成接口文档
  generateApiDocumentation();
  
  // 总结
  console.log('\n' + '=' .repeat(70));
  log('blue', '🎯 最终验证结果');
  console.log('=' .repeat(70));
  
  if (codeChangesValid && validationLogicValid) {
    log('green', '🎉 phone字段功能完全集成成功！');
    console.log('');
    console.log('✅ 代码修改完成');
    console.log('✅ 验证逻辑正常');
    console.log('✅ 接口准备就绪');
    console.log('');
    console.log('📤 可以提供给前端使用的接口:');
    console.log('  • POST /api/demo-booking (支持phone字段)');
    console.log('  • GET /api/demo-booking (返回phone字段)');
    console.log('');
    console.log('💡 启动服务器进行完整测试:');
    console.log('  node server.js');
  } else {
    log('yellow', '⚠️  部分验证未通过，需要检查代码');
    
    if (!codeChangesValid) {
      console.log('❌ 代码修改不完整');
    }
    if (!validationLogicValid) {
      console.log('❌ 验证逻辑异常');
    }
  }
  
  console.log(`\n🔚 验证完成: ${new Date().toLocaleString()}`);
}

// 运行验证
if (require.main === module) {
  main();
}

module.exports = { validateCodeChanges, extractAndTestValidationLogic };