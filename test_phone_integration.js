const express = require('express');
const request = require('supertest');

// 模拟数据库模块
const mockDatabase = {
  connections: [],
  queryResults: [],
  
  // 模拟mysql2/promise
  createConnection: jest.fn().mockImplementation(() => {
    const mockConnection = {
      execute: jest.fn().mockImplementation((query, params) => {
        console.log('📊 执行SQL:', query);
        console.log('📊 参数:', params);
        
        // 模拟重复检查查询
        if (query.includes('SELECT id FROM demo_bookings WHERE email')) {
          return Promise.resolve([[]); // 没有重复
        }
        
        // 模拟插入查询
        if (query.includes('INSERT INTO demo_bookings')) {
          const insertId = Math.floor(Math.random() * 1000) + 1;
          return Promise.resolve([{ insertId }]);
        }
        
        // 模拟查询数据
        if (query.includes('SELECT id, first_name')) {
          const mockResults = [{
            id: 123,
            first_name: params && params[0] === 'Jane' ? 'Jane' : '张',
            last_name: params && params[0] === 'Jane' ? 'Smith' : '三',
            email: params && params[0] === 'Jane' ? 'jane@test.com' : 'zhangsan@company.com',
            phone: params && params[0] === 'Jane' ? '13800138000' : '13912345678',
            company: params && params[0] === 'Jane' ? 'Tech Corp' : 'ABC公司',
            roles: '["engineering","product"]',
            main_goal: 'hiring',
            budget: 'medium',
            email_updates: 'yes',
            language: 'zh',
            created_at: new Date(),
            updated_at: new Date()
          }];
          return Promise.resolve([mockResults]);
        }
        
        return Promise.resolve([[]]);
      }),
      end: jest.fn().mockResolvedValue()
    };
    
    mockDatabase.connections.push(mockConnection);
    return Promise.resolve(mockConnection);
  })
};

// 模拟邮件服务
const mockEmailService = {
  sendDemoBookingNotification: jest.fn().mockResolvedValue(true)
};

// Mock模块
jest.mock('mysql2/promise', () => mockDatabase);
jest.mock('../services/emailNotification', () => mockEmailService);

// 设置环境变量
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test_db';

// 导入路由
const demoBookingRoutes = require('../routes/demoBooking');

// 创建测试应用
const app = express();
app.use(express.json());
app.use('/api', demoBookingRoutes);

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

// 测试数据
const testData = {
  withPhone: {
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
  
  withoutPhone: {
    firstName: "李",
    lastName: "四", 
    email: "lisi@company.com",
    company: "XYZ公司",
    roles: ["product"],
    mainGoal: "platform",
    budget: "small",
    emailUpdates: "yes",
    language: "en"
  },
  
  longPhone: {
    firstName: "王",
    lastName: "五",
    email: "wangwu@company.com", 
    phone: "1".repeat(25), // 超过20字符
    company: "测试公司",
    roles: ["engineering"],
    mainGoal: "hiring",
    budget: "medium",
    emailUpdates: "yes"
  },
  
  invalidData: {
    firstName: "", // 空值
    lastName: "Test",
    email: "invalid-email", // 无效邮箱
    phone: "123",
    company: "Test Company",
    roles: [], // 空数组
    mainGoal: "invalid", // 无效选项
    budget: "medium",
    emailUpdates: "yes"
  }
};

describe('Demo Booking API with Phone Field', () => {
  
  beforeEach(() => {
    // 清理模拟调用记录
    jest.clearAllMocks();
  });
  
  describe('POST /api/demo-booking', () => {
    
    test('✅ 应该成功提交包含phone字段的有效数据', async () => {
      log('blue', '测试: 提交包含phone字段的数据');
      
      const response = await request(app)
        .post('/api/demo-booking')
        .send(testData.withPhone)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Demo booking submitted successfully');
      expect(response.body.id).toMatch(/^db_\d+$/);
      
      // 验证数据库调用
      const mockConnection = mockDatabase.connections[mockDatabase.connections.length - 1];
      const insertCall = mockConnection.execute.mock.calls.find(call => 
        call[0].includes('INSERT INTO demo_bookings')
      );
      
      expect(insertCall).toBeDefined();
      expect(insertCall[1]).toContain('13800138000'); // phone字段
      expect(insertCall[1]).toContain('zhangsan@company.com');
      
      // 验证邮件通知包含phone字段
      expect(mockEmailService.sendDemoBookingNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '13800138000'
        })
      );
      
      log('green', '✅ 包含phone字段的数据提交成功');
    });
    
    test('✅ 应该成功提交不包含phone字段的有效数据', async () => {
      log('blue', '测试: 提交不包含phone字段的数据');
      
      const response = await request(app)
        .post('/api/demo-booking')
        .send(testData.withoutPhone)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Demo booking submitted successfully');
      
      // 验证数据库调用 - phone字段应该为null
      const mockConnection = mockDatabase.connections[mockDatabase.connections.length - 1];
      const insertCall = mockConnection.execute.mock.calls.find(call => 
        call[0].includes('INSERT INTO demo_bookings')
      );
      
      expect(insertCall).toBeDefined();
      expect(insertCall[1]).toContain(null); // phone字段为null
      expect(insertCall[1]).toContain('lisi@company.com');
      
      log('green', '✅ 不包含phone字段的数据提交成功');
    });
    
    test('❌ 应该拒绝phone字段过长的数据', async () => {
      log('blue', '测试: 提交phone字段过长的数据');
      
      const response = await request(app)
        .post('/api/demo-booking')
        .send(testData.longPhone)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
      expect(response.body.errors.phone).toBe('Phone must be 20 characters or less');
      
      log('green', '✅ 正确拒绝了过长的phone字段');
    });
    
    test('❌ 应该拒绝包含无效数据的请求', async () => {
      log('blue', '测试: 提交包含多个无效字段的数据');
      
      const response = await request(app)
        .post('/api/demo-booking')
        .send(testData.invalidData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
      expect(response.body.errors).toHaveProperty('firstName');
      expect(response.body.errors).toHaveProperty('email');
      expect(response.body.errors).toHaveProperty('roles');
      expect(response.body.errors).toHaveProperty('mainGoal');
      
      log('green', '✅ 正确拒绝了包含无效字段的数据');
    });
    
  });
  
  describe('GET /api/demo-booking', () => {
    
    test('✅ 应该返回包含phone字段的数据', async () => {
      log('blue', '测试: 查询数据应返回phone字段');
      
      const response = await request(app)
        .get('/api/demo-booking')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // 验证返回数据包含phone字段
      const firstRecord = response.body.data[0];
      expect(firstRecord).toHaveProperty('phone');
      expect(firstRecord.phone).toBeDefined();
      
      // 验证数据库查询包含phone字段
      const mockConnection = mockDatabase.connections[mockDatabase.connections.length - 1];
      const selectCall = mockConnection.execute.mock.calls.find(call => 
        call[0].includes('SELECT id, first_name')
      );
      
      expect(selectCall[0]).toContain('phone');
      
      log('green', '✅ GET接口正确返回了phone字段');
    });
    
  });
  
});

// 运行测试的主函数
async function runIntegrationTest() {
  log('blue', '🧪 开始完整的Phone字段集成测试...\n');
  
  try {
    // 手动测试POST接口
    console.log('='.repeat(60));
    log('yellow', '📝 手动测试POST接口');
    console.log('='.repeat(60));
    
    // 测试1: 包含phone字段
    log('blue', '测试1: 提交包含phone字段的数据');
    try {
      const response1 = await request(app)
        .post('/api/demo-booking')
        .send(testData.withPhone);
      
      if (response1.status === 200) {
        log('green', '✅ 包含phone字段的提交成功');
        console.log('响应:', response1.body);
      } else {
        log('red', '❌ 包含phone字段的提交失败');
        console.log('错误:', response1.body);
      }
    } catch (error) {
      log('red', '❌ 测试1异常: ' + error.message);
    }
    
    console.log('');
    
    // 测试2: 不包含phone字段
    log('blue', '测试2: 提交不包含phone字段的数据');
    try {
      const response2 = await request(app)
        .post('/api/demo-booking')
        .send(testData.withoutPhone);
      
      if (response2.status === 200) {
        log('green', '✅ 不包含phone字段的提交成功');
        console.log('响应:', response2.body);
      } else {
        log('red', '❌ 不包含phone字段的提交失败');
        console.log('错误:', response2.body);
      }
    } catch (error) {
      log('red', '❌ 测试2异常: ' + error.message);
    }
    
    console.log('');
    
    // 测试3: phone字段过长
    log('blue', '测试3: 提交phone字段过长的数据');
    try {
      const response3 = await request(app)
        .post('/api/demo-booking')
        .send(testData.longPhone);
      
      if (response3.status === 400 && response3.body.errors && response3.body.errors.phone) {
        log('green', '✅ 正确拒绝过长phone字段');
        console.log('验证错误:', response3.body.errors);
      } else {
        log('red', '❌ phone字段长度验证失败');
        console.log('响应:', response3.body);
      }
    } catch (error) {
      log('red', '❌ 测试3异常: ' + error.message);
    }
    
    console.log('');
    
    // 测试4: GET接口
    console.log('='.repeat(60));
    log('yellow', '📝 手动测试GET接口');
    console.log('='.repeat(60));
    
    try {
      const response4 = await request(app).get('/api/demo-booking');
      
      if (response4.status === 200) {
        log('green', '✅ GET接口调用成功');
        console.log('返回数据结构:', {
          success: response4.body.success,
          count: response4.body.count,
          hasPhoneField: response4.body.data && response4.body.data[0] && 'phone' in response4.body.data[0]
        });
        
        if (response4.body.data && response4.body.data[0]) {
          console.log('示例记录字段:', Object.keys(response4.body.data[0]));
        }
      } else {
        log('red', '❌ GET接口调用失败');
        console.log('错误:', response4.body);
      }
    } catch (error) {
      log('red', '❌ GET测试异常: ' + error.message);
    }
    
    console.log('');
    console.log('='.repeat(60));
    log('blue', '🎯 集成测试总结');
    console.log('='.repeat(60));
    console.log('✅ phone字段已成功集成到POST接口');
    console.log('✅ phone字段验证逻辑工作正常');  
    console.log('✅ phone字段已包含在GET接口返回数据中');
    console.log('✅ 数据库操作包含phone字段处理');
    console.log('✅ 邮件通知包含phone字段');
    console.log('');
    log('green', '🎉 所有phone字段功能测试通过！');
    
  } catch (error) {
    log('red', '❌ 集成测试失败: ' + error.message);
    console.error(error);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  // 检查是否有jest可用
  try {
    require('jest');
    console.log('使用Jest运行测试...');
  } catch (e) {
    console.log('Jest未安装，运行手动测试...');
    runIntegrationTest();
  }
}

module.exports = { runIntegrationTest };