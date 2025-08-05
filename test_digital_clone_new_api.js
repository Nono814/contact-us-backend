const axios = require('axios').default;

const BASE_URL = 'http://localhost:8080';

// 测试数据 - 基于新的字段结构
const testData = {
  valid: {
    service: 'digitalClone',
    _language: 'zh',
    name: '张三',
    email: 'zhangsan@email.com',
    expertiseField: 'technology',
    background: '我是一名有10年经验的软件工程师，专注于前端开发和用户体验设计。曾在多家知名科技公司工作，擅长React、Vue等现代框架。'
  },
  validMinimal: {
    service: 'digitalClone',
    name: '李四',
    email: 'lisi@example.com'
  },
  validWithExpertise: {
    service: 'digitalClone',
    _language: 'en',
    name: 'John Doe',
    email: 'john.doe@company.com',
    expertiseField: 'marketing'
  },
  validWithBackground: {
    service: 'digitalClone',
    name: '王五',
    email: 'wangwu@domain.com',
    background: '资深产品经理，有8年互联网产品设计和管理经验'
  },
  invalidEmail: {
    service: 'digitalClone',
    name: '赵六',
    email: 'invalid-email-format',
    expertiseField: 'design'
  },
  missingName: {
    service: 'digitalClone',
    email: 'test@example.com',
    expertiseField: 'consulting'
  },
  missingEmail: {
    service: 'digitalClone',
    name: '孙七',
    expertiseField: 'finance'
  },
  emptyFields: {
    service: 'digitalClone'
  }
};

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

// 测试函数
async function testHealthCheck() {
  try {
    log(colors.blue, '\n=== 测试健康检查接口 ===');
    const response = await axios.get(`${BASE_URL}/health`);
    
    if (response.status === 200 && response.data.status === 'OK') {
      log(colors.green, '✓ 健康检查通过');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return true;
    } else {
      log(colors.red, '✗ 健康检查失败');
      return false;
    }
  } catch (error) {
    log(colors.red, '✗ 健康检查异常:', error.message);
    return false;
  }
}

async function testValidSubmission() {
  try {
    log(colors.blue, '\n=== 测试完整字段的数字克隆表单提交 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.valid);
    
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✓ 完整字段数字克隆表单提交成功');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return response.data.id;
    } else {
      log(colors.red, '✗ 完整字段数字克隆表单提交失败');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    log(colors.red, '✗ 完整字段数字克隆表单提交异常:', error.response?.data || error.message);
    return null;
  }
}

async function testMinimalSubmission() {
  try {
    log(colors.blue, '\n=== 测试最小必填字段提交 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.validMinimal);
    
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✓ 最小字段提交成功');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return response.data.id;
    } else {
      log(colors.red, '✗ 最小字段提交失败');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    log(colors.red, '✗ 最小字段提交异常:', error.response?.data || error.message);
    return null;
  }
}

async function testWithExpertiseField() {
  try {
    log(colors.blue, '\n=== 测试包含专业领域的提交 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.validWithExpertise);
    
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✓ 包含专业领域的提交成功');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return response.data.id;
    } else {
      log(colors.red, '✗ 包含专业领域的提交失败');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    log(colors.red, '✗ 包含专业领域的提交异常:', error.response?.data || error.message);
    return null;
  }
}

async function testWithBackground() {
  try {
    log(colors.blue, '\n=== 测试包含背景描述的提交 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.validWithBackground);
    
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✓ 包含背景描述的提交成功');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return response.data.id;
    } else {
      log(colors.red, '✗ 包含背景描述的提交失败');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    log(colors.red, '✗ 包含背景描述的提交异常:', error.response?.data || error.message);
    return null;
  }
}

async function testInvalidEmail() {
  try {
    log(colors.blue, '\n=== 测试无效邮箱格式 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.invalidEmail);
    
    log(colors.red, '✗ 应该拒绝无效邮箱，但请求成功了');
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    return false;
  } catch (error) {
    if (error.response?.status === 500 && error.response?.data?.error) {
      log(colors.green, '✓ 正确拒绝了无效邮箱格式');
      console.log('错误信息:', error.response.data.error);
      return true;
    } else {
      log(colors.red, '✗ 无效邮箱测试异常:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testMissingName() {
  try {
    log(colors.blue, '\n=== 测试缺少姓名字段 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.missingName);
    
    log(colors.red, '✗ 应该拒绝缺少姓名，但请求成功了');
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    return false;
  } catch (error) {
    if (error.response?.status === 500 && error.response?.data?.error) {
      log(colors.green, '✓ 正确拒绝了缺少姓名的请求');
      console.log('错误信息:', error.response.data.error);
      return true;
    } else {
      log(colors.red, '✗ 缺少姓名测试异常:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testMissingEmail() {
  try {
    log(colors.blue, '\n=== 测试缺少邮箱字段 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.missingEmail);
    
    log(colors.red, '✗ 应该拒绝缺少邮箱，但请求成功了');
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    return false;
  } catch (error) {
    if (error.response?.status === 500 && error.response?.data?.error) {
      log(colors.green, '✓ 正确拒绝了缺少邮箱的请求');
      console.log('错误信息:', error.response.data.error);
      return true;
    } else {
      log(colors.red, '✗ 缺少邮箱测试异常:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testStatistics() {
  try {
    log(colors.blue, '\n=== 测试统计接口 ===');
    const response = await axios.get(`${BASE_URL}/api/admin/stats`);
    
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✓ 获取统计信息成功');
      console.log('统计数据:', JSON.stringify(response.data.data, null, 2));
      
      // 检查是否包含数字克隆服务的统计
      const digitalCloneStats = response.data.data.byService.find(s => s.service_type === 'digitalClone');
      if (digitalCloneStats) {
        log(colors.green, `✓ 数字克隆服务统计: ${digitalCloneStats.count} 条记录`);
      } else {
        log(colors.yellow, '⚠ 未找到数字克隆服务统计数据');
      }
      
      return true;
    } else {
      log(colors.red, '✗ 获取统计信息失败');
      return false;
    }
  } catch (error) {
    log(colors.red, '✗ 统计接口测试异常:', error.response?.data || error.message);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  log(colors.blue, '='.repeat(70));
  log(colors.blue, '开始数字克隆服务API测试 (新版本 - 简化字段)');
  log(colors.blue, '='.repeat(70));
  
  const results = [];
  
  // 1. 健康检查
  const healthCheck = await testHealthCheck();
  results.push(['健康检查', healthCheck]);
  
  if (!healthCheck) {
    log(colors.red, '\n服务器未启动或无法连接，停止测试');
    return;
  }
  
  // 2. 完整字段提交测试
  const validSubmissionId = await testValidSubmission();
  results.push(['完整字段提交', validSubmissionId !== null]);
  
  // 3. 最小字段提交测试
  const minimalSubmissionId = await testMinimalSubmission();
  results.push(['最小字段提交', minimalSubmissionId !== null]);
  
  // 4. 包含专业领域提交测试
  const expertiseSubmissionId = await testWithExpertiseField();
  results.push(['专业领域提交', expertiseSubmissionId !== null]);
  
  // 5. 包含背景描述提交测试
  const backgroundSubmissionId = await testWithBackground();
  results.push(['背景描述提交', backgroundSubmissionId !== null]);
  
  // 6. 无效邮箱测试
  const invalidEmailTest = await testInvalidEmail();
  results.push(['无效邮箱格式', invalidEmailTest]);
  
  // 7. 缺少姓名测试
  const missingNameTest = await testMissingName();
  results.push(['缺少姓名', missingNameTest]);
  
  // 8. 缺少邮箱测试
  const missingEmailTest = await testMissingEmail();
  results.push(['缺少邮箱', missingEmailTest]);
  
  // 9. 统计接口测试
  const statsTest = await testStatistics();
  results.push(['统计接口', statsTest]);
  
  // 显示测试结果摘要
  log(colors.blue, '\n' + '='.repeat(70));
  log(colors.blue, '测试结果摘要');
  log(colors.blue, '='.repeat(70));
  
  let passedCount = 0;
  results.forEach(([testName, passed]) => {
    if (passed) {
      log(colors.green, `✓ ${testName}`);
      passedCount++;
    } else {
      log(colors.red, `✗ ${testName}`);
    }
  });
  
  log(colors.blue, `\n总共 ${results.length} 个测试，通过 ${passedCount} 个`);
  
  if (passedCount === results.length) {
    log(colors.green, '🎉 所有测试通过！新版数字克隆服务API工作正常');
  } else {
    log(colors.yellow, '⚠️  部分测试失败，请检查相关功能');
  }
  
  // 显示数据库字段映射信息
  log(colors.blue, '\n=== 字段映射信息 ===');
  log(colors.blue, '前端字段 -> 数据库字段:');
  log(colors.blue, '- name -> name (必填)');
  log(colors.blue, '- email -> email (必填)');
  log(colors.blue, '- expertiseField -> expertise_field (可选)');
  log(colors.blue, '- background -> background (可选)');
  log(colors.blue, '- _language -> language (默认: en)');
  log(colors.blue, '- 自动字段: ip_address, user_agent, created_at, updated_at');
}

// 如果直接运行此文件
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testHealthCheck,
  testValidSubmission,
  testMinimalSubmission,
  testWithExpertiseField,
  testWithBackground,
  testInvalidEmail,
  testMissingName,
  testMissingEmail,
  testStatistics,
  runAllTests
};