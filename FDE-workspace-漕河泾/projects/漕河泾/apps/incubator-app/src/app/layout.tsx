import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: '孵化器管理 - 漕河泾智能驾驶舱',
  description: 'A6 奇岱松校友中心孵化器管理',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
