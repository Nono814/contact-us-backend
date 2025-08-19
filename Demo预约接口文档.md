# Demo预约接口文档

## 接口概述

Demo预约接口用于处理用户的产品演示预约申请，包含完整的数据验证、邮件通知和数据存储功能。

## 基本信息

- **接口地址**: `POST /api/demo-booking`
- **请求方式**: POST
- **内容类型**: application/json
- **数据库**: get in touch
- **认证方式**: 无需认证

## 请求参数

### 请求头

```http
Content-Type: application/json
```

### 请求体参数

| 参数名 | 类型 | 必填 | 长度限制 | 描述 | 示例值 |
|--------|------|------|----------|------|--------|
| firstName | string | ✅ | ≤50字符 | 用户名字 | "张" |
| lastName | string | ✅ | ≤50字符 | 用户姓氏 | "三" |
| email | string | ✅ | - | 用户邮箱地址 | "zhangsan@company.com" |
| company | string | ✅ | ≤100字符 | 公司名称 | "科技有限公司" |
| roles | array | ✅ | - | 职位角色(多选) | ["engineering", "product"] |
| mainGoal | string | ✅ | - | 主要目标 | "aiTraining" |
| budget | string | ✅ | - | 预算范围 | "medium" |
| emailUpdates | string | ✅ | - | 邮件订阅偏好 | "yes" |
| language | string | ❌ | - | 语言偏好 | "zh" (默认: "en") |
| timestamp | string | ❌ | - | 提交时间戳 | "2024-01-15T10:30:00Z" |

## 字段选项说明

### 1. roles (职位角色) - 多选数组

| 值 | 英文标签 | 中文标签 |
|----|----------|----------|
| research | Research | 研究 |
| engineering | Engineering | 工程技术 |
| product | Product | 产品 |
| operations | Operations | 运营 |
| recruiting | Recruiting / HR | 招聘 / 人力资源 |
| executive | Executive | 高管 |
| procurement | Procurement / Legal | 采购 / 法务 |
| other | Other | 其他 |

### 2. mainGoal (主要目标) - 单选

| 值 | 英文标签 | 中文标签 |
|----|----------|----------|
| aiTraining | Finding talent for AI training data & evaluation | 寻找AI训练数据与评估相关人才 |
| hiring | Hiring full-time or contract workers to join my team | 招聘全职或合同员工加入我的团队 |
| platform | I want to learn more about your platform | 我想了解更多关于您的平台 |

### 3. budget (预算范围) - 单选

| 值 | 英文标签 | 中文标签 |
|----|----------|----------|
| large | > $200,000 / quarter (10+ people) | > ¥200万 / 季度 (10+ 人) |
| medium | $50,000 - $200,000 / quarter (3 - 10 people) | ¥50万 - ¥200万 / 季度 (3 - 10 人) |
| small | < $50,000 / quarter (1 - 2 people) | < ¥50万 / 季度 (1 - 2 人) |
| explore | No specific project in mind yet, I just want to learn more | 暂无具体项目，只想了解更多 |

### 4. emailUpdates (邮件订阅) - 单选

| 值 | 英文标签 | 中文标签 |
|----|----------|----------|
| yes | Yes | 是的 |
| no | Not right now | 暂时不需要 |

### 5. language (语言偏好) - 单选

| 值 | 描述 |
|----|------|
| en | 英文 (默认) |
| zh | 中文 |

## 请求示例

### 基础请求示例

```json
{
  "firstName": "张",
  "lastName": "三",
  "email": "zhangsan@company.com",
  "company": "ABC科技有限公司",
  "roles": ["engineering", "product"],
  "mainGoal": "aiTraining",
  "budget": "medium",
  "emailUpdates": "yes",
  "language": "zh"
}
```

### 完整请求示例

```json
{
  "firstName": "李",
  "lastName": "四",
  "email": "lisi@techcompany.com",
  "company": "创新科技有限公司",
  "roles": ["executive", "procurement"],
  "mainGoal": "hiring",
  "budget": "large",
  "emailUpdates": "yes",
  "language": "zh",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 响应格式

### 成功响应 (HTTP 200)

```json
{
  "success": true,
  "message": "Demo booking submitted successfully",
  "id": "db_10",
  "timestamp": "2025-08-17T07:56:07.883Z"
}
```

### 验证失败响应 (HTTP 400)

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "firstName": "First name is required",
    "email": "Invalid email format",
    "roles": "At least one role must be selected"
  }
}
```

### 重复提交响应 (HTTP 400)

```json
{
  "success": false,
  "message": "A demo booking with this email was already submitted recently",
  "error_code": "DUPLICATE_SUBMISSION"
}
```

### 频率限制响应 (HTTP 429)

```json
{
  "success": false,
  "message": "Too many demo booking requests, please try again later",
  "error_code": "RATE_LIMIT_EXCEEDED"
}
```

## 验证规则

### 必填字段验证
- `firstName`: 不能为空，长度 ≤ 50字符
- `lastName`: 不能为空，长度 ≤ 50字符
- `email`: 必须符合邮箱格式规范
- `company`: 不能为空，长度 ≤ 100字符
- `roles`: 必须至少选择一个有效选项
- `mainGoal`: 必须是有效的选项值
- `budget`: 必须是有效的选项值
- `emailUpdates`: 必须是有效的选项值

### 可选字段验证
- `language`: 如提供，必须是 'en' 或 'zh'
- `timestamp`: 如提供，必须是有效的ISO时间格式

## 业务规则

### 频率限制
- **限制规则**: 每5分钟最多提交1次预约请求
- **识别方式**: 基于IP地址和邮箱地址组合
- **限制范围**: 单个IP地址

### 重复提交检测
- **检测规则**: 相同邮箱地址在5分钟内不能重复提交
- **检测范围**: 全局检测

## 功能特性

### 📧 邮件通知
- **自动发送**: 提交成功后自动发送邮件通知给管理员
- **邮件内容**: 包含完整的预约信息和处理建议
- **收件人**: 配置的管理员邮箱列表

### 💾 数据存储
- **数据库表**: `demo_bookings`
- **存储内容**: 完整的预约信息、IP地址、用户代理等
- **数据完整性**: 包含创建时间、更新时间等元数据

### 🔒 安全特性
- **输入验证**: 严格的数据验证和清理
- **SQL注入防护**: 使用参数化查询
- **XSS防护**: 输出时进行HTML转义

## 测试示例

### cURL 测试

```bash
curl -X POST http://localhost:8080/api/demo-booking \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "张",
    "lastName": "三",
    "email": "zhangsan@example.com",
    "company": "测试科技有限公司",
    "roles": ["engineering"],
    "mainGoal": "platform",
    "budget": "small",
    "emailUpdates": "yes",
    "language": "zh"
  }'
```

### JavaScript 测试

```javascript
const response = await fetch('/api/demo-booking', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    firstName: '李',
    lastName: '四',
    email: 'lisi@company.com',
    company: '创新科技',
    roles: ['product', 'executive'],
    mainGoal: 'hiring',
    budget: 'medium',
    emailUpdates: 'yes',
    language: 'zh'
  })
});

const result = await response.json();
console.log(result);
```

## 错误码说明

| 错误码 | HTTP状态码 | 描述 |
|--------|------------|------|
| VALIDATION_ERROR | 400 | 数据验证失败 |
| DUPLICATE_SUBMISSION | 400 | 重复提交 |
| RATE_LIMIT_EXCEEDED | 429 | 请求频率过高 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

## 性能指标

- **平均响应时间**: < 15ms
- **数据库操作**: 2-3次查询
- **邮件发送**: 异步处理，不影响响应时间
- **并发支持**: 支持集群模式

## 监控和日志

### 请求日志格式
```
[requestId] Demo booking request started
[requestId] Demo booking saved with ID: {id}
[requestId] Demo booking completed in {time}ms
✅ Demo预约邮件通知发送成功 - ID: {bookingId}
[requestId] Email notification sent successfully
```

### 关键指标
- 请求处理时间
- 成功/失败率
- 邮件发送状态
- 数据库连接状态

## 相关接口

- **健康检查**: `GET /health`
- **管理后台**: `GET /admin`
- **联系表单**: `POST /api/contact`

## 更新日志

### v1.0.0 (当前版本)
- ✅ 完整的数据验证机制
- ✅ 邮件通知功能
- ✅ 频率限制和重复检测
- ✅ 多语言支持
- ✅ 完整的错误处理

---

**注意事项**:
1. 所有时间戳均为UTC时间
2. 邮件发送为异步操作，失败不影响接口响应
3. 建议在生产环境中配置适当的监控和告警
4. 定期检查数据库连接和邮件服务状态
