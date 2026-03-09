'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Briefcase, Shield, Rocket, Building2, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'home', label: '工作台', icon: Home, href: '/' },
  { id: 'visit', label: '客户拜访', icon: Briefcase, href: '/visit' },
  { id: 'policy', label: '政策服务', icon: Shield, href: '/policy' },
  { id: 'incubator', label: '孵化管理', icon: Rocket, href: '/incubator' },
  { id: 'enterprises', label: '企业库', icon: Building2, href: '/enterprises' },
  { id: 'dashboard', label: '数据看板', icon: BarChart3, href: '/dashboard' },
];

function getActiveTab(pathname: string): string {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/policy')) return 'policy';
  if (pathname.startsWith('/incubator')) return 'incubator';
  if (pathname.startsWith('/enterprises')) return 'enterprises';
  if (pathname.startsWith('/visit')) return 'visit';
  return 'home';
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);

  return (
    <div className="h-screen flex flex-col bg-surface-primary">
      {/* 导航栏：透明融入页面背景，无分割线 */}
      <nav className="shrink-0 z-50 h-[52px] relative">
        {/* 品牌标识 — 绝对定位在左侧 */}
        <div className="absolute left-5 top-0 h-full flex items-center gap-2.5">
          <span className="text-sm font-semibold text-brand tracking-tight">漕河泾</span>
          <span className="text-tag text-text-muted font-normal">智能驾驶舱</span>
        </div>

        {/* Tab — flex 居中 */}
        <div className="h-full flex items-center justify-center gap-0.5">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className={cn(
                  'relative flex items-center gap-1.5 px-3.5 h-[52px] text-sm font-medium cursor-pointer',
                  'transition-colors duration-normal ease-out-expo',
                  'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand focus-visible:rounded-sm',
                  isActive
                    ? 'text-text-primary'
                    : 'text-text-muted hover:text-text-secondary'
                )}
              >
                <tab.icon className={cn("h-4 w-4", isActive ? "text-brand" : "")} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-brand rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden portal-scroll">
        {children}
      </main>
    </div>
  );
}
