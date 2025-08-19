#!/usr/bin/env node

const http = require('http');

// 测试配置
const API_HOST = 'localhost';
const API_PORT = 3001; // 使用模拟服务器端口
const API_PATH = '/api/demo-booking';

// 颜色输出
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

// HTTP请求封装
function makeRequest(method, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: API_PATH,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Phone-Test-Client/1.0'
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
            data: responseData
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// 测试数据
const testCases = {
  // 测试1: 包含phone字段的完整数据
  withPhone: {
    firstName: "张",
    lastName: "三",
    email: `test-with-phone-${Date.now()}@company.com`,
    phone: "13800138000",
    company: "ABC公司",
    roles: ["engineering", "product"],
    mainGoal: "hiring",
    budget: "medium",
    emailUpdates: "yes",
    language: "zh"
  },
  
  // 测试2: 不包含phone字段
  withoutPhone: {
    firstName: "李",
    lastName: "四",
    email: `test-without-phone-${Date.now()}@company.com`,
    company: "XYZ公司",
    roles: ["product"],
    mainGoal: "platform", 
    budget: "small",
    emailUpdates: "yes",
    language: "en"
  },
  
  // 测试3: phone字段过长
  longPhone: {
    firstName: "王",
    lastName: "五",
    email: `test-long-phone-${Date.now()}@company.com`,
    phone: "1234567890123456789012345", // 25字符，超过20字符限制
    company: "测试公司",
    roles: ["engineering"],
    mainGoal: "hiring",
    budget: "medium",
    emailUpdates: "yes",
    language: "zh"
  },
  
  // 测试4: phone字段为空字符串
  emptyPhone: {
    firstName: "赵",
    lastName: "六",
    email: `test-empty-phone-${Date.now()}@company.com`,
    phone: "",
    company: "Empty Phone公司",
    roles: ["operations"],
    mainGoal: "platform",
    budget: "large",
    emailUpdates: "no",
    language: "en"
  },
  
  // 测试5: 您提供的示例数据
  yourExample: {
    firstName: "张",
    lastName: "三",
    email: `your-example-${Date.now()}@company.com`,
    phone: "13800138000",
    company: "ABC公司",
    roles: ["engineering", "product"],
    mainGoal: "hiring",
    budget: "medium",
    emailUpdates: "yes",
    language: "zh"
  }
};

// 运行单个测试
async function runSingleTest(testName, testData, expectedStatus = 200) {
  try {
    log('blue', `\n📋 ${testName}`);
    console.log('发送数据:', JSON.stringify(testData, null, 2));
    
    const response = await makeRequest('POST', testData);
    
    console.log(`状态码: ${response.status}`);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    if (response.status === expectedStatus) {
      log('green', `✅ ${testName} - 通过`);
      return true;
    } else {
      log('red', `❌ ${testName} - 失败 (期望状态${expectedStatus}, 实际${response.status})`);
      return false;
    }
    
  } catch (error) {
    log('red', `❌ ${testName} - 请求异常: ${error.message}`);
    return false;
  }
}

// 测试GET接口
async function testGetEndpoint() {
  try {
    log('blue', '\n📋 测试GET /api/demo-booking');
    
    const response = await makeRequest('GET');
    
    console.log(`状态码: ${response.status}`);
    
    if (response.status === 200 && response.data.success) {
      console.log(`返回记录数: ${response.data.count || 0}`);
      
      if (response.data.data && response.data.data.length > 0) {
        const firstRecord = response.data.data[0];
        console.log('第一条记录字段:', Object.keys(firstRecord));
        
        if ('phone' in firstRecord) {
          log('green', '✅ GET接口 - phone字段存在于返回数据中');
          console.log('phone字段值:', firstRecord.phone);
          return true;
        } else {
          log('red', '❌ GET接口 - phone字段不存在于返回数据中');
          return false;
        }
      } else {
        log('yellow', '⚠️  GET接口 - 暂无数据，但接口正常');
        return true;
      }
    } else {
      log('red', `❌ GET接口失败: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
    
  } catch (error) {
    log('red', `❌ GET接口请求异常: ${error.message}`);
    return false;
  }
}

// 检查服务器是否运行
async function checkServerStatus() {
  try {
    log('blue', '🔍 检查服务器状态...');
    await makeRequest('GET');
    log('green', '✅ 服务器运行正常');
    return true;
  } catch (error) {
    log('red', '❌ 服务器未运行或无法连接');
    console.log('请确保服务器已启动: node server.js');
    console.log('错误信息:', error.message);
    return false;
  }
}

// 主测试函数
async function runPhoneFieldTests() {
  console.log('🧪 Phone字段集成测试');
  console.log('='.repeat(60));
  
  // 检查服务器状态
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    return;
  }
  
  console.log('\n📝 开始POST接口测试...');
  console.log('='.repeat(40));
  
  let passedTests = 0;
  let totalTests = 0;
  
  // 测试1: 包含phone字段
  totalTests++;
  if (await runSingleTest('包含phone字段的有效数据', testCases.withPhone, 200)) {
    passedTests++;
  }
  
  // 等待1秒避免频率限制
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试2: 不包含phone字段  
  totalTests++;
  if (await runSingleTest('不包含phone字段的有效数据', testCases.withoutPhone, 200)) {
    passedTests++;
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试3: phone字段过长（应该失败）
  totalTests++;
  if (await runSingleTest('phone字段过长（应该返回400）', testCases.longPhone, 400)) {
    passedTests++;
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试4: phone字段为空字符串
  totalTests++;
  if (await runSingleTest('phone字段为空字符串', testCases.emptyPhone, 200)) {
    passedTests++;
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试5: 您的示例数据
  totalTests++;
  if (await runSingleTest('您提供的示例数据', testCases.yourExample, 200)) {
    passedTests++;
  }
  
  // 测试GET接口
  console.log('\n📝 开始GET接口测试...');
  console.log('='.repeat(40));
  
  totalTests++;
  if (await testGetEndpoint()) {
    passedTests++;
  }
  
  // 显示测试结果
  console.log('\n' + '='.repeat(60));
  log('blue', '🎯 测试结果汇总');
  console.log('='.repeat(60));
  
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过测试: ${passedTests}`);
  console.log(`失败测试: ${totalTests - passedTests}`);
  console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    log('green', '\n🎉 所有测试通过！phone字段功能集成成功！');
    
    console.log('\n✅ 验证结果:');
    console.log('  • POST接口支持phone字段（可选参数）');
    console.log('  • phone字段长度验证正常工作（≤20字符）');
    console.log('  • 不传phone字段时接口正常工作');
    console.log('  • GET接口返回数据包含phone字段');
    console.log('  • 您的示例数据格式完全支持');
    
  } else {
    log('red', '\n❌ 部分测试失败，请检查接口实现');
  }
  
  console.log('\n📋 测试用例说明:');
  console.log('curl示例 - 包含phone字段:');
  console.log(`curl -X POST http://${API_HOST}:${API_PORT}${API_PATH} \\`);
  console.log('  -H "Content-Type: application/json" \\');
  console.log(`  -d '${JSON.stringify(testCases.yourExample, null, 2).replace(/\n/g, '\n      ')}'`);
  
  console.log('\ncurl示例 - 不包含phone字段:');
  console.log(`curl -X POST http://${API_HOST}:${API_PORT}${API_PATH} \\`);
  console.log('  -H "Content-Type: application/json" \\');
  console.log(`  -d '${JSON.stringify(testCases.withoutPhone, null, 2).replace(/\n/g, '\n      ')}'`);
}

// 如果直接运行此脚本
if (require.main === module) {
  runPhoneFieldTests().catch(console.error);
}

module.exports = { runPhoneFieldTests, testCases };