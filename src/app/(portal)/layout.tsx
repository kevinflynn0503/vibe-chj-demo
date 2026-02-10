/**
 * Portal Layout — 适配嵌入小北 iframe
 * 纯白背景 + 底部浮动胶囊导航（不占顶部，不与小北冲突）
 */
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Briefcase, Shield, Rocket, Building2, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'home', label: '首页', icon: Home, href: '/' },
  { id: 'visit', label: '拜访', icon: Briefcase, href: '/visit' },
  { id: 'policy', label: '政策', icon: Shield, href: '/policy' },
  { id: 'incubator', label: '孵化', icon: Rocket, href: '/incubator' },
  { id: 'enterprises', label: '企业', icon: Building2, href: '/enterprises' },
  { id: 'dashboard', label: '看板', icon: BarChart3, href: '/dashboard' },
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
    <div className="relative h-screen overflow-hidden bg-white">
      {/* 内容区 — 底部留出导航空间 */}
      <main className="h-full overflow-y-auto pb-16">
        {children}
      </main>

      {/* 底部浮动导航 */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50">
        <nav className="flex items-center gap-0.5 px-1.5 py-1.5 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-lg shadow-slate-200/50">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'bg-[#3370FF] text-white shadow-sm shadow-blue-200'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                )}
              >
                <tab.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400")} />
                <span className={cn("text-[10px] font-medium leading-none", isActive ? "text-white" : "text-slate-500")}>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
