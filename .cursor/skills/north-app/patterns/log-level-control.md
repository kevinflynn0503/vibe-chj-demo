# 统一日志等级控制

**适用场景**: 开发/生产环境的日志输出管理。

**核心实现**:

```typescript
// lib/logger.ts
const LOG_LEVEL = process.env.NEXT_PUBLIC_LOG_LEVEL || 'warn';
const LEVELS = ['debug', 'info', 'warn', 'error'];

export const logger = {
  debug: (...args: unknown[]) => {
    if (LEVELS.indexOf('debug') >= LEVELS.indexOf(LOG_LEVEL))
      console.log('[DEBUG]', ...args);
  },
  info: (...args: unknown[]) => {
    if (LEVELS.indexOf('info') >= LEVELS.indexOf(LOG_LEVEL))
      console.log('[INFO]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (LEVELS.indexOf('warn') >= LEVELS.indexOf(LOG_LEVEL))
      console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args); // 始终输出
  },
};
```

**注意事项**:
- 环境变量必须以 `NEXT_PUBLIC_` 开头（客户端可见）
- 开发环境设 `debug`，生产环境设 `warn`
- `error` 级别始终输出，不受 LOG_LEVEL 影响
- 禁止直接使用 `console.log`

**实例**: 所有 @north-app 应用的日志管理
