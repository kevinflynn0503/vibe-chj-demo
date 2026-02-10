# 404 错误排查指南

## 如果配置了 Root Directory 还是 404

### 1. 检查 Vercel Dashboard 中的 Root Directory 配置

**必须确保：**
- Settings → General → Root Directory = `projects/漕河泾/apps/visit-app`
- 路径前后没有空格
- 路径中的中文字符正确

### 2. 检查构建日志

在 Vercel Dashboard：
1. 进入 **Deployments** 页面
2. 点击最新的部署记录
3. 查看 **Build Logs**

**应该看到：**
```
> npm run build
> next build
...
Route (app)                              Size     First Load JS
┌ ○ /                                    4.51 kB         108 kB
```

**如果看到错误：**
- `Cannot find module` → 检查 Root Directory 路径
- `No such file or directory` → 检查路径中的中文字符
- `package.json not found` → Root Directory 配置错误

### 3. 验证文件结构

确认 GitHub 仓库中有以下文件：
- ✅ `projects/漕河泾/apps/visit-app/package.json`
- ✅ `projects/漕河泾/apps/visit-app/next.config.js`
- ✅ `projects/漕河泾/apps/visit-app/src/app/layout.tsx`
- ✅ `projects/漕河泾/apps/visit-app/src/app/(portal)/page.tsx`

### 4. 尝试重新导入项目

如果以上都不行，删除项目重新导入：

1. **删除现有项目**
   - Settings → Delete Project

2. **重新导入**
   - Add New Project → Import Git Repository
   - 选择 `kevinflynn0503/vibe-chj-demo`
   - 在 **Configure Project** 页面：
     - **Root Directory**: `projects/漕河泾/apps/visit-app`
     - **Framework Preset**: Next.js
     - 其他设置会自动填充

3. **点击 Deploy**

### 5. 检查 Vercel 项目设置

在 Settings → General 中确认：
- ✅ **Root Directory**: `projects/漕河泾/apps/visit-app`
- ✅ **Build Command**: `npm run build`（会自动从 vercel.json 读取）
- ✅ **Output Directory**: `.next`（会自动从 vercel.json 读取）
- ✅ **Install Command**: `npm install`（会自动从 vercel.json 读取）

### 6. 如果还是不行

**最后的手段：将项目移到根目录**

如果 Vercel 对子目录支持有问题，可以考虑：
1. 创建一个新分支
2. 将 `projects/漕河泾/apps/visit-app` 的内容移到仓库根目录
3. 更新 `.gitignore` 排除不需要的文件
4. 重新部署

## 联系支持

如果以上方法都不行，可以：
1. 查看 Vercel 的构建日志，截图错误信息
2. 检查 GitHub 仓库的文件结构是否正确
3. 联系 Vercel 支持（提供错误 ID，例如：`hkg1::94xlx-1770733215904-36279dc98dc8`）
