# 雇主品牌服务API使用指南

## 概述

这是"Get in Touch"平台的雇主品牌服务API，专门为B端企业提供雇主品牌建设服务。企业可以通过此API提交雇主品牌需求，我们会帮助企业提升雇主品牌形象，吸引更多优秀人才。

## 功能特性

- ✅ 雇主品牌需求提交
- ✅ 多语言支持（中文/英文）
- ✅ 数据验证和错误处理
- ✅ IP地址和用户代理记录
- ✅ 管理后台查看提交记录
- ✅ 完整的行业和公司规模分类

## API接口详情

### 雇主品牌服务提交

**接口地址**: `POST /api/contact`

**请求参数**:
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
  "additionalInfo": "希望提升雇主品牌形象，吸引更多优秀人才加入"
}
```

**必填字段**:
- `service`: 服务类型，固定为 "employerBranding"
- `employerBranding_name`: 联系人姓名
- `employerBranding_email`: 邮箱地址
- `employerBranding_companyName`: 公司名称

**可选字段**:
- `_language`: 语言代码，默认 "en"
- `employerBranding_companySize`: 公司规模
- `industry`: 行业
- `website`: 公司网站
- `additionalInfo`: 附加信息/需求描述

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

### 雇主品牌服务表 (employer_branding_submissions)

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

## 前端集成示例

### JavaScript/Fetch

```javascript
async function submitEmployerBrandingForm(formData) {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service: 'employerBranding',
        _language: 'zh',
        employerBranding_name: formData.name,
        employerBranding_email: formData.email,
        employerBranding_companyName: formData.companyName,
        employerBranding_companySize: formData.companySize,
        industry: formData.industry,
        website: formData.website,
        additionalInfo: formData.additionalInfo
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
    <input v-model="form.name" type="text" placeholder="联系人姓名" required>
    <input v-model="form.email" type="email" placeholder="邮箱地址" required>
    <input v-model="form.companyName" type="text" placeholder="公司名称" required>
    <select v-model="form.companySize">
      <option value="">请选择公司规模</option>
      <option value="1-10人">1-10人</option>
      <option value="11-50人">11-50人</option>
      <option value="51-200人">51-200人</option>
      <option value="201-500人">201-500人</option>
      <option value="501-1000人">501-1000人</option>
      <option value="1000+人">1000+人</option>
    </select>
    <select v-model="form.industry">
      <option value="">请选择行业</option>
      <option value="互联网">互联网</option>
      <option value="金融">金融</option>
      <option value="制造业">制造业</option>
      <option value="教育">教育</option>
      <option value="医疗">医疗</option>
      <option value="房地产">房地产</option>
      <option value="其他">其他</option>
    </select>
    <input v-model="form.website" type="url" placeholder="公司网站">
    <textarea v-model="form.additionalInfo" placeholder="附加信息/需求描述"></textarea>
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
        companyName: '',
        companySize: '',
        industry: '',
        website: '',
        additionalInfo: ''
      }
    }
  },
  methods: {
    async submitForm() {
      try {
        const response = await this.$http.post('/api/contact', {
          service: 'employerBranding',
          _language: this.$i18n.locale,
          employerBranding_name: this.form.name,
          employerBranding_email: this.form.email,
          employerBranding_companyName: this.form.companyName,
          employerBranding_companySize: this.form.companySize,
          industry: this.form.industry,
          website: this.form.website,
          additionalInfo: this.form.additionalInfo
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
python3 test_employer_branding.py
```

### 使用curl测试

```bash
# 中文提交
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "service": "employerBranding",
    "_language": "zh",
    "employerBranding_name": "王经理",
    "employerBranding_email": "hr@xyz.com",
    "employerBranding_companyName": "XYZ集团",
    "employerBranding_companySize": "500+",
    "industry": "互联网",
    "website": "https://www.xyz.com",
    "additionalInfo": "希望提升雇主品牌形象"
  }'

# 英文提交
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "service": "employerBranding",
    "_language": "en",
    "employerBranding_name": "John Smith",
    "employerBranding_email": "hr@abc.com",
    "employerBranding_companyName": "ABC Corporation",
    "employerBranding_companySize": "201-500",
    "industry": "Technology",
    "website": "https://www.abc.com",
    "additionalInfo": "Looking to enhance our employer brand"
  }'
```

## 常见行业分类

- 互联网
- 金融
- 制造业
- 教育
- 医疗
- 房地产
- 零售
- 物流
- 咨询
- 其他

## 公司规模分类

- 1-10人
- 11-50人
- 51-200人
- 201-500人
- 501-1000人
- 1000+人

## 安全特性

- ✅ CORS配置，支持跨域请求
- ✅ 请求频率限制（15分钟内最多100次）
- ✅ 输入验证和SQL注入防护
- ✅ 错误信息脱敏
- ✅ 安全头部配置

## 下一步开发

- [ ] 添加邮件通知功能
- [ ] 实现管理后台认证
- [ ] 添加数据导出功能
- [ ] 集成CRM系统
- [ ] 添加数据分析报表
- [ ] 雇主品牌评估工具

## 技术支持

如有问题，请联系开发团队或查看日志文件。 