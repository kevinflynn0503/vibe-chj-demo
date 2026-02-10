# 部署与 CI/CD

## next.config.js 标准配置

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,  // 必须启用

  // CSP headers（必须配置）
  async headers() {
    return [{
      source: '/(.*)',
      headers: [{
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.xiaobei.top",
          "frame-ancestors 'self' https://*.xiaobei.top",
        ].join('; '),
      }],
    }];
  },

  // 允许的开发域名
  allowedDevOrigins: ['http://localhost:3000', 'http://localhost:3001'],
};

module.exports = nextConfig;
```

## Docker 构建

```bash
#!/bin/bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
  -t north-app-[name]:latest .
```

## CI/CD 工作流

```yaml
# .github/workflows/north-app-[name]-publish.yaml
name: Publish North App [Name]
on:
  push:
    branches: [main]
    paths: ['web/@north-app/[name]/**']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @north-app/[name] build
      - run: docker build ...
      - run: docker push ...
```

## 环境变量

| 变量 | 说明 | 必需 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | 是 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名 Key | 是 |
| `NEXT_PUBLIC_LOG_LEVEL` | 日志级别 (debug/info/warn/error) | 否 |
