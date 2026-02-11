/**
 * Portal Layout — 适配嵌入小北 iframe
 * 
 * 导航方案：浮动胶囊 sticky 在内容区顶部
 * - 不是独立 header，是内容区的一部分
 * - sticky 吸顶，滚动时带 backdrop-blur
 * - 不占全宽，居中浮动，像内容内嵌的控件
 */
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
    <div className="relative h-screen overflow-y-auto bg-white">
      {/* 浮动胶囊导航 — sticky 吸顶，居中，不占全宽 */}
      <div className="sticky top-0 z-50 flex justify-center py-2 pointer-events-none">
        <nav className="pointer-events-auto flex items-center gap-0.5 px-1.5 py-1 bg-white/85 backdrop-blur-lg border border-slate-200/60 rounded-full shadow-sm">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer',
                  isActive
                    ? 'bg-[#3370FF] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/80'
                )}
              >
                <tab.icon className={cn("h-3.5 w-3.5", isActive ? "text-white" : "text-slate-400")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 内容区 — 导航是内容的一部分，负 margin 补偿 */}
      <main className="-mt-1">
        {children}
      </main>
    </div>
  );
}
