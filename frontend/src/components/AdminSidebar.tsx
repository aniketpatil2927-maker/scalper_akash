import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  TrendingUp, 
  Video, 
  Database, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Calendar,
  Gift,
  Share2,
  DollarSign,
  Bot,
  Percent,
  Radio
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  roles: string[];
  badge?: string;
}

interface SidebarGroup {
  groupName: string;
  items: SidebarItem[];
}

export const AdminSidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('admin_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const menuGroups: SidebarGroup[] = [
    {
      groupName: 'Executive',
      items: [
        { name: 'Revenue ERP', path: '/admin', icon: LayoutDashboard, roles: ['ADMIN', 'SUPER_ADMIN'] },
        { name: 'CRM Pipeline', path: '/admin/crm', icon: Users, roles: ['ADMIN', 'SUPER_ADMIN'] },
      ],
    },
    {
      groupName: 'Trading Advisory',
      items: [
        { name: 'Signals Manager', path: '/admin/trades', icon: TrendingUp, roles: ['ADMIN', 'SUPER_ADMIN', 'TRADER'] },
        { name: 'Session Vault', path: '/admin/videos', icon: Video, roles: ['ADMIN', 'SUPER_ADMIN', 'TRADER'] },
        { name: 'Playbooks Manager', path: '/admin/playbooks', icon: BookOpen, roles: ['ADMIN', 'SUPER_ADMIN', 'TRADER'] },
      ],
    },
    {
      groupName: 'Education & Community',
      items: [
        { name: 'Courses Builder', path: '/admin/courses', icon: BookOpen, roles: ['ADMIN', 'SUPER_ADMIN', 'TRADER'] },
        { name: 'Live Webinars', path: '/admin/webinars', icon: Calendar, roles: ['ADMIN', 'SUPER_ADMIN', 'TRADER'] },
        { name: 'Mentorship ERP', path: '/admin/mentorship', icon: Users, roles: ['ADMIN', 'SUPER_ADMIN'] },
        { name: 'Community Moderation', path: '/admin/community', icon: Bot, roles: ['ADMIN', 'SUPER_ADMIN'] },
      ],
    },
    {
      groupName: 'Commerce & Marketplace',
      items: [
        { name: 'Marketplace ERP', path: '/admin/marketplace', icon: Layers, roles: ['ADMIN', 'SUPER_ADMIN'] },
        { name: 'Subscription Plans', path: '/admin/plans', icon: Layers, roles: ['ADMIN', 'SUPER_ADMIN'] },
        { name: 'Coupons Engine', path: '/admin/coupons', icon: Percent, roles: ['ADMIN', 'SUPER_ADMIN'] },
        { name: 'Affiliate Network', path: '/admin/referrals', icon: Share2, roles: ['ADMIN', 'SUPER_ADMIN'] },
        { name: 'Payout Requests', path: '/admin/referrals/payouts', icon: DollarSign, roles: ['ADMIN', 'SUPER_ADMIN'] },
      ],
    },
    {
      groupName: 'Governance & Content',
      items: [
        { name: 'AI Assistant Quotas', path: '/admin/ai-assistant', icon: Bot, roles: ['ADMIN', 'SUPER_ADMIN'] },
        { name: 'CMS & Knowledge', path: '/admin/cms', icon: BookOpen, roles: ['ADMIN', 'SUPER_ADMIN'] },
        { name: 'Broadcast Center', path: '/admin/broadcasts', icon: Radio, roles: ['ADMIN', 'SUPER_ADMIN'] },
        { name: 'User Directory', path: '/admin/users', icon: Users, roles: ['ADMIN', 'SUPER_ADMIN'] },
        { name: 'Audit Ledger', path: '/admin/audit-logs', icon: Database, roles: ['ADMIN', 'SUPER_ADMIN'] },
      ],
    },
  ];

  return (
    <aside 
      className={`relative flex flex-col h-screen bg-[#090a0f] border-r border-[#1c202e] text-gray-300 transition-all duration-300 ease-in-out select-none z-40 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-[#1c202e]">
        <Link to="/" className="flex items-center space-x-2.5 overflow-hidden">
          <div className="h-8 w-8 rounded-xl bg-[#ccff00] flex items-center justify-center font-black text-black text-xs flex-shrink-0 shadow-[0_0_15px_rgba(204,255,0,0.35)]">
            ⚡
          </div>
          {!isCollapsed && (
            <span className="font-black text-white tracking-wider text-xs whitespace-nowrap">
              SCALPER<span className="text-[#ccff00]"> ERP</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 py-4 space-y-4 px-3 overflow-y-auto scrollbar-thin">
        {menuGroups.map((group, gIdx) => {
          const visibleItems = group.items.filter(item => 
            item.roles.some(role => user?.roles.includes(role))
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 px-2 py-0.5">
                  {group.groupName}
                </div>
              )}
              {visibleItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2.5 rounded-xl text-xs transition-all ${
                      isActive 
                        ? 'bg-[#ccff00] text-black font-extrabold shadow-[0_0_15px_rgba(204,255,0,0.25)]' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white font-medium'
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-black font-black' : 'text-gray-400'}`} />
                    {!isCollapsed && (
                      <span className="ml-3 truncate">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer Profile & Collapse Toggle */}
      <div className="p-3 border-t border-[#1c202e] bg-[#07080b]">
        {!isCollapsed && user && (
          <div className="mb-2 px-2 py-1.5 rounded-xl bg-[#0e1017] border border-white/5 flex items-center justify-between">
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user.fullName}</div>
              <div className="text-[9px] text-[#ccff00] font-mono uppercase">{user.roles[0]}</div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-center">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center py-2 px-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors text-xs font-semibold gap-2"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!isCollapsed && <span>Collapse Menu</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
