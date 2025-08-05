const axios = require('axios').default;

const BASE_URL = 'http://localhost:8080';

// 测试数据 - 基于新的字段结构
const testData = {
  valid: {
    service: 'other',
    _language: 'zh',
    name: '张三',
    email: 'zhangsan@email.com',
    company: 'ABC公司',
    phone: '13800138000',
    message: '我想了解更多关于贵公司的服务，特别是在数字化转型方面的解决方案。希望能够安排一次详细的咨询会议。'
  },
  validMinimal: {
    service: 'other',
    name: '李四',
    email: 'lisi@example.com',
    message: '请问你们是否提供技术咨询服务？'
  },
  validWithCompany: {
    service: 'other',
    _language: 'en',
    name: 'John Doe',
    email: 'john.doe@company.com',
    company: 'Tech Solutions Ltd',
    message: 'We are interested in your enterprise solutions.'
  },
  validWithPhone: {
    service: 'other',
    name: '王五',
    email: 'wangwu@domain.com',
    phone: '15912345678',
    message: '希望了解产品价格和实施周期。'
  },
  validComplete: {
    service: 'other',
    _language: 'zh',
    name: '赵六', 
    email: 'zhaoliu@corp.com',
    company: '创新科技有限公司',
    phone: '18888888888',
    message: '我们公司正在寻找合适的技术合作伙伴，希望能进一步沟通合作事宜。请尽快联系我们。'
  },
  invalidEmail: {
    service: 'other',
    name: '孙七',
    email: 'invalid-email-format',
    company: 'Test Company',
    message: '这是一个测试消息'
  },
  missingName: {
    service: 'other',
    email: 'test@example.com',
    message: '缺少姓名的测试'
  },
  missingEmail: {
    service: 'other',
    name: '测试用户',
    message: '缺少邮箱的测试'
  },
  missingMessage: {
    service: 'other',
    name: '测试用户',
    email: 'test@example.com',
    company: '测试公司'
  },
  emptyMessage: {
    service: 'other',
    name: '测试用户',
    email: 'test@example.com',
    message: ''
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
    log(colors.blue, '\n=== 测试完整字段的其他咨询表单提交 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.valid);
    
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✓ 完整字段其他咨询表单提交成功');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return response.data.id;
    } else {
      log(colors.red, '✗ 完整字段其他咨询表单提交失败');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    log(colors.red, '✗ 完整字段其他咨询表单提交异常:', error.response?.data || error.message);
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

async function testWithCompany() {
  try {
    log(colors.blue, '\n=== 测试包含公司名称的提交 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.validWithCompany);
    
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✓ 包含公司名称的提交成功');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return response.data.id;
    } else {
      log(colors.red, '✗ 包含公司名称的提交失败');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    log(colors.red, '✗ 包含公司名称的提交异常:', error.response?.data || error.message);
    return null;
  }
}

async function testWithPhone() {
  try {
    log(colors.blue, '\n=== 测试包含手机号的提交 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.validWithPhone);
    
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✓ 包含手机号的提交成功');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return response.data.id;
    } else {
      log(colors.red, '✗ 包含手机号的提交失败');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    log(colors.red, '✗ 包含手机号的提交异常:', error.response?.data || error.message);
    return null;
  }
}

async function testCompleteSubmission() {
  try {
    log(colors.blue, '\n=== 测试所有字段完整的提交 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.validComplete);
    
    if (response.status === 200 && response.data.success) {
      log(colors.green, '✓ 所有字段完整的提交成功');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return response.data.id;
    } else {
      log(colors.red, '✗ 所有字段完整的提交失败');
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    log(colors.red, '✗ 所有字段完整的提交异常:', error.response?.data || error.message);
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

async function testMissingMessage() {
  try {
    log(colors.blue, '\n=== 测试缺少留言内容 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.missingMessage);
    
    log(colors.red, '✗ 应该拒绝缺少留言内容，但请求成功了');
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    return false;
  } catch (error) {
    if (error.response?.status === 500 && error.response?.data?.error) {
      log(colors.green, '✓ 正确拒绝了缺少留言内容的请求');
      console.log('错误信息:', error.response.data.error);
      return true;
    } else {
      log(colors.red, '✗ 缺少留言内容测试异常:', error.response?.data || error.message);
      return false;
    }
  }
}

async function testEmptyMessage() {
  try {
    log(colors.blue, '\n=== 测试空留言内容 ===');
    const response = await axios.post(`${BASE_URL}/api/contact`, testData.emptyMessage);
    
    log(colors.red, '✗ 应该拒绝空留言内容，但请求成功了');
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    return false;
  } catch (error) {
    if (error.response?.status === 500 && error.response?.data?.error) {
      log(colors.green, '✓ 正确拒绝了空留言内容的请求');
      console.log('错误信息:', error.response.data.error);
      return true;
    } else {
      log(colors.red, '✗ 空留言内容测试异常:', error.response?.data || error.message);
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
      
      // 检查是否包含其他咨询服务的统计
      const otherStats = response.data.data.byService.find(s => s.service_type === 'other');
      if (otherStats) {
        log(colors.green, `✓ 其他咨询服务统计: ${otherStats.count} 条记录`);
      } else {
        log(colors.yellow, '⚠ 未找到其他咨询服务统计数据');
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
  log(colors.blue, '开始其他咨询服务API测试 (新版本 - 包含phone字段)');
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
  
  // 4. 包含公司名称提交测试
  const companySubmissionId = await testWithCompany();
  results.push(['公司名称提交', companySubmissionId !== null]);
  
  // 5. 包含手机号提交测试
  const phoneSubmissionId = await testWithPhone();
  results.push(['手机号提交', phoneSubmissionId !== null]);
  
  // 6. 所有字段完整提交测试
  const completeSubmissionId = await testCompleteSubmission();
  results.push(['完整信息提交', completeSubmissionId !== null]);
  
  // 7. 无效邮箱测试
  const invalidEmailTest = await testInvalidEmail();
  results.push(['无效邮箱格式', invalidEmailTest]);
  
  // 8. 缺少姓名测试
  const missingNameTest = await testMissingName();
  results.push(['缺少姓名', missingNameTest]);
  
  // 9. 缺少邮箱测试
  const missingEmailTest = await testMissingEmail();
  results.push(['缺少邮箱', missingEmailTest]);
  
  // 10. 缺少留言内容测试
  const missingMessageTest = await testMissingMessage();
  results.push(['缺少留言内容', missingMessageTest]);
  
  // 11. 空留言内容测试
  const emptyMessageTest = await testEmptyMessage();
  results.push(['空留言内容', emptyMessageTest]);
  
  // 12. 统计接口测试
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
    log(colors.green, '🎉 所有测试通过！其他咨询服务API工作正常');
  } else {
    log(colors.yellow, '⚠️  部分测试失败，请检查相关功能');
  }
  
  // 显示数据库字段映射信息
  log(colors.blue, '\n=== 字段映射信息 ===');
  log(colors.blue, '前端字段 -> 数据库字段:');
  log(colors.blue, '- name -> name (必填)');
  log(colors.blue, '- email -> email (必填)');
  log(colors.blue, '- company -> company (可选)');
  log(colors.blue, '- phone -> phone (可选, 新增字段)');
  log(colors.blue, '- message -> message (必填)');
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
  testWithCompany,
  testWithPhone,
  testCompleteSubmission,
  testInvalidEmail,
  testMissingName,
  testMissingEmail,
  testMissingMessage,
  testEmptyMessage,
  testStatistics,
  runAllTests
};