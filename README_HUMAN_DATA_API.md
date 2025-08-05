# 人工数据服务API使用指南

## 概述

这是"Get in Touch"平台的人工数据服务API，专门为AI/ML项目提供高质量的人工数据标注和处理服务。企业可以通过此API提交数据标注需求，我们会提供专业的人工数据服务。

## 功能特性

- ✅ 人工数据需求提交
- ✅ 多语言支持（中文/英文）
- ✅ 数据验证和错误处理
- ✅ IP地址和用户代理记录
- ✅ 管理后台查看提交记录
- ✅ 支持多种数据类型和专业领域

## API接口详情

### 人工数据服务提交

**接口地址**: `POST /api/contact`

**请求参数**:
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

**必填字段**:
- `service`: 服务类型，固定为 "humanData"
- `humanData_name`: 联系人姓名
- `humanData_email`: 邮箱地址

**可选字段**:
- `_language`: 语言代码，默认 "en"
- `dataType`: 数据类型
- `expertiseArea`: 专业领域
- `timeline`: 项目时间线
- `projectDetails`: 项目详细描述

**响应示例**:
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "id": 123,
  "redirectUrl": "/thank-you?lang=en"
}
```

## 数据库结构

### 人工数据服务表 (human_data_submissions)

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

## 前端集成示例

### JavaScript/Fetch

```javascript
async function submitHumanDataForm(formData) {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service: 'humanData',
        _language: 'zh',
        humanData_name: formData.name,
        humanData_email: formData.email,
        dataType: formData.dataType,
        expertiseArea: formData.expertiseArea,
        timeline: formData.timeline,
        projectDetails: formData.projectDetails
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
    <select v-model="form.dataType">
      <option value="">请选择数据类型</option>
      <option value="文本标注">文本标注</option>
      <option value="图像标注">图像标注</option>
      <option value="音频标注">音频标注</option>
      <option value="视频标注">视频标注</option>
      <option value="数据清洗">数据清洗</option>
      <option value="数据验证">数据验证</option>
      <option value="其他">其他</option>
    </select>
    <select v-model="form.expertiseArea">
      <option value="">请选择专业领域</option>
      <option value="自然语言处理">自然语言处理</option>
      <option value="计算机视觉">计算机视觉</option>
      <option value="语音识别">语音识别</option>
      <option value="机器学习">机器学习</option>
      <option value="深度学习">深度学习</option>
      <option value="数据挖掘">数据挖掘</option>
      <option value="其他">其他</option>
    </select>
    <select v-model="form.timeline">
      <option value="">请选择项目时间线</option>
      <option value="1个月内">1个月内</option>
      <option value="1-3个月">1-3个月</option>
      <option value="3-6个月">3-6个月</option>
      <option value="6个月以上">6个月以上</option>
    </select>
    <textarea v-model="form.projectDetails" placeholder="项目详细描述"></textarea>
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
        dataType: '',
        expertiseArea: '',
        timeline: '',
        projectDetails: ''
      }
    }
  },
  methods: {
    async submitForm() {
      try {
        const response = await this.$http.post('/api/contact', {
          service: 'humanData',
          _language: this.$i18n.locale,
          humanData_name: this.form.name,
          humanData_email: this.form.email,
          dataType: this.form.dataType,
          expertiseArea: this.form.expertiseArea,
          timeline: this.form.timeline,
          projectDetails: this.form.projectDetails
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
python3 test_human_data.py
```

### 使用curl测试

```bash
# 中文提交
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "service": "humanData",
    "_language": "zh",
    "humanData_name": "张博士",
    "humanData_email": "zhang@ai-lab.com",
    "dataType": "文本标注",
    "expertiseArea": "自然语言处理",
    "timeline": "1-3个月",
    "projectDetails": "需要标注10万条中文语料"
  }'

# 英文提交
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "service": "humanData",
    "_language": "en",
    "humanData_name": "Dr. Smith",
    "humanData_email": "smith@research.com",
    "dataType": "Image Annotation",
    "expertiseArea": "Computer Vision",
    "timeline": "2-4 months",
    "projectDetails": "Need to annotate 50,000 images"
  }'
```

## 常见数据类型

### 文本数据
- 文本标注
- 情感分析
- 实体识别
- 文本分类
- 问答标注
- 翻译验证

### 图像数据
- 图像标注
- 目标检测
- 图像分割
- 图像分类
- 关键点标注
- 图像质量评估

### 音频数据
- 音频标注
- 语音转文字
- 说话人识别
- 情感识别
- 音频分类
- 音频质量评估

### 视频数据
- 视频标注
- 动作识别
- 视频分割
- 视频分类
- 关键帧提取
- 视频质量评估

## 专业领域分类

- 自然语言处理 (NLP)
- 计算机视觉 (CV)
- 语音识别 (ASR)
- 机器学习 (ML)
- 深度学习 (DL)
- 数据挖掘
- 推荐系统
- 知识图谱
- 其他

## 项目时间线

- 1个月内
- 1-3个月
- 3-6个月
- 6个月以上

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
- [ ] 集成项目管理工具
- [ ] 添加数据分析报表
- [ ] 数据质量评估工具
- [ ] 标注工具集成

## 技术支持

如有问题，请联系开发团队或查看日志文件。 