const axios = require('axios').default;

const BASE_URL = 'http://localhost:3001';

// 测试数据
const testData = {
  valid: {
    service: 'hiring',
    _language: 'zh',
    name: '张三',
    email: 'zhangsan@example.com',
    company: 'ABC科技有限公司',
    companySize: '51-200人',
    roleType: '前端工程师',
    specialRequirements: '需要有React经验，熟练使用TypeScript'
  },
  invalidEmail: {
    service: 'hiring',
    name: '李四',
    email: 'invalid-email',
    company: 'XYZ公司'
  },
  missingRequired: {
    service: 'hiring',
    company: 'DEF公司'
  },
  invalidService: {
    service: 'invalid',
    name: '王五',
    email: 'wangwu@example.com'
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
    log(colors.blue, '\n=== 测试有效的招聘表单提交 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.valid);
    
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✓ 有效表单提交成功');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return response.data.id;
    } else {
      log(colors.red, '✗ 有效表单提交失败');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    log(colors.red, '✗ 有效表单提交异常:', error.response?.data || error.message);
    return null;
  }
}

async function testInvalidEmail() {
  try {
    log(colors.blue, '\n=== 测试无效邮箱格式 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.invalidEmail);
    
    // 应该返回400错误
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

async function testMissingRequired() {
  try {
    log(colors.blue, '\n=== 测试缺少必填字段 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.missingRequired);
    
    log(colors.red, '✗ 应该拒绝缺少必填字段，但请求成功了');
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    return false;
  } catch (error) {
    if (error.response?.status === 500 && error.response?.data?.error) {
      log(colors.green, '✓ 正确拒绝了缺少必填字段的请求');
      console.log('错误信息:', error.response.data.error);
      return true;
    } else {
      log(colors.red, '✗ 缺少必填字段测试异常:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testInvalidService() {
  try {
    log(colors.blue, '\n=== 测试无效服务类型 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.invalidService);
    
    log(colors.red, '✗ 应该拒绝无效服务类型，但请求成功了');
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    return false;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error === 'Invalid service type') {
      log(colors.green, '✓ 正确拒绝了无效服务类型');
      console.log('错误信息:', error.response.data.error);
      return true;
    } else {
      log(colors.red, '✗ 无效服务类型测试异常:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testAdminAPI(submissionId) {
  if (!submissionId) {
    log(colors.yellow, '\n=== 跳过管理API测试 (没有有效的提交ID) ===');
    return false;
  }

  try {
    log(colors.blue, '\n=== 测试管理API - 获取招聘记录 ===');
    
    // 测试获取所有记录
    const allRecords = await axios.get(`${BASE_URL}/api/admin/contacts?service=hiring&limit=5`);
    if (allRecords.status === 200 && allRecords.data.success) {
      log(colors.green, '✓ 获取所有招聘记录成功');
      console.log(`找到 ${allRecords.data.data.length} 条记录`);
    }
    
    // 测试获取特定记录
    const specificRecord = await axios.get(`${BASE_URL}/api/admin/contacts/hiring/${submissionId}`);
    if (specificRecord.status === 200 && specificRecord.data.success) {
      log(colors.green, '✓ 获取特定招聘记录成功');
      console.log('记录详情:', JSON.stringify(specificRecord.data.data, null, 2));
    }
    
    return true;
  } catch (error) {
    log(colors.red, '✗ 管理API测试异常:', error.response?.data || error.message);
    return false;
  }
}

async function testStatistics() {
  try {
    log(colors.blue, '\n=== 测试统计接口 ===');
    const response = await axios.get(`${BASE_URL}/api/admin/stats`);
    
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✓ 获取统计信息成功');
      console.log('统计数据:', JSON.stringify(response.data.data, null, 2));
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
  log(colors.blue, '='.repeat(50));
  log(colors.blue, '开始招聘服务API测试');
  log(colors.blue, '='.repeat(50));
  
  const results = [];
  
  // 1. 健康检查
  const healthCheck = await testHealthCheck();
  results.push(['健康检查', healthCheck]);
  
  if (!healthCheck) {
    log(colors.red, '\n服务器未启动或无法连接，停止测试');
    return;
  }
  
  // 2. 有效提交测试
  const submissionId = await testValidSubmission();
  results.push(['有效表单提交', submissionId !== null]);
  
  // 3. 无效邮箱测试
  const invalidEmailTest = await testInvalidEmail();
  results.push(['无效邮箱格式', invalidEmailTest]);
  
  // 4. 缺少必填字段测试
  const missingRequiredTest = await testMissingRequired();
  results.push(['缺少必填字段', missingRequiredTest]);
  
  // 5. 无效服务类型测试
  const invalidServiceTest = await testInvalidService();
  results.push(['无效服务类型', invalidServiceTest]);
  
  // 6. 管理API测试
  const adminAPITest = await testAdminAPI(submissionId);
  results.push(['管理API', adminAPITest]);
  
  // 7. 统计接口测试
  const statsTest = await testStatistics();
  results.push(['统计接口', statsTest]);
  
  // 显示测试结果摘要
  log(colors.blue, '\n' + '='.repeat(50));
  log(colors.blue, '测试结果摘要');
  log(colors.blue, '='.repeat(50));
  
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
    log(colors.green, '🎉 所有测试通过！');
  } else {
    log(colors.yellow, '⚠️  部分测试失败，请检查相关功能');
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testHealthCheck,
  testValidSubmission,
  testInvalidEmail,
  testMissingRequired,
  testInvalidService,
  testAdminAPI,
  testStatistics,
  runAllTests
};