import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import '../index.css';

export const metadata: Metadata = {
  title: '漕河泾智能驾驶舱',
  description: '智能招商服务平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
