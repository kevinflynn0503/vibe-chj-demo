/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  // Enable standalone output for Docker deployment
  output: 'standalone',
  // ⚠️ 必须修改：设置 basePath 为你的 App 路径
  basePath: '/app/your-app-name',
  // 允许的开发来源
  allowedDevOrigins: [
    'ei.xiaobei.top',
    'localhost',
    '127.0.0.1',
  ],

  // API 代理配置
  async rewrites() {
    const coreApiUrl = process.env.NORTH_APP_CORE_API_URL;
    if (!coreApiUrl) {
      console.warn(
        '[your-app-name] NORTH_APP_CORE_API_URL not set, /api routes will not be proxied',
      );
      return [];
    }

    return [
      {
        source: '/api/v1/:path*',
        destination: `${coreApiUrl}/v1/:path*`,
      },
    ];
  },

  // ============================================
  // iframe 嵌入安全头配置（必须）
  // 不配置会导致 iframe 中显示空白
  // ============================================
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' * localhost:* ei.xiaobei.top https://ei.xiaobei.top http://localhost:3000; connect-src 'self' https://*.supabase.co wss://*.supabase.co *",
          },
        ],
      },
    ];
  },
};

export default config;
