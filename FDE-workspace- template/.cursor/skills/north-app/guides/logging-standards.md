# 日志规范

## 问题背景

PR #1173 中两个应用共有 382 条 `console.log` 语句，生产环境日志刷屏。

## 统一日志工具

```typescript
// lib/logger.ts
const LOG_LEVEL = process.env.NEXT_PUBLIC_LOG_LEVEL || 'warn';
const LEVELS = ['debug', 'info', 'warn', 'error'];

function shouldLog(level: string): boolean {
  return LEVELS.indexOf(level) >= LEVELS.indexOf(LOG_LEVEL);
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) console.log('[DEBUG]', ...args);
  },
  info: (...args: unknown[]) => {
    if (shouldLog('info')) console.log('[INFO]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) console.warn('[WARN]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);  // 始终输出
  },
};
```

## 使用规则

| 级别 | 用途 | 示例 |
|------|------|------|
| `debug` | 开发调试信息 | `logger.debug('版本列表:', versions)` |
| `info` | 关键业务事件 | `logger.info('项目已创建:', projectId)` |
| `warn` | 异常但可恢复 | `logger.warn('Realtime 超时，启动轮询')` |
| `error` | 错误 | `logger.error('保存失败:', error)` |

## 环境配置

```bash
# 开发环境
NEXT_PUBLIC_LOG_LEVEL=debug

# 生产环境
NEXT_PUBLIC_LOG_LEVEL=warn
```

## 禁止行为

- 禁止生产代码使用 `console.log`
- 禁止使用 emoji 装饰的调试日志（如 `console.log('🔥🔥🔥🔥')`)
- 错误日志必须包含上下文（函数名、关键参数）
