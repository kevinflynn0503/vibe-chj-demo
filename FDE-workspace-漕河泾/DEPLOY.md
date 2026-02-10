# Vercel 部署指南

## 问题：404 错误

如果部署后出现 404 错误，是因为 Vercel 需要在项目设置中配置 **Root Directory**。

## 解决步骤

### 方法一：在 Vercel Dashboard 中配置（推荐）

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目 `vibe-chj-demo`
3. 进入 **Settings** → **General**
4. 找到 **Root Directory** 设置
5. 点击 **Edit**，输入：
   ```
   projects/漕河泾/apps/visit-app
   ```
6. 点击 **Save**
7. 重新部署：**Deployments** → 点击最新部署右侧的 **⋯** → **Redeploy**

### 方法二：重新导入项目时配置

如果方法一不行，可以删除项目重新导入：

1. 删除现有项目（Settings → Delete Project）
2. 重新导入 GitHub 仓库 `kevinflynn0503/vibe-chj-demo`
3. 在 **Configure Project** 页面：
   - **Framework Preset**: Next.js（会自动检测）
   - **Root Directory**: 点击 **Edit**，输入 `projects/漕河泾/apps/visit-app`
   - **Build Command**: `npm run build`（会自动填充）
   - **Output Directory**: `.next`（会自动填充）
   - **Install Command**: `npm install`（会自动填充）
4. 点击 **Deploy**

## 验证配置

部署成功后，访问你的 Vercel URL，应该能看到应用首页而不是 404。

## 常见问题

### Q: 为什么需要 Root Directory？
A: 因为 Next.js 应用在子目录 `projects/漕河泾/apps/visit-app` 中，而不是仓库根目录。

### Q: 配置后还是 404？
A: 检查：
1. Root Directory 路径是否正确（注意中文字符）
2. 是否重新部署了
3. 查看部署日志中的构建输出

### Q: 如何查看部署日志？
A: 在 Vercel Dashboard → Deployments → 点击部署 → 查看 **Build Logs**
