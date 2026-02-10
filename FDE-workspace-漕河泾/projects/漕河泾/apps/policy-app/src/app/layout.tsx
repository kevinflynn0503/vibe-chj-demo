import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: '政策服务 - 漕河泾智能驾驶舱',
  description: '高新技术企业认定服务',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
