# Phase 5：App 开发

> 输入：确认的 Demo + 产品方案 + 数据接入方案
> 输出：可用的 north-app（真实数据）
> 时间：Day 11-16

## 核心原则

在 Demo 骨架上"长肉"。不是重写，是增量替换。

## 改造步骤（每个 App）

```
1. Supabase 表设计 + 创建（基于 Phase 3 数据模型）
2. mock 数据 → Supabase 查询（替换 hooks）
3. mock SDK → 真实 SDK（用户认证、宿主通信）
4. Agent 集成（构建 Prompt、sendChat、结果展示）
5. Realtime 订阅（Agent 写入 → App 实时更新）
6. 自动保存、版本管理等
```

## 技术参考

所有开发细节参考 `skills/north-app/SKILL.md`，特别是：
- `skills/north-app/guides/supabase-patterns.md`
- `skills/north-app/guides/realtime.md`
- `skills/north-app/guides/host-communication.md`
- `skills/north-app/guides/prompts.md`

## HITL 交互

FDE 每天跑一遍 App，测试功能，发现问题告诉 AI 修。重点关注：
- 数据是否正确加载
- Agent 是否返回预期结果
- Realtime 是否正常
- 用户数据是否隔离
