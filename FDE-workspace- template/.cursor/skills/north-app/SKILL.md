---
name: north-app
description: 小北平台嵌入式应用全栈开发指南。涵盖 SDK 集成、宿主通信、Supabase 数据库、Realtime 订阅、版本管理、AI 辅助编辑、UI 设计规范、代码规范、测试策略、本地测试。吸收了原 development 和 design 技能。适用于 Phase 4-6 的 Demo 搭建、App 开发和数据接入。
---

# 小北 App 开发指南

本 Skill 指导如何在小北平台开发嵌入式应用（`@north-app/*`）。
吸收了原 development（代码规范/测试/架构）和 design（UI/设计系统）技能。

## 从模板开始

**新建 App 必须从模板开始**，不要从零创建：

```bash
cp -r skills/north-app/app-template projects/[项目名]/apps/[app-name]
```

模板包含完整的可运行脚手架（从 research-book 提取），所有基础设施已就位：
SDK Context、Host API、Supabase CRUD、Realtime 订阅、Zustand Store、
next.config.js（CSP/basePath）、数据库 Schema、App 清单。

详见 `skills/north-app/app-template/README.md` 的修改清单。

---

## 架构概览

```
宿主应用 (@north/app)
  |  postMessage
  v
嵌入式应用 (@north-app/*)
  |
  +-- SDK Context (认证/通信)
  +-- Store (Zustand 状态管理)
  +-- Components (UI 渲染)
  +-- Supabase (Database + Realtime)
```

---

## 快速导航

### 平台开发

| 指南 | 说明 |
|------|------|
| [快速开始](guides/quick-start.md) | 项目结构、技术栈、数据流 |
| [宿主通信](guides/host-communication.md) | SDK 集成、用户认证、API 封装 |
| [Supabase 模式](guides/supabase-patterns.md) | 数据库设计、RLS、Realtime 启用 |
| [Realtime 订阅](guides/realtime.md) | 实时数据 + 轮询 fallback |
| [版本管理](guides/version-management.md) | 版本号、内容存储、自动保存 |
| [AI 编辑模式](guides/ai-editing-patterns.md) | 替换指令、DiffPreview、精确编辑 |
| [Prompt 构建](guides/prompts.md) | 与 Agent 交互的 Prompt 设计 |
| [文件交互](guides/file-interactions.md) | 文件选择、上传、下载 |
| [本地测试](guides/local-testing.md) | Agent 工具调用本地验证 |
| [日志规范](guides/logging-standards.md) | 日志分级、环境变量控制 |
| [共享库](guides/shared-libraries.md) | 代码复用、@north/app-common |
| [部署配置](guides/deployment.md) | CI/CD、Docker、next.config.js |
| [踩坑记录](guides/troubleshooting.md) | 已知问题与解法 |

### UI / 设计（原 design skill）

| 指南 | 说明 |
|------|------|
| [UI 设计规范](guides/ui-design.md) | 颜色、间距、组件、动画 |
| [设计标准体系](references/design-standards.md) | 设计令牌、色彩、排版、间距规范 |
| [组件架构](references/component-architecture.md) | 原子设计方法论、四层组件体系 |
| [shadcn 深度应用](references/shadcn-implementation.md) | 组件定制、主题系统配置 |
| [去 AI 化设计](references/anti-ai-design.md) | 避免模板化的设计策略 |
| [信息架构](references/information-architecture.md) | 用户认知与导航设计 |

### 开发规范（原 development skill）

| 指南 | 说明 |
|------|------|
| [架构设计](references/architecture-design.md) | 技术选型、架构模式、API 设计 |
| [全栈开发](references/fullstack-development.md) | 前后端规范、项目结构 |
| [测试工程](references/testing-engineering.md) | 测试策略、框架选型 |
| [TDD](references/tdd.md) | 红-绿-重构循环 |
| [代码审查](references/code-review.md) | 审查维度 |

## 可复用模式

| 模式 | 说明 |
|------|------|
| [Realtime + 轮询](patterns/realtime-polling.md) | 双重保障模式 |
| [自动保存防抖](patterns/auto-save-debounce.md) | 防抖 + 保存锁 |
| [版本最新优先](patterns/version-first.md) | `ORDER BY created_at DESC` |
| [替换指令编辑](patterns/replace-instruction.md) | Agent -> replacements -> 前端替换 |
| [SDK useRef](patterns/sdk-ref-pattern.md) | 避免 useEffect 无限循环 |
| [用户数据隔离](patterns/user-data-isolation.md) | `.eq('user_id', userId)` |
| [日志等级控制](patterns/log-level-control.md) | 环境变量控制输出 |

## 代码模板

| 模板 | 说明 |
|------|------|
| [sdk-context.tsx](templates/sdk-context.tsx) | SDK Provider |
| [host-api.ts](templates/host-api.ts) | Host API 封装 |
| [page.tsx](templates/page.tsx) | 页面组件 |
| [store.ts](templates/store.ts) | Zustand Store |
| [realtime-hook.ts](templates/realtime-hook.ts) | Realtime Hook |

---

## 10 条铁律

违反以下规则必然导致 Bug：

1. **SDK 必须传 `getState`** -- 否则 iframe 无法获取用户信息
2. **用 `useRef(hostAPI)` 防循环** -- 否则 useEffect 无限触发
3. **查询必须 `.eq('user_id', userId)`** -- 否则数据泄露
4. **Realtime 必配轮询 fallback** -- 否则网络抖动时丢数据
5. **自动保存必须有保存锁** -- 否则竞争条件覆盖新数据
6. **版本号 = `MAX + 1`** -- 禁止用 `count + 1`（删除后重复）
7. **完整内容直存 `content` 字段** -- 禁止依赖远程文件链
8. **日志用 logger，不用 `console.log`** -- 通过 `LOG_LEVEL` 环境变量控制
9. **公共代码提到 `@north/app-common`** -- 禁止跨应用 copy-paste
10. **CSP headers + `reactStrictMode: true`** -- next.config.js 必须配置

---

## 代码规范速查

### TypeScript

- 禁止 `any`，使用 `unknown`
- 对象类型用 `interface`，联合/工具类型用 `type`
- 枚举用 `const` 对象 + `as const`
- 所有函数参数和返回值有类型

### React

- 函数组件 + Hooks，禁止 class 组件
- Props 用 `interface` 定义并导出
- 条件渲染: loading -> error -> empty -> data
- 组件职责单一，使用组合而非继承

### 数据模型

- 表名复数（users, todos）
- 字段 snake_case（created_at, user_id）
- 必备: id, created_at, updated_at
- 外键必建索引

---

## UI 设计速查

### 设计令牌

```yaml
# 色彩（HSL）
primary: "hsl(220, 60%, 50%)"       # 深邃蓝
neutral-50: "hsl(220, 10%, 98%)"    # 背景
neutral-900: "hsl(220, 10%, 8%)"    # 标题

# 间距（8px 基础）
1: "4px"  2: "8px"  3: "12px"  4: "16px"  6: "24px"  8: "32px"

# 圆角
sm: "4px"  md: "8px"  lg: "12px"  xl: "16px"
```

### 组件四层体系

```
L4: 模板层   | DashboardLayout, FormPage, ListPage
L3: 有机体层 | DataTable, FilterPanel, FormSection
L2: 分子层   | SearchInput, FormField, ActionCard
L1: 原子层   | Button, Input, Label, Badge, Icon
```

### 去 AI 化原则

- 避免高饱和色彩（紫色渐变综合症）
- 避免通用字体（Inter、Roboto、Arial）
- 追求克制的色彩、独特的字体配对
- 微妙过渡代替过度动画

---

## 测试策略

```
单元测试 (70%): 函数/Hook/组件隔离测试，覆盖率 >= 80%
集成测试 (20%): API 端点/数据库操作，核心流程 100%
E2E 测试 (10%): 关键用户流程，P0 功能 100%
```

---

## SDK Context 配置要点

```tsx
const appManager = useAppManager({
  instanceId,
  originXiaobei,
  getState,  // 关键：必须传递
});
```

## Prompt 结构

```
<reference>
<!-- METADATA_JSON: {...} -->
【分析框架】模块列表...
【supabase_tool 参数结构】数据库操作指令...
【执行步骤】具体步骤...
</reference> 简单请求文案
```

---

## 发布检查清单

- [ ] SDK 初始化成功（`getState` 已传递）
- [ ] 获取用户信息正常
- [ ] 首页数据加载正确
- [ ] 创建操作正常
- [ ] 发送消息到 Agent
- [ ] Realtime 实时更新（含 fallback 验证）
- [ ] 文件上传/选择功能
- [ ] 错误处理完善
- [ ] 无 TypeScript 错误，无 ESLint 警告
- [ ] 日志已切换为 logger（无 console.log）
- [ ] 数据隔离验证（不同用户看不到彼此数据）
- [ ] 色彩饱和度适中，间距遵循 8px 网格
- [ ] 组件状态完整（default/hover/focus/disabled/loading）

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 3.0.0 | 2026-02-09 | 吸收 development（代码规范/测试/架构）+ design（UI/设计系统）；Skill 13→7 精简 |
| 2.0.0 | 2026-02-09 | 合并 local-test；新增 8 指南 + 7 模式；来自 PR #1173 实战经验 |
| 1.0.0 | 2026-01-28 | 初始版本 |
