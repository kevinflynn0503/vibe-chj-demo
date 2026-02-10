import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: '漕河泾智能驾驶舱',
  description: '智能招商服务平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
