# North App 模板

从 `research-book` 提取的最小可运行脚手架。包含所有 north-app 必需的基础设施。

## 使用方法

```bash
# 1. 复制模板到项目中
cp -r skills/north-app/app-template projects/[项目名]/apps/your-app-name

# 2. 全局替换占位符
#    - "your-app-name" → 你的 App 名称
#    - "App 名称" / "应用名称" → 中文显示名
#    - TABLE_NAME = 'projects' → 你的表名

# 3. 配置环境变量
cp apps/your-app-name/.env.example apps/your-app-name/.env.local
# 填入 Supabase URL 和 Key

# 4. 创建数据库表
# 在 Supabase Dashboard -> SQL Editor 中运行 supabase-schema.sql

# 5. 启动开发
cd apps/your-app-name
pnpm dev
```

## 目录结构

```
├── public/
│   └── xiaobei-manifest.json     # App 清单（⚠️ 修改 appId 和权限）
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # 根布局（SDKProvider + Toaster）
│   │   └── (root)/
│   │       ├── page.tsx          # 首页（列表）
│   │       ├── create/page.tsx   # 创建页
│   │       └── detail/page.tsx   # 详情页（Realtime 更新）
│   ├── contexts/
│   │   └── sdk-context.tsx       # SDK Provider（⚠️ 已配置好）
│   ├── hooks/
│   │   └── useProjectRealtime.ts # Realtime + 轮询 fallback
│   ├── lib/
│   │   ├── host-api.ts           # 宿主 API（用户信息/文件/消息）
│   │   ├── supabase.ts           # 数据库 CRUD（⚠️ 修改表名）
│   │   ├── schema.ts             # 类型定义（⚠️ 添加业务类型）
│   │   └── logger.ts             # 日志工具
│   └── store/
│       └── app-state.ts          # Zustand 状态管理
├── supabase-schema.sql           # 数据库表（⚠️ 修改字段）
├── next.config.js                # ⚠️ 修改 basePath
├── package.json                  # ⚠️ 修改 name
└── .env.example                  # 环境变量模板
```

## 需要修改的地方（⚠️）

1. **`package.json`** → `name` 字段
2. **`next.config.js`** → `basePath` 值
3. **`public/xiaobei-manifest.json`** → `appId`、`name`、`description`
4. **`src/lib/supabase.ts`** → `TABLE_NAME` 和 CRUD 方法
5. **`src/lib/schema.ts`** → 添加业务类型定义
6. **`supabase-schema.sql`** → 数据库表结构
7. **全局搜索替换** → `your-app-name`、`App 名称`

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14+ | App Router |
| React | 19 | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 3.x | 样式 |
| Zustand | 5.x | 状态管理 |
| Supabase | 2.x | 数据库 + Realtime |
| Zod | 4.x | Schema 验证 |
| @north/north-client-sdk | - | 宿主通信 |

## 关键模式

### SDK 初始化（必须传 getState）
```tsx
const appManager = useAppManager({
  instanceId,
  originXiaobei: origin,
  getState, // ⚠️ 不传会导致 iframe 无法通信
});
```

### Realtime + 轮询双保障
```tsx
// useProjectRealtime.ts 已实现
// Realtime 失败时自动降级为 5s 轮询
useProjectRealtime(projectId);
```

### Host API 用户信息（带重试）
```tsx
const hostAPI = useHostAPI();
const info = await hostAPI.getUserInfo(); // 5次重试，间隔1s
```

### 数据隔离
```tsx
// 所有查询必须带 user_id
.eq('user_id', userId)
```
