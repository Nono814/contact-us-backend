#!/bin/bash

# 生产环境部署脚本
set -e

echo "🚀 开始部署 officialwebbackend 到生产环境..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
if [ "$EUID" -eq 0 ]; then
    log_error "请不要使用root用户运行此脚本"
    exit 1
fi

# 检查Node.js版本
log_info "检查Node.js版本..."
node_version=$(node --version)
npm_version=$(npm --version)
log_info "Node.js: $node_version, npm: $npm_version"

# 检查PM2是否安装
if ! command -v pm2 &> /dev/null; then
    log_info "安装PM2..."
    npm install -g pm2
fi

# 创建日志目录
log_info "创建日志目录..."
mkdir -p logs

# 安装依赖
log_info "安装项目依赖..."
npm install --production

# 检查环境变量文件
if [ ! -f "config.production.env" ]; then
    log_error "生产环境配置文件不存在: config.production.env"
    exit 1
fi

# 测试数据库连接
log_info "测试数据库连接..."
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.production.env' });

async function testDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        console.log('✅ 数据库连接成功');
        await connection.end();
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
        process.exit(1);
    }
}
testDB();
"

# 停止现有进程
log_info "停止现有PM2进程..."
pm2 stop officialwebbackend 2>/dev/null || true
pm2 delete officialwebbackend 2>/dev/null || true

# 启动应用
log_info "启动应用..."
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置PM2开机自启
pm2 startup

log_info "等待应用启动..."
sleep 5

# 检查应用状态
if pm2 list | grep -q "officialwebbackend.*online"; then
    log_info "✅ 应用启动成功"
else
    log_error "❌ 应用启动失败"
    pm2 logs officialwebbackend --lines 20
    exit 1
fi

# 健康检查
log_info "执行健康检查..."
health_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health || echo "000")
if [ "$health_response" = "200" ]; then
    log_info "✅ 健康检查通过"
else
    log_error "❌ 健康检查失败 (HTTP $health_response)"
    exit 1
fi

# 显示应用信息
log_info "应用信息:"
pm2 list
pm2 show officialwebbackend

log_info "🎉 部署完成!"
log_info "应用运行在: http://localhost:8080"
log_info "健康检查: http://localhost:8080/health"
log_info "管理后台: http://localhost:8080/admin"
log_info "查看日志: pm2 logs officialwebbackend" 