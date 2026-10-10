import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Bell, User, LogOut, Shield, ExternalLink, Globe } from 'lucide-react';
import { LampThemeToggle } from './LampThemeToggle.js';

export const ErpTopBar: React.FC = () => {
  const { user, notifications, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'ERP Dashboard Console';
    if (path === '/admin/users') return 'User Directory & Controls';
    if (path === '/admin/plans') return 'Subscription Plans Console';
    if (path === '/admin/trades') return 'Trading Signals Console';
    if (path === '/admin/courses') return 'Course Marketplace Manager';
    if (path === '/admin/webinars') return 'Live Masterclasses Manager';
    if (path === '/admin/referrals') return 'Affiliates & Referral Engine';
    if (path === '/admin/audit-logs') return 'System Audit Trail Ledger';
    if (path === '/admin/profile') return 'Admin Account Profile';
    if (path === '/admin/notifications') return 'System Notifications & Audit Feed';
    return 'Trader ERP Console';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#08090d]/95 backdrop-blur-xl px-4 sm:px-6">
      
      {/* Dynamic Console Title & Public Link */}
      <div className="flex items-center space-x-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#d2fd2a]/10 text-[#d2fd2a] border border-[#d2fd2a]/20">
          <Shield className="h-4 w-4" />
        </div>
        <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">{getPageTitle()}</h1>

        <Link
          to="/"
          className="hidden md:inline-flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all"
          title="Visit Public Website"
        >
          <span className="text-[#d2fd2a] font-bold">⚡</span>
          <span>View Website</span>
        </Link>
      </div>

      {/* Center Hanging Lamp */}
      <div className="flex items-center justify-center">
        <LampThemeToggle size="md" />
      </div>

      {/* User Actions */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Notifications */}
        <Link 
          to="/admin/notifications" 
          className="relative p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-200"
          title="Audit Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">
              {unreadNotifications}
            </span>
          )}
        </Link>

        <span className="h-5 w-[1px] bg-white/10" />

        {/* Profile Avatar */}
        <Link 
          to="/admin/profile" 
          className="flex items-center space-x-2.5 group"
          title="Account Profile"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10131d] border border-white/10 text-[#d2fd2a] group-hover:border-[#d2fd2a]/50 transition-colors font-bold text-xs">
            {user?.fullName ? user.fullName[0].toUpperCase() : 'A'}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-white group-hover:text-[#d2fd2a] transition-colors leading-none">
              {user?.fullName || 'Admin'}
            </span>
            <span className="text-[9px] text-gray-500 font-medium capitalize mt-0.5">
              {(user?.roles?.[0] || 'ADMIN').toLowerCase().replace('_', ' ')}
            </span>
          </div>
        </Link>

        <span className="h-5 w-[1px] bg-white/10 hidden md:inline" />

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-rose-400 rounded-full hover:bg-white/5 transition-colors focus:outline-none"
          title="Log Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
