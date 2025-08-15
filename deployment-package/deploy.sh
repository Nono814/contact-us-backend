#!/bin/bash

# 后端项目自动部署脚本
# 用法: ./deploy.sh

set -e

echo "🚀 开始部署后端项目..."

# 检查系统要求
check_requirements() {
    echo "📋 检查系统要求..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装，请先安装 Node.js 16+ 版本"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        echo "❌ Node.js 版本过低，需要 16+ 版本，当前版本: $(node -v)"
        exit 1
    fi
    echo "✅ Node.js 版本: $(node -v)"
    
    # 检查Python
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python3 未安装，请先安装 Python 3.8+ 版本"
        exit 1
    fi
    echo "✅ Python 版本: $(python3 --version)"
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        echo "❌ npm 未安装"
        exit 1
    fi
    echo "✅ npm 版本: $(npm --version)"
}

# 配置环境变量
setup_config() {
    echo "⚙️  配置环境变量..."
    
    if [ ! -f "config.env" ]; then
        if [ -f "config.env.template" ]; then
            echo "📝 请根据 config.env.template 创建 config.env 文件"
            echo "🔗 参考命令: cp config.env.template config.env"
            echo "⚠️  然后编辑 config.env 文件，填入正确的配置信息"
            exit 1
        else
            echo "❌ 配置文件模板不存在"
            exit 1
        fi
    fi
    echo "✅ 配置文件已存在"
}

# 安装Node.js依赖
install_node_deps() {
    echo "📦 安装 Node.js 依赖..."
    npm ci --only=production
    echo "✅ Node.js 依赖安装完成"
}

# 安装Python依赖
install_python_deps() {
    echo "🐍 安装 Python 依赖..."
    
    # 创建虚拟环境
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    # 激活虚拟环境
    source venv/bin/activate
    
    # 安装依赖
    pip install -r requirements.txt
    
    echo "✅ Python 依赖安装完成"
}

# 数据库初始化
setup_database() {
    echo "🗄️  数据库初始化..."
    echo "⚠️  请确保已手动创建数据库和导入表结构："
    echo "   CREATE DATABASE \`demo-booking\`;"
    echo "   CREATE DATABASE \`analytics\`;"
    echo "   mysql -u username -p demo-booking < schema.sql"
    echo ""
    
    read -p "数据库是否已准备好? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 请先完成数据库设置"
        exit 1
    fi
    echo "✅ 数据库已准备"
}

# 启动服务
start_services() {
    echo "🎯 启动服务..."
    
    # 检查PM2是否安装
    if command -v pm2 &> /dev/null; then
        echo "🔄 使用 PM2 启动服务..."
        pm2 start ecosystem.config.js
        pm2 save
        echo "✅ 服务已通过 PM2 启动"
    else
        echo "⚠️  PM2 未安装，建议安装: npm install -g pm2"
        echo "🔄 使用 npm 启动服务..."
        nohup npm start > server.log 2>&1 &
        echo $! > server.pid
        echo "✅ 服务已启动，PID: $(cat server.pid)"
    fi
    
    # 等待服务启动
    echo "⏳ 等待服务启动..."
    sleep 5
}

# 验证部署
verify_deployment() {
    echo "🧪 验证部署..."
    
    # 检查端口
    if ! netstat -tuln | grep :8080 > /dev/null; then
        echo "❌ 端口 8080 未监听，服务可能启动失败"
        exit 1
    fi
    
    # 健康检查
    if curl -f -s http://localhost:8080/health > /dev/null; then
        echo "✅ Node.js 服务健康检查通过"
    else
        echo "❌ Node.js 服务健康检查失败"
        exit 1
    fi
    
    # 运行部署验证脚本
    if [ -f "verify_deployment.sh" ]; then
        echo "🔍 运行详细验证..."
        chmod +x verify_deployment.sh
        ./verify_deployment.sh
    fi
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "🎉 部署完成！"
    echo "================================"
    echo "📋 服务信息:"
    echo "  - Node.js 服务: http://localhost:8080"
    echo "  - 健康检查: http://localhost:8080/health"
    echo "  - 管理后台: http://localhost:8080/admin"
    echo "  - Demo预约API: POST /api/demo-booking"
    echo "  - 埋点API: POST /api/analytics/track"
    echo ""
    echo "📊 监控命令:"
    if command -v pm2 &> /dev/null; then
        echo "  - 查看状态: pm2 status"
        echo "  - 查看日志: pm2 logs"
        echo "  - 重启服务: pm2 restart all"
    else
        echo "  - 查看进程: ps aux | grep node"
        echo "  - 查看日志: tail -f server.log"
        echo "  - 停止服务: kill \$(cat server.pid)"
    fi
    echo ""
    echo "📚 文档位置:"
    echo "  - 部署指南: DEPLOYMENT_GUIDE.md"
    echo "  - Demo预约文档: DEMO_BOOKING_DEPLOYMENT.md"
    echo "  - 埋点文档: BOOK_DEMO_ANALYTICS_EVENTS.md"
    echo ""
    echo "🔧 配置文件: config.env"
    echo "📝 日志文件: server.log"
}

# 主执行流程
main() {
    echo "🏗️  后端项目自动部署脚本"
    echo "========================="
    
    check_requirements
    setup_config
    install_node_deps
    install_python_deps
    setup_database
    start_services
    verify_deployment
    show_deployment_info
}

# 错误处理
trap 'echo "❌ 部署失败，请检查错误信息"; exit 1' ERR

# 执行主函数
main "$@"