#!/usr/bin/env node

const http = require('http');

// 测试配置
const API_HOST = 'localhost';
const API_PORT = 8080; // 真实服务器端口
const API_PATH = '/api/demo-booking';

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

// HTTP请求封装
function makeRequest(method, data = null, queryParams = '') {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: API_PATH + queryParams,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'API-Test-Client/1.0',
        'Accept': 'application/json'
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// 测试数据集
const testCases = {
  // 测试1: 完整数据包含phone
  fullDataWithPhone: {
    name: "完整数据包含phone字段",
    data: {
      firstName: "张",
      lastName: "三",
      email: `test-full-${Date.now()}@company.com`,
      phone: "13800138000",
      company: "ABC公司",
      roles: ["engineering", "product"],
      mainGoal: "hiring",
      budget: "medium",
      emailUpdates: "yes",
      language: "zh"
    },
    expectedStatus: 200
  },

  // 测试2: 不包含phone字段
  dataWithoutPhone: {
    name: "不包含phone字段",
    data: {
      firstName: "李",
      lastName: "四",
      email: `test-no-phone-${Date.now()}@company.com`,
      company: "XYZ公司",
      roles: ["product"],
      mainGoal: "platform",
      budget: "small",
      emailUpdates: "yes",
      language: "en"
    },
    expectedStatus: 200
  },

  // 测试3: phone字段为空字符串
  emptyPhone: {
    name: "phone字段为空字符串",
    data: {
      firstName: "王",
      lastName: "五",
      email: `test-empty-phone-${Date.now()}@company.com`,
      phone: "",
      company: "Empty Phone公司",
      roles: ["engineering"],
      mainGoal: "hiring",
      budget: "large",
      emailUpdates: "no",
      language: "zh"
    },
    expectedStatus: 200
  },

  // 测试4: phone字段过长
  longPhone: {
    name: "phone字段过长（超过20字符）",
    data: {
      firstName: "赵",
      lastName: "六",
      email: `test-long-phone-${Date.now()}@company.com`,
      phone: "123456789012345678901", // 21字符
      company: "长手机号公司",
      roles: ["operations"],
      mainGoal: "platform",
      budget: "medium",
      emailUpdates: "yes",
      language: "en"
    },
    expectedStatus: 400
  },

  // 测试5: phone字段为数字类型（应该失败）
  phoneAsNumber: {
    name: "phone字段为数字类型",
    data: {
      firstName: "孙",
      lastName: "七",
      email: `test-number-phone-${Date.now()}@company.com`,
      phone: 13800138000, // 数字而不是字符串
      company: "数字手机号公司",
      roles: ["recruiting"],
      mainGoal: "hiring",
      budget: "small",
      emailUpdates: "yes"
    },
    expectedStatus: 400
  },

  // 测试6: 标准中国手机号
  chineseMobile: {
    name: "标准中国手机号",
    data: {
      firstName: "周",
      lastName: "八",
      email: `test-cn-mobile-${Date.now()}@company.com`,
      phone: "13912345678",
      company: "中国移动测试公司",
      roles: ["executive"],
      mainGoal: "platform",
      budget: "large",
      emailUpdates: "yes",
      language: "zh"
    },
    expectedStatus: 200
  },

  // 测试7: 您的原始示例数据
  yourOriginalExample: {
    name: "您提供的原始示例数据",
    data: {
      firstName: "张",
      lastName: "三",
      email: `your-original-${Date.now()}@company.com`,
      phone: "13800138000",
      company: "ABC公司",
      roles: ["engineering", "product"],
      mainGoal: "hiring",
      budget: "medium",
      emailUpdates: "yes",
      language: "zh"
    },
    expectedStatus: 200
  }
};

// 检查服务器状态
async function checkServerStatus() {
  try {
    log('blue', '🔍 检查服务器连接状态...');
    const response = await makeRequest('GET');
    
    if (response.status >= 200 && response.status < 500) {
      log('green', '✅ 服务器连接正常');
      console.log(`   响应状态: ${response.status}`);
      return true;
    } else {
      log('yellow', '⚠️  服务器响应异常但可连接');
      console.log(`   响应状态: ${response.status}`);
      return true;
    }
  } catch (error) {
    log('red', '❌ 无法连接到服务器');
    console.log('   错误信息:', error.message);
    console.log('   请确保服务器已启动: node server.js');
    console.log(`   服务地址: http://${API_HOST}:${API_PORT}`);
    return false;
  }
}

// 运行单个POST测试
async function runPostTest(testCase) {
  try {
    log('cyan', `\n📋 测试: ${testCase.name}`);
    console.log('请求数据:');
    console.log(JSON.stringify(testCase.data, null, 2));
    
    const startTime = Date.now();
    const response = await makeRequest('POST', testCase.data);
    const duration = Date.now() - startTime;
    
    console.log(`\n响应时间: ${duration}ms`);
    console.log(`状态码: ${response.status}`);
    console.log('响应内容:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.status === testCase.expectedStatus) {
      log('green', `✅ ${testCase.name} - 通过`);
      
      // 如果成功，检查特定字段
      if (response.status === 200 && response.data.success) {
        console.log(`   预约ID: ${response.data.id}`);
        console.log(`   时间戳: ${response.data.timestamp}`);
      }
      
      // 如果是验证错误，检查错误信息
      if (response.status === 400 && response.data.errors) {
        console.log(`   验证错误: ${JSON.stringify(response.data.errors)}`);
      }
      
      return { success: true, response };
    } else {
      log('red', `❌ ${testCase.name} - 失败`);
      console.log(`   期望状态: ${testCase.expectedStatus}, 实际状态: ${response.status}`);
      return { success: false, response };
    }
    
  } catch (error) {
    log('red', `❌ ${testCase.name} - 请求异常`);
    console.log(`   错误: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 测试GET接口
async function testGetEndpoint() {
  try {
    log('cyan', '\n📋 测试GET接口返回phone字段');
    
    const response = await makeRequest('GET');
    
    console.log(`状态码: ${response.status}`);
    
    if (response.status === 200) {
      console.log('响应数据结构:');
      console.log(JSON.stringify(response.data, null, 2));
      
      if (response.data.success && response.data.data) {
        console.log(`\n返回记录数: ${response.data.count || response.data.data.length}`);
        
        if (response.data.data.length > 0) {
          const firstRecord = response.data.data[0];
          console.log('第一条记录的字段:', Object.keys(firstRecord));
          
          if ('phone' in firstRecord) {
            log('green', '✅ GET接口正确返回phone字段');
            console.log(`   phone字段值: ${firstRecord.phone || 'null'}`);
            return { success: true, hasPhoneField: true };
          } else {
            log('red', '❌ GET接口缺少phone字段');
            return { success: false, hasPhoneField: false };
          }
        } else {
          log('yellow', '⚠️  数据库暂无记录，但接口结构正常');
          return { success: true, hasPhoneField: null };
        }
      } else {
        log('red', '❌ GET接口响应格式异常');
        return { success: false, response };
      }
    } else {
      log('red', '❌ GET接口状态码异常');
      console.log('响应:', response.data);
      return { success: false, response };
    }
    
  } catch (error) {
    log('red', `❌ GET接口请求异常: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 主测试函数
async function runCompleteTest() {
  console.log('🧪 Demo Booking API Phone字段完整测试');
  console.log('=' .repeat(70));
  console.log(`📍 测试目标: http://${API_HOST}:${API_PORT}${API_PATH}`);
  console.log('🕒 测试时间:', new Date().toLocaleString());
  console.log('');

  // 检查服务器状态
  const serverOk = await checkServerStatus();
  if (!serverOk) {
    console.log('\n💡 启动服务器指南:');
    console.log('1. cd /home/devbox/project');
    console.log('2. node server.js');
    console.log('3. 确保MySQL数据库已运行');
    return;
  }

  console.log('\n📝 开始POST接口测试...');
  console.log('=' .repeat(50));
  
  let totalTests = 0;
  let passedTests = 0;
  const results = [];
  
  // 运行所有POST测试
  for (const [key, testCase] of Object.entries(testCases)) {
    totalTests++;
    
    const result = await runPostTest(testCase);
    results.push({ testName: testCase.name, ...result });
    
    if (result.success) {
      passedTests++;
    }
    
    // 等待1秒避免频率限制
    if (totalTests < Object.keys(testCases).length) {
      console.log('\n⏳ 等待1秒避免频率限制...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // 测试GET接口
  console.log('\n📝 开始GET接口测试...');
  console.log('=' .repeat(50));
  
  totalTests++;
  const getResult = await testGetEndpoint();
  results.push({ testName: 'GET接口phone字段', ...getResult });
  
  if (getResult.success) {
    passedTests++;
  }
  
  // 显示测试结果汇总
  console.log('\n' + '=' .repeat(70));
  log('blue', '🎯 测试结果汇总');
  console.log('=' .repeat(70));
  
  console.log(`📊 总测试数: ${totalTests}`);
  console.log(`✅ 通过测试: ${passedTests}`);
  console.log(`❌ 失败测试: ${totalTests - passedTests}`);
  console.log(`📈 成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  // 详细结果
  console.log('\n📋 详细结果:');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.testName}`);
  });
  
  if (passedTests === totalTests) {
    log('green', '\n🎉 所有测试通过！phone字段功能完美集成！');
    
    console.log('\n✅ 验证确认:');
    console.log('  • POST接口完全支持phone字段');
    console.log('  • phone字段验证逻辑正常工作');
    console.log('  • GET接口正确返回phone字段');
    console.log('  • 您的示例数据格式完全支持');
    console.log('  • 接口已准备好供前端使用');
    
  } else {
    log('red', '\n⚠️  部分测试失败，请检查具体错误信息');
    
    const failedTests = results.filter(r => !r.success);
    console.log('\n❌ 失败的测试:');
    failedTests.forEach(test => {
      console.log(`  • ${test.testName}`);
      if (test.error) {
        console.log(`    错误: ${test.error}`);
      }
    });
  }
  
  // 提供curl测试示例
  console.log('\n📋 手动测试示例:');
  console.log('=' .repeat(40));
  
  const exampleData = testCases.yourOriginalExample.data;
  console.log('curl测试命令:');
  console.log(`curl -X POST http://${API_HOST}:${API_PORT}${API_PATH} \\`);
  console.log('  -H "Content-Type: application/json" \\');
  console.log(`  -d '${JSON.stringify(exampleData, null, 2).replace(/\n/g, '\n      ')}'`);
  
  console.log('\nGET接口查询:');
  console.log(`curl -X GET http://${API_HOST}:${API_PORT}${API_PATH}`);
  
  console.log(`\n🔚 测试完成时间: ${new Date().toLocaleString()}`);
}

// 直接运行
if (require.main === module) {
  runCompleteTest().catch(console.error);
}

module.exports = { runCompleteTest, testCases };