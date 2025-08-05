# 联系表单API服务

这是一个基于Node.js和Express的联系表单API服务，支持多种服务类型的表单提交和管理。

## 功能特性

- ✅ 支持5种服务类型的表单提交
  - 招聘服务 (hiring)
  - 雇主品牌服务 (employerBranding)
  - 人工数据服务 (humanData)
  - 数字克隆服务 (digitalClone)
  - 其他咨询 (other)
- ✅ 自动获取客户端IP和用户代理信息
- ✅ 邮箱格式验证
- ✅ 多语言支持
- ✅ 管理后台界面
- ✅ 数据统计和分页查询
- ✅ 安全防护（CORS、频率限制、Helmet）
- ✅ 数据库连接池和自动重连

## 技术栈

- **后端**: Node.js + Express
- **数据库**: MySQL
- **ORM**: mysql2 (Promise-based)
- **安全**: Helmet, CORS, Rate Limiting

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

编辑 `config.env` 文件：

```env
DB_HOST=dbconn.sealosbja.site
DB_PORT=43919
DB_USER=root
DB_PASSWORD=qrzk4ts4
DB_NAME=get in touch
PORT=3001
NODE_ENV=production
```

### 3. 启动服务

```bash
# 生产环境
npm start

# 开发环境（自动重启）
npm run dev
```

### 4. 访问服务

- **健康检查**: http://localhost:3001/health
- **管理后台**: http://localhost:3001/admin
- **API文档**: 参考 `API_Documentation.md`

## API接口

### 表单提交

```bash
POST /api/contact
Content-Type: application/json

{
  "service": "hiring",
  "_language": "zh",
  "name": "张三",
  "email": "zhangsan@example.com",
  "company": "ABC科技",
  "companySize": "51-200人",
  "roleType": "前端工程师",
  "specialRequirements": "需要有React经验"
}
```

### 管理接口

```bash
# 获取所有记录
GET /api/admin/contacts?page=1&limit=50&service=hiring

# 获取统计信息
GET /api/admin/stats

# 删除记录
DELETE /api/admin/contacts/hiring/123
```

## 数据库表结构

服务会自动创建以下5个表：

1. `hiring_submissions` - 招聘服务表
2. `employer_branding_submissions` - 雇主品牌服务表
3. `human_data_submissions` - 人工数据服务表
4. `digital_clone_submissions` - 数字克隆服务表
5. `other_inquiries` - 其他咨询表

## 前端集成示例

### JavaScript/Fetch

```javascript
async function submitForm(formData) {
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

## 部署说明

### 1. 生产环境部署

```bash
# 安装依赖
npm install --production

# 启动服务
npm start
```

### 2. 使用PM2管理进程

```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm2 start server.js --name "contact-form-api"

# 查看状态
pm2 status

# 重启服务
pm2 restart contact-form-api
```

### 3. 使用Docker部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

## 安全建议

1. **生产环境配置**:
   - 使用HTTPS
   - 配置防火墙
   - 定期更新依赖

2. **数据库安全**:
   - 使用强密码
   - 限制数据库访问IP
   - 定期备份数据

3. **API安全**:
   - 添加身份认证（管理接口）
   - 配置请求频率限制
   - 验证输入数据

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库配置
   - 确认网络连接
   - 验证数据库权限

2. **端口被占用**
   - 修改 `config.env` 中的PORT
   - 检查是否有其他服务占用端口

3. **CORS错误**
   - 检查前端域名是否在CORS配置中
   - 确认请求头设置正确

### 日志查看

```bash
# 查看应用日志
pm2 logs contact-form-api

# 查看错误日志
pm2 logs contact-form-api --err
```

## 开发指南

### 项目结构

```
├── server.js              # 主服务器文件
├── package.json           # 项目配置
├── config.env             # 环境变量
├── config/
│   └── database.js        # 数据库配置
├── routes/
│   ├── contact.js         # 表单提交路由
│   └── admin.js           # 管理后台路由
└── public/
    └── admin.html         # 管理后台界面
```

### 添加新的服务类型

1. 在 `config/database.js` 中添加新表结构
2. 在 `routes/contact.js` 中添加处理函数
3. 在 `routes/admin.js` 中添加查询逻辑
4. 更新管理后台界面

## 许可证

ISC License
