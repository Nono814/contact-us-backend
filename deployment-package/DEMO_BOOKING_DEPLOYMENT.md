# Demo预约表单后端接口 - 部署说明

## 📋 概述

本文档详细说明了如何部署和配置Demo预约表单后端接口。该接口严格按照 `demo-booking-api-docs.md` 中的规范实现，提供完整的数据验证、邮件通知和错误处理功能。

## 🚀 快速开始

### 前置要求

- Node.js >= 16.0.0
- MySQL >= 5.7 或 8.0
- PM2 (生产环境推荐)

### 1. 数据库设置

首先，在你的MySQL数据库中执行以下SQL语句创建Demo预约表：

```sql
-- Demo预约表
CREATE TABLE demo_bookings (
  id VARCHAR(50) PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(100) NOT NULL,
  roles JSON NOT NULL,
  main_goal VARCHAR(50) NOT NULL,
  budget VARCHAR(50) NOT NULL,
  email_updates VARCHAR(10) NOT NULL,
  language VARCHAR(5) DEFAULT 'en',
  timestamp DATETIME(3) NOT NULL,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  
  INDEX idx_email (email),
  INDEX idx_company (company),
  INDEX idx_timestamp (timestamp),
  INDEX idx_created_at (created_at)
);
```

### 2. 环境配置

在 `config.env` 文件中添加以下配置：

```env
# Demo预约邮件通知配置
DEMO_NOTIFICATION_EMAIL=demo-requests@yourcompany.com

# 邮件服务配置 (如果还没有配置的话)
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=your-email@163.com
SMTP_PASS=your-smtp-authorization-code

# 数据库配置 (如果还没有配置的话)
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
DB_SSL=false

# API配置
API_RATE_LIMIT_WINDOW=300000  # 5分钟 (Demo预约专用频率限制)
API_RATE_LIMIT_MAX=1          # 每5分钟最多1次预约请求
```

### 3. 安装依赖

如果是第一次部署，确保已安装所有依赖：

```bash
npm install
```

### 4. 启动服务

#### 开发环境
```bash
npm run dev
```

#### 生产环境
```bash
# 使用PM2启动
pm2 start ecosystem.config.js

# 或直接启动
npm start
```

### 5. 验证部署

部署完成后，可以通过以下方式验证：

1. **健康检查**:
   ```bash
   curl http://localhost:8080/health
   ```

2. **API测试**:
   ```bash
   # 运行自动化测试
   node test_demo_booking_api.js
   
   # 查看CURL示例
   node test_demo_booking_api.js --curl
   
   # 生成Postman集合
   node test_demo_booking_api.js --postman
   ```

## 🔧 配置详情

### 邮件通知配置

系统会在收到Demo预约时发送邮件通知到指定邮箱。邮件内容包括：

- **邮件主题**: `[Demo预约] {公司名称} - {姓名}`
- **邮件内容**: 包含完整的预约信息和处理建议
- **语言支持**: 根据用户选择的语言显示对应的标签

### 频率限制

- **全局限制**: 每15分钟最多100个API请求
- **Demo预约专用限制**: 每5分钟每个IP+邮箱组合最多1次预约请求
- **重复提交检查**: 相同邮箱在5分钟内不能重复提交

### 数据验证规则

严格按照接口文档执行以下验证：

- `firstName`: 1-50字符，非空
- `lastName`: 1-50字符，非空  
- `email`: 有效邮箱格式
- `company`: 1-100字符，非空
- `roles`: 非空数组，包含有效选项
- `mainGoal`: 有效选项值（aiTraining/hiring/platform）
- `budget`: 有效选项值（large/medium/small/explore）
- `emailUpdates`: 有效选项值（yes/no）
- `language`: 可选，en或zh
- `timestamp`: 可选，有效ISO 8601格式

## 📊 监控和日志

### 日志记录

系统会记录以下信息：

- API请求和响应
- 数据验证错误
- 邮件发送状态
- 数据库操作结果
- 频率限制触发

### 监控要点

1. **数据库连接状态**
2. **邮件服务可用性**
3. **API响应时间**
4. **错误率统计**

## 🔒 安全考虑

### 已实现的安全措施

1. **输入验证**: 所有字段严格验证，防止XSS和注入攻击
2. **频率限制**: 防止恶意刷量和重复提交
3. **邮箱验证**: 验证邮箱格式有效性
4. **数据清理**: HTML转义处理，防止脚本注入
5. **错误处理**: 不暴露敏感的内部信息

### 安全配置建议

1. **HTTPS**: 生产环境必须使用HTTPS
2. **数据库权限**: 使用最小权限原则
3. **邮件密码**: 使用授权码而非明文密码
4. **错误日志**: 不要在日志中记录敏感信息

## 🧪 API测试

### 基本测试示例

```bash
# 有效数据测试
curl -X POST http://localhost:8080/api/demo-booking \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith", 
    "email": "jane.smith@techcompany.com",
    "company": "Tech Company Inc.",
    "roles": ["engineering", "product"],
    "mainGoal": "aiTraining",
    "budget": "medium",
    "emailUpdates": "yes",
    "language": "en"
  }'
```

### 预期响应

成功响应 (200):
```json
{
  "success": true,
  "message": "Demo booking submitted successfully",
  "id": "db_20240115103000_abc123",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

验证错误 (400):
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": "Invalid email format",
    "roles": "At least one role must be selected"
  }
}
```

## 📱 前端集成

### JavaScript示例

```javascript
async function submitDemoBooking(formData) {
  try {
    const response = await fetch('/api/demo-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // 成功处理
      console.log('预约成功:', result.id);
    } else {
      // 错误处理
      console.log('验证错误:', result.errors);
    }
  } catch (error) {
    console.error('提交失败:', error);
  }
}
```

### React示例

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const response = await fetch('/api/demo-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      setSuccess(true);
      setBookingId(result.id);
    } else {
      setErrors(result.errors);
    }
  } catch (error) {
    setError('提交失败，请稍后重试');
  } finally {
    setLoading(false);
  }
};
```

## 🔄 备份和恢复

### 数据备份

```bash
# 备份Demo预约数据
mysqldump -u username -p database_name demo_bookings > demo_bookings_backup.sql
```

### 数据恢复

```bash
# 恢复数据
mysql -u username -p database_name < demo_bookings_backup.sql
```

## 🚨 故障排除

### 常见问题

1. **邮件发送失败**
   - 检查SMTP配置
   - 验证邮箱授权码
   - 确认网络连接

2. **数据库连接失败**
   - 检查数据库服务状态
   - 验证连接参数
   - 确认表是否存在

3. **频率限制问题**
   - 检查IP地址获取
   - 调整限制参数
   - 清理Redis缓存（如果使用）

4. **字段验证错误**
   - 确认字段名称完全匹配
   - 检查数据类型
   - 验证选项值是否有效

### 日志查看

```bash
# 查看PM2日志
pm2 logs

# 查看应用日志
tail -f server.log

# 查看错误日志
pm2 logs --err
```

## 📞 支持和维护

如果在部署过程中遇到问题，请检查：

1. 所有环境变量是否正确配置
2. 数据库表是否成功创建
3. 邮件服务是否可用
4. 网络端口是否开放

更多技术支持，请参考项目的其他文档文件或联系开发团队。