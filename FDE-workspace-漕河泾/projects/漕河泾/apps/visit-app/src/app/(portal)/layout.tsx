/**
 * App 内部布局 — 飞书风格轻量标签页
 * 3 个场景 Tab：客户拜访 / 政策服务 / 孵化器
 */
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Briefcase, Shield, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'visit', label: '客户拜访', icon: Briefcase, href: '/visit' },
  { id: 'policy', label: '政策服务', icon: Shield, href: '/policy' },
  { id: 'incubator', label: '孵化器管理', icon: Rocket, href: '/incubator' },
];

function getActiveTab(pathname: string): string {
  if (pathname.startsWith('/policy')) return 'policy';
  if (pathname.startsWith('/incubator')) return 'incubator';
  return 'visit'; // /visit, /enterprises, / 都归客户拜访
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);

  // 企业画像等子页面不显示 Tab 栏
  const isSubPage = pathname.startsWith('/enterprises/');

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-body">
      {/* Tab 导航栏 */}
      {!isSubPage && (
        <nav className="shrink-0 bg-card border-b border-default">
          <div className="flex items-center h-10 px-4 gap-0">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => router.push(tab.href)}
                  className={cn(
                    'relative flex items-center gap-1.5 px-4 h-10 text-[13px] font-medium transition-colors cursor-pointer',
                    isActive
                      ? 'text-[var(--primary)]'
                      : 'text-secondary hover:text-primary'
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[var(--primary)] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* 内容区 */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
