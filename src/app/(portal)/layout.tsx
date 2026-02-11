/**
 * Portal Layout — 适配嵌入小北 iframe
 * 
 * 导航方案：浮动胶囊 sticky 在内容区顶部
 * - 不是独立 header，是内容区的一部分
 * - sticky 吸顶，滚动时带 backdrop-blur
 * - 不占全宽，居中浮动，像内容内嵌的控件
 * 
 * 统一布局规范：
 * - 外层 h-screen + flex col，导航固定高度
 * - 内容区 flex-1 overflow-y-auto，每个 Tab 页自己滚动
 * - 所有页面共用同一套外壳，避免切换时跳动
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
    <div className="h-screen flex flex-col bg-white">
      {/* 浮动胶囊导航 — 固定高度，不参与滚动 */}
      <div className="shrink-0 flex justify-center py-2 z-50 bg-white/85 backdrop-blur-lg">
        <nav className="flex items-center gap-0.5 px-1.5 py-1 bg-white/85 backdrop-blur-lg border border-slate-200/60 rounded-full shadow-sm">
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

      {/* 内容区 — flex-1 占满剩余高度，自己滚动 */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
