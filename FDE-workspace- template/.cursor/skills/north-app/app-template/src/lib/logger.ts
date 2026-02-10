/**
 * 日志工具
 * 通过 NEXT_PUBLIC_LOG_LEVEL 环境变量控制输出等级
 * 开发环境默认 debug，生产环境默认 warn
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const getCurrentLevel = (): LogLevel => {
  const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel | undefined;
  if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
    return envLevel;
  }
  return process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
};

const currentLevel = getCurrentLevel();

export function createLogger(prefix: string) {
  return {
    debug: (...args: unknown[]) => {
      if (LOG_LEVELS[currentLevel] <= LOG_LEVELS.debug) {
        console.log(`[${prefix}]`, ...args);
      }
    },
    info: (...args: unknown[]) => {
      if (LOG_LEVELS[currentLevel] <= LOG_LEVELS.info) {
        console.info(`[${prefix}]`, ...args);
      }
    },
    warn: (...args: unknown[]) => {
      if (LOG_LEVELS[currentLevel] <= LOG_LEVELS.warn) {
        console.warn(`[${prefix}]`, ...args);
      }
    },
    error: (...args: unknown[]) => {
      console.error(`[${prefix}]`, ...args);
    },
  };
}

export type Logger = ReturnType<typeof createLogger>;
