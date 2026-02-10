# Phase 4：静态 Demo

> 输入：App 设计方案
> 输出：可交互的静态 Demo（north-app 架构）
> 时间：Day 8-10

## 核心原则

**Demo 是 App 的骨架，不是扔掉的原型。**

```
Demo 和 App 使用完全相同的：
✅ Next.js 14 + App Router 项目结构
✅ @north/design + shadcn/ui + Tailwind 组件库
✅ TypeScript 类型定义（和 Supabase schema 一致）
✅ SDK Context 框架（Demo 中 mock 掉通信）
✅ 路由结构（首页 / 创建 / 详情）
✅ Zustand Store 结构

Demo 不需要的：
❌ Supabase 连接（用 mock 数据）
❌ Agent 集成（用静态内容）
❌ Realtime（用手动刷新）
```

## 执行步骤

1. 读 `docs/03-产品设计/App设计/[场景]App.md`
2. 在 `apps/[场景名]/` 创建 Next.js 项目
3. 搭建路由和页面结构
4. 用 @north/design 组件构建 UI
5. 用 mock 数据填充（数据结构和 Supabase schema 一致）
6. 页面可交互（路由跳转、表单、组件状态）

## Mock 策略

```typescript
// lib/mock-data.ts — Demo 阶段
export const mockEnterprises = [
  {
    id: "ENT-001",
    name: "上海XX科技有限公司",
    industry: "AI数据标注",
    revenue: "3000万",
    lastVisit: "2026-01-15",
    // 使用和 Supabase schema 一致的字段名
  },
];

// hooks/useEnterprises.ts — 统一接口
export function useEnterprises() {
  // Phase 4: return { data: mockEnterprises, loading: false };
  // Phase 5: 替换为 supabase.from('enterprises').select('*')
  return { data: mockEnterprises, loading: false };
}
```

## 技术参考

所有开发细节参考 `skills/north-app/SKILL.md` 和 `skills/north-app/guides/`。

## HITL 交互

```
Day 8: AI 搭建 → FDE 跑起来看 → 提修改 → AI 改
Day 9: 继续调整 + 搭建其他场景 Demo
Day 10: FDE 带 Demo 去客户演示 → 收集反馈 → AI 修改 → FDE 确认
```
