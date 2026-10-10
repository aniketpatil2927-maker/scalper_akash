import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
  TrendingUp, 
  Layers, 
  Bell, 
  User, 
  Shield, 
  Video, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Bot,
  BookOpen,
  Calendar,
  Share2,
  Activity,
  Award,
  BookMarked,
  Calculator,
  MessageSquare,
  Users,
  FlaskConical,
  ShoppingBag
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  badge?: string;
}

interface SidebarGroup {
  groupName: string;
  items: SidebarItem[];
}

export const ClientSidebar: React.FC = () => {
  const { user, logout, notifications } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('client_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('client_sidebar_collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const unreadNotifs = notifications.filter(n => !n.isRead).length;

  const menuGroups: SidebarGroup[] = [
    {
      groupName: 'Trading Terminal',
      items: [
        { name: 'Live Signals', path: '/dashboard', icon: TrendingUp },
        { name: '12 Calculators', path: '/dashboard/tools', icon: Calculator, badge: 'PRO' },
        { name: 'Trading Playbooks', path: '/dashboard/playbooks', icon: BookOpen },
        { name: 'My Analytics', path: '/dashboard/analytics', icon: Activity },
        { name: 'Trading Journal', path: '/dashboard/journal', icon: BookMarked },
      ],
    },
    {
      groupName: 'Strategy Lab & AI',
      items: [
        { name: 'Quant Strategy Lab', path: '/dashboard/strategy-lab', icon: FlaskConical, badge: 'LAB' },
        { name: 'Scalper AI Assistant', path: '/dashboard/ai-assistant', icon: Bot, badge: 'AI' },
      ],
    },
    {
      groupName: 'Community & Advisory',
      items: [
        { name: 'Community Lounge', path: '/dashboard/community', icon: MessageSquare },
        { name: '1-on-1 Mentorship', path: '/dashboard/mentorship', icon: Users },
      ],
    },
    {
      groupName: 'Academy & Library',
      items: [
        { name: 'Course Catalog', path: '/dashboard/catalog', icon: BookOpen },
        { name: 'My Learning', path: '/dashboard/courses', icon: Award },
        { name: 'Live Masterclasses', path: '/dashboard/webinars', icon: Calendar },
        { name: 'Digital Marketplace', path: '/dashboard/marketplace', icon: ShoppingBag },
        { name: 'My Certificates', path: '/dashboard/certificates', icon: Award },
      ],
    },
    {
      groupName: 'Rewards & Plans',
      items: [
        { name: 'Refer & Earn', path: '/dashboard/referrals', icon: Share2, badge: '20%' },
        { name: 'Subscription Plans', path: '/dashboard/plans', icon: Layers },
        { name: 'Recorded Vault', path: '/sessions', icon: Video },
      ],
    },
    {
      groupName: 'Account',
      items: [
        { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotifs > 0 ? `${unreadNotifs}` : undefined },
        { name: 'Profile Settings', path: '/profile', icon: User },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside 
      className={`relative flex flex-col h-screen bg-[#090a0f] border-r border-[#1c202e] text-gray-300 transition-all duration-300 ease-in-out select-none z-40 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-[#1c202e]">
        <Link to="/" className="flex items-center space-x-2.5 overflow-hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ccff00] text-black font-black text-xs shadow-[0_0_15px_rgba(204,255,0,0.4)] flex-shrink-0">
            ⚡
          </div>
          {!isCollapsed && (
            <span className="font-black text-white tracking-wider text-xs whitespace-nowrap">
              SCALPER<span className="text-[#ccff00]"> AKASH</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 py-4 space-y-4 px-3 overflow-y-auto scrollbar-thin">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 px-2 py-0.5">
                {group.groupName}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                    isActive 
                      ? 'bg-[#ccff00] text-black font-extrabold shadow-[0_0_15px_rgba(204,255,0,0.25)]' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white font-medium'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-black font-black' : 'text-gray-400'}`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                      isActive 
                        ? 'bg-black text-[#ccff00]' 
                        : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-[#1c202e] bg-[#07080b]">
        {!isCollapsed && user && (
          <div className="mb-2 px-2.5 py-2 rounded-xl bg-[#0e1017] border border-white/5 flex items-center justify-between">
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user.fullName}</div>
              <div className="text-[9px] text-[#ccff00] font-mono">{user.mobile || user.email}</div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-bold"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
