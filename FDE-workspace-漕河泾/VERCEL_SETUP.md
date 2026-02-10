# Vercel 部署配置步骤（重要！）

## ⚠️ 必须配置 Root Directory

由于 Next.js 应用在子目录 `projects/漕河泾/apps/visit-app` 中，**必须在 Vercel Dashboard 中手动配置 Root Directory**。

## 详细步骤

### 1. 访问 Vercel Dashboard
- 打开 https://vercel.com/dashboard
- 登录你的账号

### 2. 找到项目设置
- 点击项目 `vibe-chj-demo`
- 进入 **Settings**（设置）
- 点击 **General**（常规设置）

### 3. 配置 Root Directory
- 找到 **Root Directory** 部分
- 点击 **Edit**（编辑）
- **输入以下路径**：
  ```
  projects/漕河泾/apps/visit-app
  ```
- 点击 **Save**（保存）

### 4. 重新部署
- 进入 **Deployments**（部署）页面
- 找到最新的部署记录
- 点击右侧的 **⋯**（三个点）
- 选择 **Redeploy**（重新部署）
- 确认重新部署

## 验证配置

部署完成后，访问你的 Vercel URL（例如：`https://vibe-chj-demo.vercel.app`），应该能看到应用首页，而不是 404 错误。

## 如果还是 404

1. **检查 Root Directory 配置**
   - 确认路径是 `projects/漕河泾/apps/visit-app`（注意中文字符）
   - 路径前后不要有空格

2. **查看构建日志**
   - 在 Deployments 页面点击部署记录
   - 查看 **Build Logs**（构建日志）
   - 确认构建成功，没有错误

3. **检查文件结构**
   - 确认 `projects/漕河泾/apps/visit-app/package.json` 存在
   - 确认 `projects/漕河泾/apps/visit-app/src/app` 目录存在

## 常见错误

### ❌ 错误：Root Directory 留空或设置为 `.`
这会导致 Vercel 在仓库根目录查找 Next.js 项目，找不到就会 404。

### ✅ 正确：Root Directory 设置为 `projects/漕河泾/apps/visit-app`
这样 Vercel 会在正确的子目录中查找和构建 Next.js 项目。

## 技术说明

- `vercel.json` 文件在 `visit-app` 目录中，Vercel 会自动读取
- Root Directory 配置告诉 Vercel 在哪里查找 `package.json` 和 `next.config.js`
- 构建命令和输出目录会自动从 `vercel.json` 读取
