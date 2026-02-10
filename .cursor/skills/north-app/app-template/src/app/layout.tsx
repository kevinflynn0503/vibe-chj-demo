'use client';
import '@/index.css';

import { Toaster } from '@north/design';

import { SDKProvider } from '@/contexts/sdk-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <link rel="icon" href="/favicon.png" />
        <title>应用名称</title>
      </head>
      <body suppressHydrationWarning>
        <SDKProvider>{children}</SDKProvider>
        <Toaster />
      </body>
    </html>
  );
}
