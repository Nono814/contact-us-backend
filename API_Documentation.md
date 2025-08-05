# 联系表单API接口文档

## 基本信息
- **Base URL**: `http://localhost:3001`
- **数据库**: `get in touch`
- **认证**: 无需认证（管理接口建议添加认证）

## 数据库表结构

### 1. 招聘服务表 (hiring_submissions)
| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| id | INT | 主键，自增 | - |
| language | VARCHAR(10) | 语言，默认'en' | 否 |
| name | VARCHAR(100) | 联系人姓名 | ✅ |
| email | VARCHAR(100) | 邮箱地址 | ✅ |
| company | VARCHAR(100) | 公司名称 | 否 |
| company_size | VARCHAR(50) | 公司规模 | 否 |
| role_type | VARCHAR(50) | 职位类型 | 否 |
| special_requirements | TEXT | 特殊要求 | 否 |
| ip_address | VARCHAR(45) | IP地址（自动获取） | - |
| user_agent | TEXT | 用户代理（自动获取） | - |
| created_at | TIMESTAMP | 创建时间（自动） | - |
| updated_at | TIMESTAMP | 更新时间（自动） | - |

### 2. 雇主品牌服务表 (employer_branding_submissions)
| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| id | INT | 主键，自增 | - |
| language | VARCHAR(10) | 语言，默认'en' | 否 |
| name | VARCHAR(100) | 联系人姓名 | ✅ |
| email | VARCHAR(100) | 邮箱地址 | ✅ |
| company_name | VARCHAR(100) | 公司名称 | ✅ |
| company_size | VARCHAR(50) | 公司规模 | 否 |
| industry | VARCHAR(50) | 行业 | 否 |
| website | VARCHAR(200) | 公司网站 | 否 |
| additional_info | TEXT | 附加信息/需求描述 | 否 |
| ip_address | VARCHAR(45) | IP地址（自动获取） | - |
| user_agent | TEXT | 用户代理（自动获取） | - |
| created_at | TIMESTAMP | 创建时间（自动） | - |
| updated_at | TIMESTAMP | 更新时间（自动） | - |

### 3. 人工数据服务表 (human_data_submissions)
| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| id | INT | 主键，自增 | - |
| language | VARCHAR(10) | 语言，默认'en' | 否 |
| name | VARCHAR(100) | 联系人姓名 | ✅ |
| email | VARCHAR(100) | 邮箱地址 | ✅ |
| data_type | VARCHAR(50) | 数据类型 | 否 |
| expertise_area | VARCHAR(50) | 专业领域 | 否 |
| timeline | VARCHAR(50) | 项目时间线 | 否 |
| project_details | TEXT | 项目详细描述 | 否 |
| ip_address | VARCHAR(45) | IP地址（自动获取） | - |
| user_agent | TEXT | 用户代理（自动获取） | - |
| created_at | TIMESTAMP | 创建时间（自动） | - |
| updated_at | TIMESTAMP | 更新时间（自动） | - |

### 4. 数字克隆服务表 (digital_clone_submissions)
| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| id | INT | 主键，自增 | - |
| language | VARCHAR(10) | 语言，默认'en' | 否 |
| name | VARCHAR(100) | 联系人姓名 | ✅ |
| email | VARCHAR(100) | 邮箱地址 | ✅ |
| expertise_field | VARCHAR(50) | 专业领域 | 否 |
| experience | VARCHAR(50) | 经验水平 | 否 |
| target_audience | VARCHAR(50) | 目标受众 | 否 |
| monetization_goal | VARCHAR(50) | 变现目标 | 否 |
| time_commitment | VARCHAR(50) | 时间投入 | 否 |
| background | TEXT | 个人背景/详细描述 | 否 |
| ip_address | VARCHAR(45) | IP地址（自动获取） | - |
| user_agent | TEXT | 用户代理（自动获取） | - |
| created_at | TIMESTAMP | 创建时间（自动） | - |
| updated_at | TIMESTAMP | 更新时间（自动） | - |

### 5. 其他咨询表 (other_inquiries)
| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| id | INT | 主键，自增 | - |
| language | VARCHAR(10) | 语言，默认'en' | 否 |
| name | VARCHAR(100) | 联系人姓名 | ✅ |
| email | VARCHAR(100) | 邮箱地址 | ✅ |
| company | VARCHAR(100) | 公司名称（可选） | 否 |
| inquiry_type | VARCHAR(50) | 咨询类型 | 否 |
| message | TEXT | 留言内容 | ✅ |
| ip_address | VARCHAR(45) | IP地址（自动获取） | - |
| user_agent | TEXT | 用户代理（自动获取） | - |
| created_at | TIMESTAMP | 创建时间（自动） | - |
| updated_at | TIMESTAMP | 更新时间（自动） | - |

---

## API接口

### 1. 健康检查接口

#### `GET /health`
检查API服务状态

**响应示例：**
```json
{
  "status": "OK",
  "timestamp": "2024-08-04T12:00:00.000Z",
  "service": "Contact Form API"
}
```

---

### 2. 表单提交接口

#### `POST /api/contact`
提交联系表单数据

**请求头：**
```
Content-Type: application/json
```

**通用参数：**
| 参数 | 类型 | 说明 | 必填 |
|------|------|------|------|
| service | string | 服务类型：'hiring', 'employerBranding', 'humanData', 'digitalClone', 'other' | ✅ |
| _language | string | 语言代码，默认'en' | 否 |

#### 2.1 招聘服务提交 (service: 'hiring')

**请求参数：**
```json
{
  "service": "hiring",
  "_language": "en",
  "name": "张三",
  "email": "zhangsan@example.com",
  "company": "ABC科技有限公司",
  "companySize": "51-200人",
  "roleType": "前端工程师",
  "specialRequirements": "需要有React经验"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "id": 123,
  "redirectUrl": "/thank-you?lang=en"
}
```

#### 2.2 雇主品牌服务提交 (service: 'employerBranding')

**请求参数：**
```json
{
  "service": "employerBranding",
  "_language": "zh",
  "employerBranding_name": "张经理",
  "employerBranding_companyName": "XYZ集团",
  "employerBranding_email": "hr@xyz.com",
  "employerBranding_companySize": "500+",
  "industry": "互联网",
  "website": "https://www.xyz.com",
  "additionalInfo": "希望提升雇主品牌形象"
}
```

#### 2.3 人工数据服务提交 (service: 'humanData')

**请求参数：**
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

#### 2.4 数字克隆服务提交 (service: 'digitalClone')

**请求参数：**
```json
{
  "service": "digitalClone",
  "_language": "en",
  "digitalClone_name": "王五",
  "digitalClone_email": "wangwu@example.com",
  "expertiseField": "市场营销",
  "experience": "5-10年",
  "targetAudience": "企业客户",
  "monetizationGoal": "咨询服务",
  "timeCommitment": "每周10小时",
  "background": "有丰富的B2B营销经验"
}
```

#### 2.5 其他咨询提交 (service: 'other')

**请求参数：**
```json
{
  "service": "other",
  "_language": "zh",
  "name": "赵六",
  "email": "zhaoliu@example.com",
  "company": "DEF公司",
  "inquiryType": "合作咨询",
  "message": "希望了解更多合作机会"
}
```

**错误响应示例：**
```json
{
  "success": false,
  "error": "Service type is required"
}
```

```json
{
  "success": false,
  "error": "Email is required"
}
```

```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Failed to process contact form submission"
}
```

---

### 3. 管理接口

#### `GET /api/admin/contacts`
获取联系表单提交记录（管理员使用）

**查询参数：**
| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| page | number | 页码 | 1 |
| limit | number | 每页数量 | 50 |
| service | string | 服务类型筛选 | 无（显示所有） |
| startDate | string | 开始日期 (YYYY-MM-DD) | 无 |
| endDate | string | 结束日期 (YYYY-MM-DD) | 无 |

**请求示例：**
```
GET /api/admin/contacts?page=1&limit=20&service=hiring&startDate=2024-08-01
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "service": "hiring",
      "language": "en",
      "name": "张三",
      "email": "zhangsan@example.com",
      "company": "ABC科技",
      "company_size": "51-200人",
      "role_type": "前端工程师",
      "special_requirements": "需要有React经验",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2024-08-04T12:00:00.000Z",
      "updated_at": "2024-08-04T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

#### `GET /admin`
管理后台界面
返回管理后台HTML页面

---

## 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 500 | 服务器内部错误 |

---

## 部署说明

1. **环境变量配置 (.env)**：
```env
DB_HOST=dbconn.sealosbja.site
DB_PORT=43919
DB_USER=root
DB_PASSWORD=qrzk4ts4
DB_NAME=get in touch
PORT=3001
NODE_ENV=production
```

2. **启动服务**：
```bash
npm start
```

3. **API地址**：
- 本地开发：`http://localhost:3001`
- 生产环境：根据部署环境调整

---

## 前端集成示例

### JavaScript/Fetch示例

```javascript
// 提交招聘表单
async function submitHiringForm(formData) {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service: 'hiring',
        _language: 'zh',
        name: formData.name,
        email: formData.email,
        company: formData.company,
        companySize: formData.companySize,
        roleType: formData.roleType,
        specialRequirements: formData.specialRequirements
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // 跳转到感谢页面
      window.location.href = result.redirectUrl;
    } else {
      console.error('提交失败:', result.error);
    }
  } catch (error) {
    console.error('网络错误:', error);
  }
}
```

### Vue.js示例

```vue
<template>
  <form @submit.prevent="submitForm">
    <input v-model="form.name" type="text" placeholder="姓名" required>
    <input v-model="form.email" type="email" placeholder="邮箱" required>
    <select v-model="form.service" required>
      <option value="hiring">招聘服务</option>
      <option value="employerBranding">雇主品牌</option>
      <option value="humanData">人工数据</option>
      <option value="digitalClone">数字克隆</option>
      <option value="other">其他咨询</option>
    </select>
    <button type="submit">提交</button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      form: {
        service: '',
        name: '',
        email: ''
      }
    }
  },
  methods: {
    async submitForm() {
      try {
        const response = await this.$http.post('/api/contact', {
          ...this.form,
          _language: this.$i18n.locale
        });
        
        if (response.data.success) {
          this.$router.push(response.data.redirectUrl);
        }
      } catch (error) {
        console.error('提交失败:', error);
      }
    }
  }
}
</script>
```

---

## 注意事项

1. **CORS配置**：API已配置CORS，支持以下域名：
   - `http://localhost:3000`
   - `http://localhost:5173`
   - `https://yoursite.com`

2. **数据验证**：
   - `service` 字段必填
   - `email` 字段必填且格式正确
   - 根据不同服务类型，某些字段为必填

3. **安全建议**：
   - 管理接口建议添加身份认证
   - 生产环境建议添加请求频率限制
   - 敏感数据传输建议使用HTTPS

4. **数据库连接**：
   - 使用连接池管理数据库连接
   - 自动重连机制
   - 支持事务处理