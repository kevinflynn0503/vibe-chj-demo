# North App 架构约束

> AI 产品经理在设计 App 和 Demo 时，必须了解的技术约束。

## 技术栈

```
Next.js 14 + App Router
TypeScript（严格模式）
@north/design + shadcn/ui + Tailwind CSS
Zustand（状态管理）
Supabase（Database + Realtime）
SDK Context（宿主通信）
```

## 项目结构

```
src/
├── app/                   # Next.js App Router 页面
│   ├── page.tsx           # 首页
│   ├── create/page.tsx    # 创建页
│   └── [id]/page.tsx      # 详情页
├── components/            # React 组件
│   ├── ui/                # 基础 UI 组件
│   └── [业务模块]/         # 业务组件
├── lib/                   # 工具函数
│   ├── supabase.ts        # Supabase 客户端
│   ├── host-api.ts        # 宿主 API 封装
│   └── prompts.ts         # Prompt 构建
├── hooks/                 # 自定义 Hooks
└── store/                 # Zustand Store
```

## Demo（Phase 4）→ App（Phase 5）的衔接

Demo 和 App 使用完全相同的架构。衔接通过替换 mock 层实现：

| 模块 | Demo（Phase 4） | App（Phase 5） |
|------|----------------|----------------|
| 数据 | `lib/mock-data.ts` | `supabase.from('xxx').select()` |
| SDK | mock SDK Context | 真实 SDK Context |
| Agent | 静态内容 | `sendChat()` + Realtime |
| 认证 | 跳过 | SDK `getUserInfo()` |

## 设计 App 时的注意事项

1. **页面路由**：首页列表 / 创建 / 详情 是标准模式
2. **数据模型**：字段命名和 Supabase 一致（snake_case）
3. **类型定义**：TypeScript interface 和数据库 schema 一致
4. **组件选择**：优先使用 @north/design 和 shadcn/ui
5. **状态管理**：用 Zustand，不用 Context
