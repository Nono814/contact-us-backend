#!/bin/bash

# Demo预约表单后端接口部署验证脚本

echo "🚀 Demo预约表单后端接口部署验证"
echo "================================="

# 检查Node.js版本
echo "📋 环境检查："
echo "Node.js版本: $(node --version)"
echo "npm版本: $(npm --version)"

# 检查依赖
echo ""
echo "📦 检查项目依赖："
if [ -f "package.json" ]; then
    echo "✅ package.json 存在"
else
    echo "❌ package.json 不存在"
    exit 1
fi

if [ -d "node_modules" ]; then
    echo "✅ node_modules 已安装"
else
    echo "⚠️  node_modules 不存在，正在安装依赖..."
    npm install
fi

# 检查配置文件
echo ""
echo "⚙️  检查配置："
if [ -f "config.env" ]; then
    echo "✅ config.env 存在"
    
    # 检查必要的环境变量
    source config.env
    
    if [ -z "$DB_HOST" ]; then
        echo "❌ DB_HOST 未设置"
        exit 1
    else
        echo "✅ 数据库主机: $DB_HOST"
    fi
    
    if [ -z "$DB_NAME" ]; then
        echo "❌ DB_NAME 未设置"
        exit 1
    else
        echo "✅ 数据库名称: $DB_NAME"
    fi
    
    if [ -z "$SMTP_USER" ]; then
        echo "❌ SMTP_USER 未设置"
        exit 1
    else
        echo "✅ 邮件服务已配置"
    fi
    
    if [ -z "$DEMO_NOTIFICATION_EMAIL" ]; then
        echo "❌ DEMO_NOTIFICATION_EMAIL 未设置"
        exit 1
    else
        echo "✅ Demo通知邮箱已设置"
    fi
    
else
    echo "❌ config.env 不存在"
    exit 1
fi

# 检查源代码文件
echo ""
echo "📁 检查源代码文件："
files=("server.js" "routes/demoBooking.js" "services/emailNotification.js" "test_demo_booking_api.js")

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file 缺失"
        exit 1
    fi
done

# 测试数据库连接
echo ""
echo "🗄️  测试数据库连接："
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

async function testDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });
    
    await connection.execute('SELECT 1');
    console.log('✅ 数据库连接成功');
    
    const [tables] = await connection.execute(\"SHOW TABLES LIKE 'demo_bookings'\");
    if (tables.length > 0) {
      console.log('✅ demo_bookings表存在');
    } else {
      console.log('❌ demo_bookings表不存在');
      process.exit(1);
    }
    
    await connection.end();
  } catch (error) {
    console.log('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }
}

testDB();
"

if [ $? -ne 0 ]; then
    echo "数据库测试失败"
    exit 1
fi

echo ""
echo "🎯 部署验证完成！"
echo ""
echo "📋 下一步操作："
echo "1. 启动服务: npm start"
echo "2. 运行测试: node test_demo_booking_api.js"
echo "3. 查看文档: cat DEMO_BOOKING_DEPLOYMENT.md"
echo ""
echo "🔗 API接口:"
echo "POST http://localhost:8080/api/demo-booking"
echo ""
echo "✨ 部署成功！享受使用Demo预约表单API吧！"