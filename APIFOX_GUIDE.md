# Apifox 使用指南

## 快速开始

### 1. 导入项目配置

1. 打开 Apifox
2. 点击 "导入" 按钮
3. 选择 "OpenAPI 3.0" 格式
4. 导入 `apifox_project.json` 文件

### 2. 配置环境

1. 在 Apifox 中创建环境
2. 设置环境变量：
   - `baseUrl`: `http://localhost:3001`
   - `port`: `3001`

## 接口测试步骤

### 1. 健康检查测试

**接口**: `GET /health`

1. 在 Apifox 中找到 "健康检查" 接口
2. 点击 "发送" 按钮
3. 预期响应：
```json
{
  "status": "OK",
  "timestamp": "2024-08-04T12:00:00.000Z",
  "service": "Contact Form API"
}
```

### 2. 招聘服务测试

**接口**: `POST /api/contact`

1. 选择 "招聘服务" 示例
2. 修改请求体数据：
```json
{
  "service": "hiring",
  "_language": "zh",
  "name": "张三",
  "email": "zhangsan@example.com",
  "company": "ABC科技有限公司",
  "companySize": "51-200人",
  "roleType": "前端工程师",
  "specialRequirements": "需要有React经验"
}
```
3. 点击 "发送"
4. 预期响应：
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "id": 123,
  "redirectUrl": "/thank-you?lang=zh"
}
```

### 3. 雇主品牌服务测试

**接口**: `POST /api/contact`

1. 选择 "雇主品牌服务" 示例
2. 修改请求体数据：
```json
{
  "service": "employerBranding",
  "_language": "zh",
  "employerBranding_name": "王经理",
  "employerBranding_email": "hr@xyz.com",
  "employerBranding_companyName": "XYZ集团",
  "employerBranding_companySize": "500+",
  "industry": "互联网",
  "website": "https://www.xyz.com",
  "additionalInfo": "希望提升雇主品牌形象"
}
```
3. 点击 "发送"

### 4. 人工数据服务测试

**接口**: `POST /api/contact`

1. 选择 "人工数据服务" 示例
2. 修改请求体数据：
```json
{
  "service": "humanData",
  "_language": "en",
  "humanData_name": "李四",
  "humanData_email": "lisi@example.com",
  "dataType": "文本标注",
  "expertiseArea": "自然语言处理",
  "timeline": "1-3个月",
  "projectDetails": "需要标注10万条中文语料"
}
```
3. 点击 "发送"

### 5. 管理后台测试

**接口**: `GET /api/admin/contacts`

1. 添加查询参数：
   - `page`: `1`
   - `limit`: `10`
   - `service`: `hiring` (可选)
2. 点击 "发送"

## 测试用例集合

### 创建测试用例

1. 在 Apifox 中创建测试用例集合
2. 添加以下测试用例：

#### 测试用例 1: 健康检查
- 方法: GET
- URL: `/health`
- 预期状态码: 200

#### 测试用例 2: 招聘服务提交
- 方法: POST
- URL: `/api/contact`
- 请求体: 招聘服务示例数据
- 预期状态码: 200
- 预期响应: `success: true`

#### 测试用例 3: 雇主品牌服务提交
- 方法: POST
- URL: `/api/contact`
- 请求体: 雇主品牌服务示例数据
- 预期状态码: 200

#### 测试用例 4: 人工数据服务提交
- 方法: POST
- URL: `/api/contact`
- 请求体: 人工数据服务示例数据
- 预期状态码: 200

#### 测试用例 5: 无效提交测试
- 方法: POST
- URL: `/api/contact`
- 请求体: `{"service": "hiring"}` (缺少必填字段)
- 预期状态码: 500

### 运行测试集合

1. 选择测试用例集合
2. 点击 "运行" 按钮
3. 查看测试结果

## 环境变量配置

### 本地开发环境
```json
{
  "baseUrl": "http://localhost:3001",
  "port": "3001"
}
```

### 生产环境
```json
{
  "baseUrl": "https://your-production-domain.com",
  "port": "443"
}
```

## 常用测试数据

### 招聘服务测试数据
```json
{
  "service": "hiring",
  "_language": "zh",
  "name": "测试用户",
  "email": "test@example.com",
  "company": "测试公司",
  "companySize": "51-200人",
  "roleType": "后端工程师",
  "specialRequirements": "测试要求"
}
```

### 雇主品牌服务测试数据
```json
{
  "service": "employerBranding",
  "_language": "zh",
  "employerBranding_name": "测试经理",
  "employerBranding_email": "hr@test.com",
  "employerBranding_companyName": "测试集团",
  "employerBranding_companySize": "201-500人",
  "industry": "互联网",
  "website": "https://www.test.com",
  "additionalInfo": "测试信息"
}
```

### 人工数据服务测试数据
```json
{
  "service": "humanData",
  "_language": "en",
  "humanData_name": "Test User",
  "humanData_email": "test@data.com",
  "dataType": "文本标注",
  "expertiseArea": "自然语言处理",
  "timeline": "1-3个月",
  "projectDetails": "Test project details"
}
```

## 错误处理测试

### 测试缺少必填字段
```json
{
  "service": "hiring",
  "_language": "zh"
  // 缺少 name 和 email
}
```

### 测试无效邮箱格式
```json
{
  "service": "hiring",
  "_language": "zh",
  "name": "测试用户",
  "email": "invalid-email",
  "company": "测试公司"
}
```

### 测试无效服务类型
```json
{
  "service": "invalidService",
  "_language": "zh",
  "name": "测试用户",
  "email": "test@example.com"
}
```

## 性能测试

### 并发测试
1. 在 Apifox 中设置并发用户数
2. 运行招聘服务提交接口
3. 观察响应时间和成功率

### 压力测试
1. 设置高并发用户数
2. 运行健康检查接口
3. 监控服务器性能

## 自动化测试

### 创建自动化测试脚本
1. 在 Apifox 中创建测试脚本
2. 设置测试前置条件
3. 添加断言验证响应
4. 设置测试后置处理

### 持续集成
1. 导出测试脚本
2. 集成到 CI/CD 流程
3. 设置自动化测试触发条件

## 常见问题

### Q: 接口返回 404 错误
A: 检查服务器是否启动，URL 是否正确

### Q: 接口返回 500 错误
A: 检查请求参数是否完整，服务器日志

### Q: 跨域问题
A: 确认 CORS 配置正确

### Q: 数据库连接失败
A: 检查数据库配置和网络连接

## 联系支持

如有问题，请查看：
- API 文档: `API_Documentation.md`
- 各服务详细文档
- 服务器日志文件 