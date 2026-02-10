/**
 * Portal Layout — Modern SaaS 风格
 * 浅色顶栏 + Tab 导航 + 企业库入口
 */
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Home, Briefcase, Shield, Rocket, Building2, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';

const TABS = [
  { id: 'home', label: '首页', icon: Home, href: '/' },
  { id: 'visit', label: '客户拜访', icon: Briefcase, href: '/visit' },
  { id: 'policy', label: '政策服务', icon: Shield, href: '/policy' },
  { id: 'incubator', label: '孵化器', icon: Rocket, href: '/incubator' },
  { id: 'enterprises', label: '企业库', icon: Building2, href: '/enterprises' },
  { id: 'dashboard', label: '管理看板', icon: BarChart3, href: '/dashboard' },
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

function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = getActiveTab(pathname);
  
  // 检测是否在 iframe 中
  const isEmbed = searchParams.get('embed') === 'true' || (typeof window !== 'undefined' && window.self !== window.top);

  // iframe 模式：只显示简洁的 Tab 导航，不显示 Logo 和标题
  if (isEmbed) {
    return (
      <nav className="shrink-0 bg-white border-b border-slate-200 z-50">
        <div className="flex items-center h-12 px-4 overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 h-12 text-xs font-medium transition-colors cursor-pointer shrink-0 whitespace-nowrap',
                  isActive
                    ? 'text-[#3370FF]'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                <tab.icon className={cn("h-3.5 w-3.5", isActive ? "text-[#3370FF]" : "text-slate-400")} />
                <span className="hidden sm:inline">{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3370FF]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // 正常模式：完整导航栏
  return (
    <nav className="shrink-0 bg-white border-b border-slate-200 z-50">
      <div className="flex items-center h-14 px-4 sm:px-6 justify-between max-w-[1200px] mx-auto w-full">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 mr-4 sm:mr-8 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">漕</div>
          <span className="font-bold text-slate-900 text-lg hidden sm:block">智能驾驶舱</span>
        </div>

        {/* Tab 导航 - 移动端支持水平滚动 */}
        <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar mask-gradient">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className={cn(
                  'relative flex items-center gap-2 px-3 sm:px-4 h-14 text-sm font-medium transition-colors cursor-pointer shrink-0 whitespace-nowrap',
                  isActive
                    ? 'text-[#3370FF]'
                    : 'text-slate-500 hover:text-slate-900'
                )}
              >
                <tab.icon className={cn("h-4 w-4", isActive ? "text-[#3370FF]" : "text-slate-400")} />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3370FF]" />
                )}
              </button>
            );
          })}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs">
            FDE
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <Suspense fallback={<div className="h-14 bg-white border-b border-slate-200" />}>
        <Navigation />
      </Suspense>

      {/* 内容区 */}
      <main className="flex-1 overflow-y-auto bg-white">
        {children}
      </main>
    </div>
  );
}
