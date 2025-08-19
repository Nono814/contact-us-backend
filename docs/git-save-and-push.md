## Git 本地保存与推送速查指南

> 目标：快速完成“保存改动并推送到 GitHub”。包含首次推送与日常工作流、常见问题与排错。

### 前置条件

- 已安装 Git，并在项目根目录执行命令。
- 已初始化为 Git 仓库（若不确定，先运行 `git rev-parse --is-inside-work-tree`）。
- 已设置用户信息（一次性）：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

### 日常 3 步：查看 → 保存 → 推送（最常用）

```bash
# 1) 查看改动概览
git status

# 2) 保存改动到暂存区（包含新增/修改/删除）
git add -A

# 3) 本地提交（请写清晰的提交信息）
git commit -m "feat: 描述本次改动"

# 4) 推送到远程（已设置 upstream 时可直接 git push）
git push
```

说明：如果当前分支还没有和远程分支建立“upstream”跟踪关系，需要用 `git push -u origin <分支名>` 第一次推送。

### 第一次推送当前分支并设置 upstream（仅首次）

```bash
# 查看当前分支名
git branch --show-current

# 第一次推送并建立跟踪关系
git push -u origin <分支名>

# 之后在该分支上，直接 git push / git pull 即可
```

### 远程仓库常用命令

```bash
# 查看远程地址
git remote -v

# 添加远程（首次初始化后需要）
git remote add origin https://github.com/<你的账号>/<你的仓库>.git

# 修改远程地址
git remote set-url origin https://github.com/<你的账号>/<你的仓库>.git
```

### 分支常用命令

```bash
# 查看本地分支
git branch

# 创建并切换到新分支
git checkout -b feature/new-feature
# 或（较新命令）
git switch -c feature/new-feature

# 切换分支
git checkout contact-us-backend
# 或
git switch contact-us-backend
```

### 常见变体与进阶

```bash
# 仅添加某个文件
git add services/emailNotification.js

# 取消暂存（保留工作区改动）
git restore --staged <文件>

# 修改上一条提交信息（未推送时）
git commit --amend -m "fix: 更正提交信息"

# 查看简洁提交历史
git log --oneline --graph --decorate --all

# 拉取远程更新（推荐 rebase 保持提交线性）
git pull --rebase
```

### 标签（Tag）与推送

```bash
# 创建标签
git tag v1.0.0

# 推送单个标签
git push origin v1.0.0

# 一次性推送所有本地标签
git push --tags
```

### .gitignore 建议

- 将日志、临时文件、系统文件、密钥等加入 `.gitignore`，避免误提交。
- 例：

```gitignore
node_modules/
*.log
.env
.DS_Store
```

### 常见问题与排错

- 认证失败（403/需要凭证）
  - 使用 HTTPS 时建议使用 GitHub Personal Access Token（替代密码）。
  - 可配置凭据保存：`git config --global credential.helper store`（或使用系统钥匙串）。

- 文件名包含空格/特殊字符
  - 使用引号或直接 `git add -A` 统一添加，避免逐个转义。

- 合并冲突
  - `git status` 查看冲突文件，按标记编辑后：`git add <文件>` → `git commit`（或继续 rebase/merge 流程）。

#### 遇到“Missing or invalid credentials.” 或 VSCode/Cursor askpass 报错（ECONNREFUSED）

现象示例：

```
Missing or invalid credentials.
Error: connect ECONNREFUSED /tmp/vscode-git-xxxx.sock
fatal: Authentication failed for 'https://github.com/<user>/<repo>.git/'
```

原因：编辑器的 `GIT_ASKPASS` 助手干扰或凭据未配置。

解决步骤（HTTPS + PAT 推荐）：

```bash
# 1) 临时关闭编辑器 askpass 影响（当前终端会话生效）
unset GIT_ASKPASS

# 2) 使用 GitHub PAT 进行认证并保存（首次）
git config --global credential.helper store

# 3) 推送（首次推送建议带 -u 建立 upstream）
git push -u origin <分支名>
# 出现 Username 时：输入你的 GitHub 用户名
# 出现 Password 时：粘贴你的 GitHub Personal Access Token（PAT），不是登录密码
```

若想排查环境：

```bash
git config --show-origin -l | grep credential.helper || true
env | grep -E '^GIT_(ASKPASS|CREDENTIAL_HELPER)=' || true
git remote -v
```

可选方案：

- 使用 SSH 免密推送

```bash
ssh-keygen -t ed25519 -C "你的邮箱"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub  # 复制到 GitHub → Settings → SSH and GPG keys
git remote set-url origin git@github.com:<你的账号>/<你的仓库>.git
git push -u origin <分支名>
```

- 临时把 PAT 写入远程 URL（不推荐，注意安全）

```bash
git remote set-url origin https://<PAT>@github.com/<你的账号>/<你的仓库>.git
git push -u origin <分支名>
# 推送完建议立刻改回不带令牌的 URL，并妥善保管/轮换令牌
git remote set-url origin https://github.com/<你的账号>/<你的仓库>.git
```

注意：`git add -A` 中间有空格，`add-A` 是错误写法。

### 实用示例（以当前仓库为例）

当前分支：`contact-us-backend` ；远程：`origin` → `https://github.com/Nono814/contact-us-backend.git`

```bash
# 查看当前分支
git branch --show-current

# 保存并提交
git add -A
git commit -m "chore: 保存当前工作"

# 第一次把该分支推到远程并建立跟踪
git push -u origin contact-us-backend

# 后续在该分支上，直接
git push
```

### 提交信息建议（可选）

- 常见前缀：`feat` 新功能、`fix` 修复、`docs` 文档、`chore` 杂务、`refactor` 重构、`test` 测试、`perf` 性能。
- 示例：

```text
feat: 支持邮件通知开关
fix: 修复 email 正则校验导致的边界错误
docs: 新增 Git 保存与推送教学文档
```

— 完 —


