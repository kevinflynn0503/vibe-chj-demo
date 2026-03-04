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
    <div className="h-screen flex flex-col bg-white">
      <nav className="shrink-0 z-50 flex items-center justify-center gap-1 px-4 h-11" style={{ background: 'rgba(51,112,255,0.04)' }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.href)}
              className={cn(
                'relative flex items-center gap-1.5 px-3 h-11 text-xs font-medium transition-colors duration-150 cursor-pointer',
                isActive
                  ? 'text-text-primary'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              <tab.icon className={cn("h-3.5 w-3.5", isActive ? "text-brand" : "")} />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden portal-scroll">
        {children}
      </main>
    </div>
  );
}
