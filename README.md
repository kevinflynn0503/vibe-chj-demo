# 漕河泾智能驾驶舱 - Visit App

漕河泾园区智能驾驶舱系统的前端应用，包含企业走访、政策服务、孵化器管理等核心功能。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + Lucide React Icons
- **状态管理**: Zustand
- **数据验证**: Zod
- **通知**: Sonner

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器 (端口 3333)
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## Vercel 部署

### 方式一：通过 Vercel Dashboard（推荐）

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New Project"
3. 导入 GitHub 仓库 `kevinflynn0503/vibe-chj-demo`
4. Vercel 会自动检测 Next.js 项目
5. 配置：
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (如果项目在根目录)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
6. 点击 "Deploy"

### 方式二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   └── (portal)/          # Portal 路由组
│       ├── page.tsx       # 首页（员工工作台）
│       ├── dashboard/     # 管理看板
│       ├── enterprises/   # 企业库
│       ├── policy/        # 政策服务
│       ├── incubator/     # 孵化器
│       └── visit/         # 走访管理
├── lib/
│   ├── mock-data.ts      # Mock 数据
│   ├── schema.ts         # 数据模型
│   ├── utils.ts          # 工具函数
│   └── host-api.ts       # 宿主应用 API
└── components/           # 共享组件（如有）
```

## 核心功能

### 1. 企业走访
- 走访记录管理
- AI 提取关键信息
- 需求跟进

### 2. 政策服务
- AI 智能筛选
- 政策触达任务
- 申报诊断

### 3. 孵化器管理
- 在孵企业列表
- AI 订单匹配
- 活跃度监控

### 4. 管理看板
- 团队效能分析
- 任务分配管理
- 筛选审核

## 环境变量

当前项目使用 Mock 数据，无需环境变量。如需连接真实 API，请在 Vercel 项目设置中添加：

```
NEXT_PUBLIC_API_URL=your_api_url
```

## 注意事项

- 项目使用 Mock 数据，所有数据在 `src/lib/mock-data.ts` 中定义
- 宿主应用集成通过 `src/lib/host-api.ts` 中的函数调用
- 支持嵌入模式（通过 URL 参数 `?embed=true`）

## License

Private
