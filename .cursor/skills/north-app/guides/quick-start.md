# 快速开始

## 项目结构

```
@north-app/[app-name]/
├── public/
│   └── xiaobei-manifest.json     # App 清单文件（必需）
├── src/
│   ├── app/                      # Next.js App Router 页面
│   │   ├── (root)/
│   │   │   ├── page.tsx          # 首页（项目列表）
│   │   │   ├── start/page.tsx    # 创建页
│   │   │   ├── detail/page.tsx   # 详情页
│   │   │   └── templates/page.tsx # 模板管理页
│   │   ├── share/[id]/page.tsx   # 分享页（无需登录）
│   │   └── layout.tsx            # 根布局
│   ├── components/               # React 组件
│   │   ├── create/               # 创建相关组件
│   │   ├── detail/               # 详情页组件
│   │   ├── home/                 # 首页组件
│   │   └── report/               # 报告组件
│   ├── contexts/
│   │   └── sdk-context.tsx       # SDK Context Provider（必需）
│   ├── hooks/                    # 自定义 Hooks
│   │   ├── useProjectRealtime.ts # Realtime 订阅
│   │   └── use-research-projects.ts # 项目管理
│   ├── lib/                      # 工具库
│   │   ├── host-api.ts           # 宿主 API 封装（核心）
│   │   ├── supabase.ts           # 数据库操作
│   │   ├── prompts.ts            # Prompt 构建
│   │   └── schema.ts             # 数据类型定义
│   └── store/                    # Zustand 状态管理
│       ├── app-state.ts          # 应用状态
│       └── projects-cache.ts     # 项目缓存
├── docs/                         # 文档
├── supabase-schema.sql           # 数据库 Schema
└── package.json
```

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14+ | App Router |
| React | 19 | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 3.x | 样式 |
| Zustand | 5.x | 状态管理 |
| Supabase | 2.x | 数据库 + Realtime |
| Zod | 3.x | Schema 验证 |
| north-client-sdk | - | 宿主通信 |

## 数据流架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户操作                              │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  App 页面 (Next.js)                                         │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │  start/     │   │  detail/    │   │  首页      │        │
│  │  创建项目   │   │  查看结果   │   │  项目列表   │        │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘       │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Hooks Layer                                                │
│  - useResearchProjects (CRUD + 工作流)                      │
│  - useProjectRealtime (实时订阅)                            │
│  - useHostAPI (宿主通信)                                    │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
        ▼                                         ▼
┌───────────────────┐                   ┌───────────────────┐
│  宿主 (Host)      │                   │  Supabase         │
│  • 代理 API 请求  │                   │  • 数据库存储      │
│  • 启动 Agent     │                   │  • Realtime 订阅  │
│  • 用户身份管理   │                   └───────────────────┘
└───────────────────┘                             │
        │                                         │
        ▼                                         │
┌───────────────────┐                             │
│  Agent            │────── 写入数据 ─────────────▶
│  • 执行任务       │                             │
│  • 调用 supabase  │                             │
│    _tool          │                             │
└───────────────────┘                             │
                                                  │
┌─────────────────────────────────────────────────┴───────────┐
│  Realtime 推送更新                                          │
│  useProjectRealtime → Zustand Store → React 组件重渲染      │
└─────────────────────────────────────────────────────────────┘
```

## App 清单配置

**public/xiaobei-manifest.json:**

```json
{
  "id": "your-app-name",
  "name": "应用显示名称",
  "version": "1.0.0",
  "entry": "/",
  "icon": "/favicon.png",
  "permissions": [
    "getUserInfo",
    "sendChat",
    "listDriveFiles",
    "uploadFile",
    "getFileDownloadUrl",
    "readFile",
    "writeFile"
  ]
}
```

## 环境变量

```bash
# .env.local

# Supabase（必需）
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# 宿主 origin（可选，自动推断）
NEXT_PUBLIC_XIAOBEI_ORIGIN=http://localhost:3000

# API URL（可选，自动推断）
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## 宿主组件库

可用的共享组件：

| 包 | 组件 | 用途 |
|---|---|---|
| `@north/design` | Button, Input, Dialog | UI 组件 |
| `@north/design` | Toaster | Toast 通知 |
| `@north/design` | FileIcon, YellowFolderIcon | 图标 |
| `@north/common` | cn | 类名合并（类似 clsx） |
| `@north/common` | formatFileSize | 文件大小格式化 |
| `@north/north-client-sdk` | useAppManager | SDK Hook |

**使用示例：**

```tsx
import { cn, formatFileSize } from '@north/common';
import { Button, Input, Dialog, Toaster, FileIcon } from '@north/design';
import { useAppManager } from '@north/north-client-sdk';
import { toast } from 'sonner';

// 根布局中引入 Toaster
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SDKProvider>{children}</SDKProvider>
        <Toaster />
      </body>
    </html>
  );
}
```
