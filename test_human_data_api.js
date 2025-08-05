const axios = require('axios').default;

const BASE_URL = 'http://localhost:8080';

// 测试数据
const testData = {
  valid: {
    service: 'humanData',
    _language: 'zh',
    humanData_name: '李博士',
    humanData_email: 'dr.li@university.edu',
    dataType: '文本标注',
    expertiseArea: '自然语言处理',
    timeline: '1-3个月',
    projectDetails: '需要标注10万条中文语料，用于训练机器学习模型。要求具备语言学背景和NLP相关经验。'
  },
  validMinimal: {
    service: 'humanData',
    humanData_name: '张教授',
    humanData_email: 'prof.zhang@institute.com'
  },
  validPartial: {
    service: 'humanData',
    _language: 'en',
    humanData_name: 'Dr. Wang',
    humanData_email: 'wang@datalab.org',
    dataType: '图像标注',
    expertiseArea: '计算机视觉'
  },
  invalidEmail: {
    service: 'humanData',
    humanData_name: '刘研究员',
    humanData_email: 'invalid-email-format',
    dataType: '数据清洗'
  },
  missingRequired: {
    service: 'humanData',
    dataType: '语音标注'
    // 缺少必填的name和email
  },
  missingName: {
    service: 'humanData',
    humanData_email: 'test@example.com',
    dataType: '数据验证'
    // 缺少必填的name
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
    log(colors.blue, '\n=== 测试有效的人工数据表单提交（完整信息） ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.valid);
    
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✓ 完整人工数据表单提交成功');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return response.data.id;
    } else {
      log(colors.red, '✗ 完整人工数据表单提交失败');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    log(colors.red, '✗ 完整人工数据表单提交异常:', error.response?.data || error.message);
    return null;
  }
}

async function testMinimalSubmission() {
  try {
    log(colors.blue, '\n=== 测试最小必填字段的人工数据表单提交 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.validMinimal);
    
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✓ 最小字段人工数据表单提交成功');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return response.data.id;
    } else {
      log(colors.red, '✗ 最小字段人工数据表单提交失败');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    log(colors.red, '✗ 最小字段人工数据表单提交异常:', error.response?.data || error.message);
    return null;
  }
}

async function testPartialSubmission() {
  try {
    log(colors.blue, '\n=== 测试部分字段的人工数据表单提交 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.validPartial);
    
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✓ 部分字段人工数据表单提交成功');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return response.data.id;
    } else {
      log(colors.red, '✗ 部分字段人工数据表单提交失败');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    log(colors.red, '✗ 部分字段人工数据表单提交异常:', error.response?.data || error.message);
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

async function testMissingRequired() {
  try {
    log(colors.blue, '\n=== 测试缺少必填字段（name和email） ===');
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

async function testMissingName() {
  try {
    log(colors.blue, '\n=== 测试缺少姓名（必填字段） ===');
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

async function testAdminAPI(submissionId) {
  if (!submissionId) {
    log(colors.yellow, '\n=== 跳过管理API测试 (没有有效的提交ID) ===');
    return false;
  }

  try {
    log(colors.blue, '\n=== 测试管理API - 获取人工数据记录 ===');
    
    // 测试获取所有人工数据记录
    const allRecords = await axios.get(`${BASE_URL}/api/admin/contacts?service=humanData&limit=5`);
    if (allRecords.status === 200 && allRecords.data.success) {
      log(colors.green, '✓ 获取所有人工数据记录成功');
      console.log(`找到 ${allRecords.data.data.length} 条记录`);
    }
    
    // 测试获取特定记录
    const specificRecord = await axios.get(`${BASE_URL}/api/admin/contacts/humanData/${submissionId}`);
    if (specificRecord.status === 200 && specificRecord.data.success) {
      log(colors.green, '✓ 获取特定人工数据记录成功');
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
      
      // 检查是否包含人工数据服务的统计
      const humanDataStats = response.data.data.byService.find(s => s.service_type === 'humanData');
      if (humanDataStats) {
        log(colors.green, `✓ 人工数据服务统计: ${humanDataStats.count} 条记录`);
      } else {
        log(colors.yellow, '⚠ 未找到人工数据服务统计数据');
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
  log(colors.blue, '='.repeat(60));
  log(colors.blue, '开始人工数据服务API测试');
  log(colors.blue, '='.repeat(60));
  
  const results = [];
  
  // 1. 健康检查
  const healthCheck = await testHealthCheck();
  results.push(['健康检查', healthCheck]);
  
  if (!healthCheck) {
    log(colors.red, '\n服务器未启动或无法连接，停止测试');
    return;
  }
  
  // 2. 完整表单提交测试
  const submissionId = await testValidSubmission();
  results.push(['完整表单提交', submissionId !== null]);
  
  // 3. 最小字段表单提交测试
  const minimalSubmissionId = await testMinimalSubmission();
  results.push(['最小字段表单提交', minimalSubmissionId !== null]);
  
  // 4. 部分字段表单提交测试
  const partialSubmissionId = await testPartialSubmission();
  results.push(['部分字段表单提交', partialSubmissionId !== null]);
  
  // 5. 无效邮箱测试
  const invalidEmailTest = await testInvalidEmail();
  results.push(['无效邮箱格式', invalidEmailTest]);
  
  // 6. 缺少必填字段测试
  const missingRequiredTest = await testMissingRequired();
  results.push(['缺少必填字段', missingRequiredTest]);
  
  // 7. 缺少姓名测试
  const missingNameTest = await testMissingName();
  results.push(['缺少姓名', missingNameTest]);
  
  // 8. 管理API测试
  const adminAPITest = await testAdminAPI(submissionId || minimalSubmissionId);
  results.push(['管理API', adminAPITest]);
  
  // 9. 统计接口测试
  const statsTest = await testStatistics();
  results.push(['统计接口', statsTest]);
  
  // 显示测试结果摘要
  log(colors.blue, '\n' + '='.repeat(60));
  log(colors.blue, '测试结果摘要');
  log(colors.blue, '='.repeat(60));
  
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
    log(colors.green, '🎉 所有测试通过！人工数据服务API工作正常');
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
  testMinimalSubmission,
  testPartialSubmission,
  testInvalidEmail,
  testMissingRequired,
  testMissingName,
  testAdminAPI,
  testStatistics,
  runAllTests
};