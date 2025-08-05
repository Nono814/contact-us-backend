# Contact Us API 接口文档

## 基本信息
- **Base URL**: `http://localhost:8080` (或您的服务器地址)
- **数据库**: `get in touch`
- **认证**: 无需认证
- **内容类型**: `application/json`

## 统一接口

### 表单提交接口
**接口地址**: `POST /api/contact`

**请求头**:
```
Content-Type: application/json
```

**通用参数**:
| 参数 | 类型 | 说明 | 必填 |
|------|------|------|------|
| service | string | 服务类型，见下方详细说明 | ✅ |
| _language | string | 语言代码，默认'en'，支持'zh'、'en' | 否 |

**统一响应格式**:

成功响应 (HTTP 200):
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "id": 123,
  "redirectUrl": "/thank-you?lang=zh"
}
```

失败响应 (HTTP 400/500):
```json
{
  "success": false,
  "error": "具体错误信息"
}
```

---

## 1. 招聘服务 (Hiring Service)

**服务标识**: `service: 'hiring'`

**请求示例**:
```json
{
  "service": "hiring",
  "_language": "zh",
  "name": "张三",
  "email": "zhangsan@example.com",
  "company": "ABC科技有限公司",
  "companySize": "51-200人",
  "roleType": "前端工程师",
  "specialRequirements": "需要有React经验，熟练使用TypeScript"
}
```

**字段说明**:
| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| name | string | 联系人姓名 | ✅ |
| email | string | 邮箱地址 | ✅ |
| company | string | 公司名称 | 否 |
| companySize | string | 公司规模 | 否 |
| roleType | string | 职位类型 | 否 |
| specialRequirements | string | 特殊要求 | 否 |

---

## 2. 雇主品牌服务 (Employer Branding)

**服务标识**: `service: 'employerBranding'`

**请求示例**:
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

**字段说明**:
| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| employerBranding_name | string | 联系人姓名 | ✅ |
| employerBranding_email | string | 邮箱地址 | ✅ |
| employerBranding_companyName | string | 公司名称 | ✅ |
| employerBranding_companySize | string | 公司规模 | 否 |
| industry | string | 行业 | 否 |
| website | string | 公司网站 | 否 |
| additionalInfo | string | 附加信息/需求描述 | 否 |

---

## 3. 人工数据服务 (Human Data Service)

**服务标识**: `service: 'humanData'`

**请求示例**:
```json
{
  "service": "humanData",
  "_language": "zh",
  "humanData_name": "李博士",
  "humanData_email": "dr.li@university.edu",
  "dataType": "文本标注",
  "expertiseArea": "自然语言处理",
  "timeline": "1-3个月",
  "projectDetails": "需要标注10万条中文语料，用于训练机器学习模型"
}
```

**字段说明**:
| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| humanData_name | string | 联系人姓名 | ✅ |
| humanData_email | string | 邮箱地址 | ✅ |
| dataType | string | 数据类型 | 否 |
| expertiseArea | string | 专业领域 | 否 |
| timeline | string | 项目时间线 | 否 |
| projectDetails | string | 项目详细描述 | 否 |

---

## 4. 数字克隆服务 (Digital Clone) 🆕

**服务标识**: `service: 'digitalClone'`

**请求示例**:
```json
{
  "service": "digitalClone",
  "_language": "zh",
  "name": "张三",
  "email": "zhangsan@email.com",
  "expertiseField": "technology",
  "background": "我是一名有10年经验的软件工程师，专注于前端开发和用户体验设计。"
}
```

**字段说明**:
| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| name | string | 联系人姓名 | ✅ |
| email | string | 邮箱地址 | ✅ |
| expertiseField | string | 专业领域 | 否 |
| background | string | 个人背景描述 | 否 |

---

## 5. 其他咨询 (Other Inquiry) 🆕

**服务标识**: `service: 'other'`

**请求示例**:
```json
{
  "service": "other",
  "_language": "zh",
  "name": "张三",
  "email": "zhangsan@email.com",
  "company": "ABC公司",
  "phone": "13800138000",
  "message": "我想了解更多关于贵公司的服务，特别是在数字化转型方面的解决方案。"
}
```

**字段说明**:
| 字段 | 类型 | 说明 | 必填 |
|------|------|------|------|
| name | string | 联系人姓名 | ✅ |
| email | string | 邮箱地址 | ✅ |
| company | string | 公司名称 | 否 |
| phone | string | 手机号 | 否 |
| message | string | 留言内容 | ✅ |

---

## 健康检查接口

### 服务状态检查
**接口地址**: `GET /health`

**响应示例**:
```json
{
  "status": "OK",
  "timestamp": "2024-08-05T12:00:00.000Z",
  "service": "Contact Form API"
}
```

---

## 管理接口 (可选)

### 获取提交记录
**接口地址**: `GET /api/admin/contacts`

**查询参数**:
| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| page | number | 页码 | 1 |
| limit | number | 每页数量 | 50 |
| service | string | 服务类型筛选 | 无 |

**示例**: `GET /api/admin/contacts?service=hiring&limit=10`

### 获取统计信息
**接口地址**: `GET /api/admin/stats`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "total": 150,
    "byService": [
      { "service_type": "hiring", "count": 50 },
      { "service_type": "employerBranding", "count": 30 },
      { "service_type": "humanData", "count": 25 },
      { "service_type": "digitalClone", "count": 20 },
      { "service_type": "other", "count": 25 }
    ]
  }
}
```

---

## 错误处理

### 常见错误码
| HTTP状态码 | 说明 |
|-----------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 500 | 服务器内部错误 |

### 常见错误信息
| 错误信息 | 说明 | 解决方案 |
|---------|------|----------|
| `Service type is required` | 缺少service字段 | 确保请求包含service字段 |
| `Invalid service type` | 无效的服务类型 | 检查service值是否正确 |
| `Name and email are required` | 缺少必填字段 | 确保包含必填的name和email字段 |
| `Invalid email format` | 邮箱格式错误 | 检查邮箱格式是否正确 |

---

## 前端集成示例

### JavaScript/Fetch
```javascript
async function submitContactForm(formData) {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();
    
    if (result.success) {
      // 成功处理
      console.log('提交成功，ID:', result.id);
      window.location.href = result.redirectUrl;
    } else {
      // 错误处理
      console.error('提交失败:', result.error);
      alert('提交失败: ' + result.error);
    }
  } catch (error) {
    console.error('网络错误:', error);
    alert('网络错误，请稍后重试');
  }
}

// 使用示例 - 招聘表单
const hiringFormData = {
  service: 'hiring',
  _language: 'zh',
  name: '张三',
  email: 'zhangsan@example.com',
  company: 'ABC科技',
  roleType: '前端工程师'
};

submitContactForm(hiringFormData);
```

### Vue.js
```vue
<template>
  <form @submit.prevent="submitForm">
    <select v-model="form.service" required>
      <option value="hiring">招聘服务</option>
      <option value="employerBranding">雇主品牌</option>
      <option value="humanData">人工数据</option>
      <option value="digitalClone">数字克隆</option>
      <option value="other">其他咨询</option>
    </select>
    
    <input v-model="form.name" type="text" placeholder="姓名" required>
    <input v-model="form.email" type="email" placeholder="邮箱" required>
    <textarea v-model="form.message" placeholder="留言内容" v-if="form.service === 'other'" required></textarea>
    
    <button type="submit" :disabled="loading">
      {{ loading ? '提交中...' : '提交' }}
    </button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      form: {
        service: '',
        _language: 'zh',
        name: '',
        email: '',
        message: ''
      }
    }
  },
  methods: {
    async submitForm() {
      this.loading = true;
      try {
        const response = await this.$http.post('/api/contact', this.form);
        if (response.data.success) {
          this.$message.success('提交成功！');
          this.$router.push(response.data.redirectUrl);
        }
      } catch (error) {
        this.$message.error('提交失败: ' + error.response.data.error);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>
```

### React
```jsx
import { useState } from 'react';

function ContactForm() {
  const [form, setForm] = useState({
    service: '',
    _language: 'zh',
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (result.success) {
        alert('提交成功！');
        window.location.href = result.redirectUrl;
      } else {
        alert('提交失败: ' + result.error);
      }
    } catch (error) {
      alert('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select 
        value={form.service} 
        onChange={(e) => setForm({...form, service: e.target.value})}
        required
      >
        <option value="">选择服务类型</option>
        <option value="hiring">招聘服务</option>
        <option value="employerBranding">雇主品牌</option>
        <option value="humanData">人工数据</option>
        <option value="digitalClone">数字克隆</option>
        <option value="other">其他咨询</option>
      </select>
      
      <input
        type="text"
        placeholder="姓名"
        value={form.name}
        onChange={(e) => setForm({...form, name: e.target.value})}
        required
      />
      
      <input
        type="email"
        placeholder="邮箱"
        value={form.email}
        onChange={(e) => setForm({...form, email: e.target.value})}
        required
      />
      
      {form.service === 'other' && (
        <textarea
          placeholder="留言内容"
          value={form.message}
          onChange={(e) => setForm({...form, message: e.target.value})}
          required
        />
      )}
      
      <button type="submit" disabled={loading}>
        {loading ? '提交中...' : '提交'}
      </button>
    </form>
  );
}
```

---

## 部署配置

### 环境变量 (.env)
```env
DB_HOST=your-database-host
DB_PORT=your-database-port
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=get in touch
PORT=8080
NODE_ENV=production
```

### CORS配置
API已配置CORS，支持以下域名：
- `http://localhost:3000`
- `http://localhost:5173`
- 您的生产域名

### 启动命令
```bash
npm start
```

---

## 注意事项

1. **数据验证**: 
   - email字段会进行格式验证
   - 必填字段不能为空
   - 特殊字符会被正确处理

2. **安全措施**:
   - 自动记录用户IP和User-Agent
   - 请求频率限制: 15分钟内最多100个请求
   - 支持HTTPS传输

3. **字符编码**: 
   - 数据库使用UTF8MB4字符集
   - 支持中文和特殊字符

4. **响应时间**: 
   - 服务器超时时间: 30秒
   - 建议前端设置合理的loading状态

---

## 测试建议

1. **必填字段验证**: 测试缺少必填字段的情况
2. **邮箱格式验证**: 测试无效邮箱格式
3. **服务类型验证**: 测试无效的service值
4. **网络异常处理**: 测试网络连接失败的情况
5. **成功场景**: 测试正常提交的完整流程

---

**接口版本**: v1.0  
**最后更新**: 2024-08-05  
**技术支持**: 请联系后端开发团队

---

🎉 **所有接口已完成开发并经过测试验证，可直接用于生产环境！**