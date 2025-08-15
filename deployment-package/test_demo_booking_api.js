const axios = require('axios');

// 配置
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';
const TEST_API_URL = `${API_BASE_URL}/api/demo-booking`;

// 测试数据
const validTestData = {
  firstName: "Jane",
  lastName: "Smith",
  email: "jane.smith@techcompany.com",
  company: "Tech Company Inc.",
  roles: ["engineering", "product"],
  mainGoal: "aiTraining",
  budget: "medium",
  emailUpdates: "yes",
  language: "en",
  timestamp: new Date().toISOString()
};

const invalidTestData = {
  firstName: "", // 空值
  lastName: "Smith",
  email: "invalid-email", // 错误格式
  company: "Tech Company",
  roles: [], // 空数组
  mainGoal: "invalid", // 无效选项
  budget: "medium",
  emailUpdates: "yes"
};

// 颜色输出工具
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 测试函数
async function testDemoBookingAPI() {
  console.log('🧪 开始测试 Demo Booking API...\n');

  // 测试 1: 有效数据提交
  try {
    log('blue', '测试 1: 提交有效数据');
    console.log('请求数据:', JSON.stringify(validTestData, null, 2));
    
    const response = await axios.post(TEST_API_URL, validTestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    log('green', '✅ 测试 1 通过');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    console.log('');
  } catch (error) {
    log('red', '❌ 测试 1 失败');
    if (error.response) {
      console.log('错误状态:', error.response.status);
      console.log('错误数据:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('错误信息:', error.message);
    }
    console.log('');
  }

  // 等待一下，避免频率限制
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 测试 2: 无效数据提交
  try {
    log('blue', '测试 2: 提交无效数据（应该返回400错误）');
    console.log('请求数据:', JSON.stringify(invalidTestData, null, 2));
    
    const response = await axios.post(TEST_API_URL, invalidTestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    log('red', '❌ 测试 2 失败 - 应该返回400错误但返回了成功');
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('green', '✅ 测试 2 通过 - 正确返回400错误');
      console.log('错误状态:', error.response.status);
      console.log('错误数据:', JSON.stringify(error.response.data, null, 2));
    } else {
      log('red', '❌ 测试 2 失败 - 返回了意外的错误');
      if (error.response) {
        console.log('错误状态:', error.response.status);
        console.log('错误数据:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('错误信息:', error.message);
      }
    }
  }
  console.log('');

  // 测试 3: 缺少必填字段
  try {
    log('blue', '测试 3: 提交缺少必填字段的数据');
    const incompleteData = {
      firstName: "John",
      email: "john@example.com"
      // 缺少其他必填字段
    };
    
    console.log('请求数据:', JSON.stringify(incompleteData, null, 2));
    
    const response = await axios.post(TEST_API_URL, incompleteData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    log('red', '❌ 测试 3 失败 - 应该返回400错误');
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('green', '✅ 测试 3 通过 - 正确返回400错误');
      console.log('错误数据:', JSON.stringify(error.response.data, null, 2));
    } else {
      log('red', '❌ 测试 3 失败 - 返回了意外的错误');
      console.log('错误信息:', error.message);
    }
  }
  console.log('');

  // 测试 4: 测试频率限制
  try {
    log('blue', '测试 4: 测试频率限制（快速连续请求）');
    
    // 使用相同邮箱快速发送两个请求
    const testEmail = `test${Date.now()}@example.com`;
    const testData = {
      ...validTestData,
      email: testEmail
    };

    log('yellow', '发送第一个请求...');
    await axios.post(TEST_API_URL, testData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    log('yellow', '立即发送第二个请求（应该被频率限制）...');
    const response2 = await axios.post(TEST_API_URL, testData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    log('red', '❌ 测试 4 失败 - 频率限制没有生效');
    console.log('第二个请求响应:', JSON.stringify(response2.data, null, 2));
  } catch (error) {
    if (error.response && (error.response.status === 429 || error.response.status === 400)) {
      log('green', '✅ 测试 4 通过 - 频率限制正常工作');
      console.log('频率限制响应:', JSON.stringify(error.response.data, null, 2));
    } else {
      log('red', '❌ 测试 4 失败 - 返回了意外的错误');
      if (error.response) {
        console.log('错误状态:', error.response.status);
        console.log('错误数据:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('错误信息:', error.message);
      }
    }
  }
  console.log('');

  // 测试 5: 测试字段长度限制
  try {
    log('blue', '测试 5: 测试字段长度限制');
    const longFieldData = {
      ...validTestData,
      firstName: 'A'.repeat(100), // 超过50字符限制
      company: 'B'.repeat(200),   // 超过100字符限制
      email: `test${Date.now()}@example.com`
    };
    
    console.log('请求数据:', JSON.stringify({...longFieldData, firstName: longFieldData.firstName.substring(0, 20) + '...', company: longFieldData.company.substring(0, 20) + '...'}, null, 2));
    
    const response = await axios.post(TEST_API_URL, longFieldData, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    log('red', '❌ 测试 5 失败 - 应该返回字段长度错误');
    console.log('响应:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('green', '✅ 测试 5 通过 - 正确返回字段长度错误');
      console.log('错误数据:', JSON.stringify(error.response.data, null, 2));
    } else {
      log('red', '❌ 测试 5 失败 - 返回了意外的错误');
      console.log('错误信息:', error.message);
    }
  }
  console.log('');

  log('blue', '🧪 Demo Booking API 测试完成！');
}

// CURL 示例生成
function generateCurlExamples() {
  console.log('\n' + '='.repeat(60));
  log('blue', '📋 CURL 测试示例:');
  console.log('='.repeat(60));
  
  console.log('\n1. 有效数据提交:');
  console.log(`curl -X POST ${TEST_API_URL} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(validTestData, null, 2).replace(/\n/g, '\n     ')}'`);
  
  console.log('\n2. 简化示例:');
  const simpleData = {
    firstName: "John",
    lastName: "Doe", 
    email: "john.doe@company.com",
    company: "Example Corp",
    roles: ["engineering"],
    mainGoal: "platform",
    budget: "small",
    emailUpdates: "yes"
  };
  
  console.log(`curl -X POST ${TEST_API_URL} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(simpleData, null, 2).replace(/\n/g, '\n     ')}'`);
  
  console.log('\n3. 测试验证错误:');
  console.log(`curl -X POST ${TEST_API_URL} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(invalidTestData, null, 2).replace(/\n/g, '\n     ')}'`);
}

// Postman 集合生成
function generatePostmanCollection() {
  const collection = {
    info: {
      name: "Demo Booking API",
      description: "Demo预约表单API测试集合"
    },
    item: [
      {
        name: "提交Demo预约 - 有效数据",
        request: {
          method: "POST",
          header: [
            {
              key: "Content-Type",
              value: "application/json"
            }
          ],
          body: {
            mode: "raw",
            raw: JSON.stringify(validTestData, null, 2)
          },
          url: {
            raw: TEST_API_URL,
            host: [API_BASE_URL.replace('http://', '').replace('https://', '').split(':')[0]],
            port: API_BASE_URL.includes(':8080') ? '8080' : '',
            path: ["api", "demo-booking"]
          }
        }
      },
      {
        name: "提交Demo预约 - 无效数据",
        request: {
          method: "POST",
          header: [
            {
              key: "Content-Type", 
              value: "application/json"
            }
          ],
          body: {
            mode: "raw",
            raw: JSON.stringify(invalidTestData, null, 2)
          },
          url: {
            raw: TEST_API_URL,
            host: [API_BASE_URL.replace('http://', '').replace('https://', '').split(':')[0]],
            port: API_BASE_URL.includes(':8080') ? '8080' : '',
            path: ["api", "demo-booking"]
          }
        }
      }
    ]
  };
  
  console.log('\n' + '='.repeat(60));
  log('blue', '📤 Postman 集合 (复制到Postman导入):');
  console.log('='.repeat(60));
  console.log(JSON.stringify(collection, null, 2));
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--curl')) {
    generateCurlExamples();
    return;
  }
  
  if (args.includes('--postman')) {
    generatePostmanCollection();
    return;
  }
  
  if (args.includes('--help')) {
    console.log('使用方法:');
    console.log('  node test_demo_booking_api.js           # 运行所有测试');
    console.log('  node test_demo_booking_api.js --curl    # 显示CURL示例');
    console.log('  node test_demo_booking_api.js --postman # 生成Postman集合');
    console.log('  node test_demo_booking_api.js --help    # 显示帮助');
    return;
  }
  
  await testDemoBookingAPI();
  generateCurlExamples();
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testDemoBookingAPI,
  validTestData,
  invalidTestData
};