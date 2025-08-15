# Demo预约表单后端接口文档

## 接口概述

本文档描述了Demo预约表单的后端API接口，用于接收用户提交的预约信息并发送邮件通知。

## 接口详情

### 1. 提交Demo预约

**接口地址：** `POST /api/demo-booking`

**请求头：**
```
Content-Type: application/json
```

**请求参数：**

| 字段名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| firstName | string | 是 | 用户名字 | "Jane" |
| lastName | string | 是 | 用户姓氏 | "Smith" |
| email | string | 是 | 用户企业邮箱 | "jane.smith@company.com" |
| company | string | 是 | 公司名称 | "ABC Technology Inc." |
| roles | array | 是 | 职位描述(多选) | ["engineering", "product"] |
| mainGoal | string | 是 | 主要需求 | "aiTraining" |
| budget | string | 是 | 预算范围 | "medium" |
| emailUpdates | string | 是 | 邮件订阅偏好 | "yes" |
| language | string | 否 | 用户语言偏好 | "en" 或 "zh" |
| timestamp | string | 否 | 提交时间戳 | "2024-01-15T10:30:00Z" |

**字段值说明：**

#### roles (职位描述) - 多选数组
```json
// 可选值及对应标签
[
  { "id": "research", "label_en": "Research", "label_zh": "研究" },
  { "id": "engineering", "label_en": "Engineering", "label_zh": "工程技术" },
  { "id": "product", "label_en": "Product", "label_zh": "产品" },
  { "id": "operations", "label_en": "Operations", "label_zh": "运营" },
  { "id": "recruiting", "label_en": "Recruiting / HR", "label_zh": "招聘 / 人力资源" },
  { "id": "executive", "label_en": "Executive", "label_zh": "高管" },
  { "id": "procurement", "label_en": "Procurement / Legal", "label_zh": "采购 / 法务" },
  { "id": "other", "label_en": "Other", "label_zh": "其他" }
]
```

#### mainGoal (主要需求) - 单选
```json
// 可选值及对应标签
[
  { "id": "aiTraining", "label_en": "Finding talent for AI training data & evaluation", "label_zh": "寻找AI训练数据与评估相关人才" },
  { "id": "hiring", "label_en": "Hiring full-time or contract workers to join my team", "label_zh": "招聘全职或合同员工加入我的团队" },
  { "id": "platform", "label_en": "I want to learn more about your platform", "label_zh": "我想了解更多关于您的平台" }
]
```

#### budget (预算范围) - 单选
```json
// 可选值及对应标签
[
  { "id": "large", "label_en": "> $200,000 / quarter (10+ people)", "label_zh": "> ¥200万 / 季度 (10+ 人)" },
  { "id": "medium", "label_en": "$50,000 - $200,000 / quarter (3 - 10 people)", "label_zh": "¥50万 - ¥200万 / 季度 (3 - 10 人)" },
  { "id": "small", "label_en": "< $50,000 / quarter (1 - 2 people)", "label_zh": "< ¥50万 / 季度 (1 - 2 人)" },
  { "id": "explore", "label_en": "No specific project in mind yet, I just want to learn more", "label_zh": "暂无具体项目，只想了解更多" }
]
```

#### emailUpdates (邮件订阅偏好) - 单选
```json
// 可选值及对应标签
[
  { "id": "yes", "label_en": "Yes", "label_zh": "是的" },
  { "id": "no", "label_en": "Not right now", "label_zh": "暂时不需要" }
]
```

**请求示例：**
```json
{
  "firstName": "Jane",
  "lastName": "Smith", 
  "email": "jane.smith@techcompany.com",
  "company": "Tech Company Inc.",
  "roles": ["engineering", "product"],
  "mainGoal": "aiTraining",
  "budget": "medium",
  "emailUpdates": "yes",
  "language": "en",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**响应格式：**

成功响应 (200):
```json
{
  "success": true,
  "message": "Demo booking submitted successfully",
  "id": "db_20240115103000_abc123",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

失败响应 (400):
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

服务器错误 (500):
```json
{
  "success": false,
  "message": "Internal server error",
  "error_id": "err_20240115103000_xyz789"
}
```

## 数据验证规则

### 必填字段验证
- `firstName`: 非空字符串，长度1-50字符
- `lastName`: 非空字符串，长度1-50字符  
- `email`: 有效的邮箱格式
- `company`: 非空字符串，长度1-100字符
- `roles`: 非空数组，至少包含一个有效的role值
- `mainGoal`: 必须是有效的选项值之一
- `budget`: 必须是有效的选项值之一
- `emailUpdates`: 必须是有效的选项值之一

### 可选字段验证
- `language`: 如果提供，必须是 "en" 或 "zh"
- `timestamp`: 如果提供，必须是有效的ISO 8601格式

## 邮件通知需求

### 内部通知邮件
当有新的Demo预约提交时，系统应发送邮件到指定的内部邮箱地址。

**邮件主题：** `[Demo预约] ${company} - ${firstName} ${lastName}`

**邮件内容模板：**
```
新的Demo预约申请

基本信息：
- 姓名：${firstName} ${lastName}
- 邮箱：${email}
- 公司：${company}

详细信息：
- 职位：${roles的标签，用逗号分隔}
- 主要需求：${mainGoal的标签}
- 预算范围：${budget的标签}
- 邮件订阅：${emailUpdates的标签}

提交时间：${timestamp}
提交ID：${id}

请及时联系客户安排Demo演示。
```

### 用户确认邮件（可选）
可选择向用户发送确认邮件。

**邮件主题：** 
- 英文：`Demo Request Received - We'll be in touch soon!`
- 中文：`Demo预约申请已收到 - 我们很快联系您！`

## 安全考虑

1. **输入验证**: 对所有输入进行严格验证，防止XSS和注入攻击
2. **频率限制**: 建议对同一IP或邮箱地址进行提交频率限制（如5分钟内最多1次）
3. **邮箱验证**: 验证邮箱格式的有效性
4. **数据存储**: 敏感信息应妥善存储，遵守数据保护法规

## 技术建议

1. **数据库设计**: 建议创建表结构存储提交记录，便于后续分析和跟进
2. **邮件服务**: 使用可靠的邮件服务提供商（如SendGrid、AWS SES等）
3. **日志记录**: 记录所有API调用和处理结果，便于监控和调试
4. **错误处理**: 提供详细的错误信息，便于前端进行用户友好的错误提示

## 环境变量配置建议

```env
# 邮件配置
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@yourcompany.com
SMTP_PASS=your_password

# 通知邮箱
DEMO_NOTIFICATION_EMAIL=demo-requests@yourcompany.com

# 数据库配置
DATABASE_URL=postgresql://user:pass@localhost:5432/demodb

# API配置
API_RATE_LIMIT_WINDOW=300000  # 5分钟
API_RATE_LIMIT_MAX=1          # 最大请求数
```

---

**注意**: 请确保所有字段名称与前端完全一致，避免因为字段名不匹配导致的数据丢失或错误。