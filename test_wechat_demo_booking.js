const axios = require('axios');

// 测试配置
const BASE_URL = 'http://localhost:3000/api';
const TEST_EMAIL = `test_wechat_${Date.now()}@example.com`;

// 测试数据 - 中文版（选择微信号）
const testDataWechat = {
  firstName: '张',
  lastName: '三',
  email: TEST_EMAIL,
  wechatId: 'zhangsan_wechat_123',
  contactType: 'wechat',
  company: '测试科技有限公司',
  roles: ['engineering', 'product'],
  mainGoal: 'aiTraining',
  budget: 'medium',
  emailUpdates: 'yes',
  language: 'zh'
};

// 测试数据 - 英文版（选择手机号）
const testDataPhone = {
  firstName: 'John',
  lastName: 'Doe',
  email: `test_phone_${Date.now()}@example.com`,
  phone: '+1-555-123-4567',
  contactType: 'phone',
  company: 'Test Tech Inc',
  roles: ['research', 'executive'],
  mainGoal: 'hiring',
  budget: 'large',
  emailUpdates: 'no',
  language: 'en'
};

// 测试数据 - 无效数据（缺少必填字段）
const testDataInvalid = {
  firstName: 'Invalid',
  lastName: 'Test',
  email: 'invalid@example.com',
  contactType: 'wechat',
  // 缺少 wechatId
  company: 'Test Company',
  roles: ['engineering'],
  mainGoal: 'aiTraining',
  budget: 'medium',
  emailUpdates: 'yes',
  language: 'en'
};

async function testDemoBooking() {
  console.log('🚀 开始测试Demo预约接口的微信号支持功能...\n');

  try {
    // 测试1: 中文版 - 选择微信号
    console.log('📱 测试1: 中文版 - 选择微信号');
    console.log('请求数据:', JSON.stringify(testDataWechat, null, 2));
    
    const response1 = await axios.post(`${BASE_URL}/demo-booking`, testDataWechat);
    console.log('✅ 响应状态:', response1.status);
    console.log('✅ 响应数据:', JSON.stringify(response1.data, null, 2));
    console.log('');

    // 测试2: 英文版 - 选择手机号
    console.log('📞 测试2: 英文版 - 选择手机号');
    console.log('请求数据:', JSON.stringify(testDataPhone, null, 2));
    
    const response2 = await axios.post(`${BASE_URL}/demo-booking`, testDataPhone);
    console.log('✅ 响应状态:', response2.status);
    console.log('✅ 响应数据:', JSON.stringify(response2.data, null, 2));
    console.log('');

    // 测试3: 无效数据验证
    console.log('❌ 测试3: 无效数据验证（缺少wechatId）');
    console.log('请求数据:', JSON.stringify(testDataInvalid, null, 2));
    
    try {
      const response3 = await axios.post(`${BASE_URL}/demo-booking`, testDataInvalid);
      console.log('❌ 应该失败但成功了:', response3.status);
    } catch (error) {
      console.log('✅ 正确失败:', error.response.status);
      console.log('✅ 错误信息:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('');

    // 测试4: 查询接口
    console.log('🔍 测试4: 查询接口');
    const queryResponse = await axios.get(`${BASE_URL}/demo-booking?email=${TEST_EMAIL}`);
    console.log('✅ 查询状态:', queryResponse.status);
    console.log('✅ 查询结果:', JSON.stringify(queryResponse.data, null, 2));

    console.log('\n🎉 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// 运行测试
if (require.main === module) {
  testDemoBooking();
}

module.exports = { testDemoBooking };
