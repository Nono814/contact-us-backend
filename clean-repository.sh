#!/bin/bash

# Git仓库清理脚本
# 用于移除不应该被跟踪的文件和目录

set -e  # 遇到错误立即退出

echo "🧹 开始Git仓库清理..."
echo "===================="

# 检查是否在Git仓库中
if [ ! -d ".git" ]; then
    echo "❌ 错误：当前目录不是Git仓库"
    exit 1
fi

# 显示当前状态
echo "📊 清理前状态："
echo "当前分支: $(git branch --show-current)"
echo "仓库大小: $(du -sh .git | cut -f1)"
echo "跟踪的文件数量: $(git ls-files | wc -l)"
echo ""

# 备份当前更改（如果有）
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "💾 发现未提交的更改，正在备份..."
    git stash push -m "清理仓库前的自动备份 - $(date)"
    echo "✅ 更改已备份到stash"
fi

echo "🗑️  开始移除不应该跟踪的文件..."

# 移除Node.js相关文件
echo "移除 Node.js 文件..."
git rm -r --cached node_modules/ 2>/dev/null || echo "node_modules/ 未被跟踪"
git rm --cached package-lock.json 2>/dev/null || echo "package-lock.json 未被跟踪"

# 移除Python虚拟环境文件
echo "移除 Python 虚拟环境文件..."
git rm -r --cached bin/ 2>/dev/null || echo "bin/ 未被跟踪"
git rm -r --cached lib/ 2>/dev/null || echo "lib/ 未被跟踪"  
git rm -r --cached lib64/ 2>/dev/null || echo "lib64/ 未被跟踪"
git rm -r --cached include/ 2>/dev/null || echo "include/ 未被跟踪"
git rm --cached pyvenv.cfg 2>/dev/null || echo "pyvenv.cfg 未被跟踪"

# 移除配置文件
echo "移除配置文件..."
git rm --cached config.env 2>/dev/null || echo "config.env 未被跟踪"
git rm --cached config.production.env 2>/dev/null || echo "config.production.env 未被跟踪"

# 移除部署包和压缩文件
echo "移除部署包..."
git rm --cached backend-deployment-package.tar.gz 2>/dev/null || echo "backend-deployment-package.tar.gz 未被跟踪"
git rm --cached ops-deployment-package-*.tar.gz 2>/dev/null || echo "ops-deployment-package-*.tar.gz 未被跟踪"
git rm --cached production-deployment-*.tar.gz 2>/dev/null || echo "production-deployment-*.tar.gz 未被跟踪"

# 移除日志文件
echo "移除日志文件..."
git rm --cached *.log 2>/dev/null || echo "*.log 未被跟踪"

# 移除编辑器配置
echo "移除编辑器配置..."
git rm -r --cached .vscode/ 2>/dev/null || echo ".vscode/ 未被跟踪"

# 移除临时文件
echo "移除临时文件..."
git rm --cached hello.py 2>/dev/null || echo "hello.py 未被跟踪"
git rm --cached claude 2>/dev/null || echo "claude 未被跟踪"
git rm --cached diagnose_analytics.sh 2>/dev/null || echo "diagnose_analytics.sh 未被跟踪"
git rm --cached "截屏*.png" 2>/dev/null || echo "截屏文件未被跟踪"

# 添加新的.gitignore文件
echo "📝 添加新的 .gitignore 文件..."
git add .gitignore

# 显示将要提交的更改
echo ""
echo "📋 准备提交的更改："
git status --short

# 确认是否继续
read -p "🤔 是否继续提交这些更改？(y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 用户取消操作"
    # 恢复所有更改
    git reset HEAD .
    echo "✅ 已恢复所有更改"
    exit 0
fi

# 提交更改
echo "📤 提交清理更改..."
git commit -m "chore: Remove ignored files and directories from repository

- Remove node_modules/ and Python virtual environment files
- Remove configuration files with sensitive data  
- Remove build artifacts and deployment packages
- Remove log files and temporary files
- Add comprehensive .gitignore file

This cleanup ensures repository security and reduces size."

echo ""
echo "📊 清理后状态："
echo "仓库大小: $(du -sh .git | cut -f1)"
echo "跟踪的文件数量: $(git ls-files | wc -l)"

# 推送确认
read -p "🚀 是否推送到远程仓库？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 推送到远程仓库..."
    git push origin $(git branch --show-current)
    echo "✅ 推送完成"
else
    echo "⚠️  记住稍后手动推送: git push origin $(git branch --show-current)"
fi

echo ""
echo "🎉 Git仓库清理完成！"
echo "===================="
echo ""
echo "📋 后续步骤："
echo "1. 通知团队成员重新拉取代码"
echo "2. 团队成员需要运行: npm install"
echo "3. Python开发者需要重新创建虚拟环境"
echo "4. 配置文件现在通过环境变量管理"
echo ""
echo "📖 详细说明请参考: Git仓库清理指南.md"



