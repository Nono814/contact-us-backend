#!/bin/bash

# 部署脚本
echo "开始部署 Get in Touch API..."

# 检查Node.js版本
node --version
npm --version

# 安装依赖
echo "安装依赖..."
npm install

# 检查环境变量
echo "检查环境变量..."
if [ -f "config.env" ]; then
    echo "✅ 环境变量文件存在"
    cat config.env
else
    echo "❌ 环境变量文件不存在"
    exit 1
fi

# 启动服务
echo "启动服务..."
npm start 