# 招聘服务API使用指南

## 概述

这是"Get in Touch"平台的招聘服务API，专门为B端企业提供招聘服务。企业可以通过此API提交招聘需求，我们会帮助企业找到最合适的人才。

## 功能特性

- ✅ 招聘需求提交
- ✅ 多语言支持（中文/英文）
- ✅ 数据验证和错误处理
- ✅ IP地址和用户代理记录
- ✅ 管理后台查看提交记录
- ✅ 美观的前端表单界面

## 快速开始

### 1. 启动服务

```bash
# 安装依赖
npm install

# 启动服务
npm start

# 开发模式（自动重启）
npm run dev
```

### 2. 访问接口

- **健康检查**: `GET http://localhost:3001/health`
- **招聘表单**: `http://localhost:3001/hiring-form.html`
- **API接口**: `POST http://localhost:3001/api/contact`
- **管理后台**: `http://localhost:3001/admin`

## API接口详情

### 招聘服务提交

**接口地址**: `POST /api/contact`

**请求参数**:
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

**必填字段**:
- `service`: 服务类型，固定为 "hiring"
- `name`: 联系人姓名
- `email`: 邮箱地址

**可选字段**:
- `_language`: 语言代码，默认 "en"
- `company`: 公司名称
- `companySize`: 公司规模
- `roleType`: 职位类型
- `specialRequirements`: 特殊要求

**响应示例**:
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "id": 123,
  "redirectUrl": "/thank-you?lang=zh"
}
```

## 数据库结构

### 招聘服务表 (hiring_submissions)

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

## 前端集成示例

### JavaScript/Fetch

```javascript
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

### Vue.js

```vue
<template>
  <form @submit.prevent="submitForm">
    <input v-model="form.name" type="text" placeholder="姓名" required>
    <input v-model="form.email" type="email" placeholder="邮箱" required>
    <input v-model="form.company" type="text" placeholder="公司名称">
    <select v-model="form.companySize">
      <option value="">请选择公司规模</option>
      <option value="1-10人">1-10人</option>
      <option value="11-50人">11-50人</option>
      <option value="51-200人">51-200人</option>
      <option value="201-500人">201-500人</option>
      <option value="501-1000人">501-1000人</option>
      <option value="1000+人">1000+人</option>
    </select>
    <select v-model="form.roleType">
      <option value="">请选择职位类型</option>
      <option value="前端工程师">前端工程师</option>
      <option value="后端工程师">后端工程师</option>
      <option value="全栈工程师">全栈工程师</option>
      <option value="产品经理">产品经理</option>
      <option value="UI/UX设计师">UI/UX设计师</option>
      <option value="数据分析师">数据分析师</option>
      <option value="运营专员">运营专员</option>
      <option value="其他">其他</option>
    </select>
    <textarea v-model="form.specialRequirements" placeholder="特殊要求"></textarea>
    <button type="submit">提交申请</button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        email: '',
        company: '',
        companySize: '',
        roleType: '',
        specialRequirements: ''
      }
    }
  },
  methods: {
    async submitForm() {
      try {
        const response = await this.$http.post('/api/contact', {
          ...this.form,
          service: 'hiring',
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

## 测试

### 使用Python测试

```bash
python3 test_api.py
```

### 使用curl测试

```bash
# 健康检查
curl -X GET http://localhost:3001/health

# 提交招聘表单
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "service": "hiring",
    "_language": "zh",
    "name": "张三",
    "email": "zhangsan@example.com",
    "company": "ABC科技有限公司",
    "companySize": "51-200人",
    "roleType": "前端工程师",
    "specialRequirements": "需要有React经验"
  }'
```

## 环境配置

### 环境变量 (.env)

```env
DB_HOST=dbconn.sealosbja.site
DB_PORT=43919
DB_USER=root
DB_PASSWORD=qrzk4ts4
DB_NAME=get in touch
PORT=3001
NODE_ENV=production
```

## 安全特性

- ✅ CORS配置，支持跨域请求
- ✅ 请求频率限制（15分钟内最多100次）
- ✅ 输入验证和SQL注入防护
- ✅ 错误信息脱敏
- ✅ 安全头部配置

## 部署说明

1. **安装依赖**: `npm install`
2. **配置环境变量**: 复制 `.env.example` 到 `.env` 并修改配置
3. **启动服务**: `npm start`
4. **生产环境**: 建议使用PM2或Docker部署

## 下一步开发

- [ ] 添加邮件通知功能
- [ ] 实现管理后台认证
- [ ] 添加数据导出功能
- [ ] 集成CRM系统
- [ ] 添加数据分析报表

## 技术支持

如有问题，请联系开发团队或查看日志文件。 