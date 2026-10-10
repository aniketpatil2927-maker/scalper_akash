import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Bell, User, LogOut, Search, ExternalLink, BookOpen, Calendar, Layers, Zap } from 'lucide-react';
import { LampThemeToggle } from './LampThemeToggle.js';

export const ClientTopBar: React.FC = () => {
  const { user, notifications, logout } = useAuth();
  const navigate = useNavigate();

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#08090d]/95 backdrop-blur-xl px-4 sm:px-6">
      
      {/* Left: Quick Access to Public Website & Search */}
      <div className="flex items-center space-x-4">
        <Link 
          to="/"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all"
          title="Back to Public Homepage"
        >
          <span className="text-[#d2fd2a] font-black text-xs">⚡</span>
          <span className="hidden sm:inline">Main Website</span>
        </Link>

        {/* Member Console Shortcuts */}
        <div className="hidden lg:flex items-center space-x-2 text-xs font-semibold text-gray-400">
          <Link to="/dashboard/catalog" className="px-2.5 py-1 rounded-lg hover:text-[#d2fd2a] hover:bg-white/5 transition-colors">
            Course Catalog
          </Link>
          <Link to="/dashboard/webinars" className="px-2.5 py-1 rounded-lg hover:text-[#d2fd2a] hover:bg-white/5 transition-colors">
            Live Masterclasses
          </Link>
          <Link to="/dashboard/plans" className="px-2.5 py-1 rounded-lg hover:text-[#d2fd2a] hover:bg-white/5 transition-colors">
            Upgrade Plans
          </Link>
        </div>
      </div>

      {/* Center Hanging Lamp Theme Toggle */}
      <div className="flex items-center justify-center">
        <LampThemeToggle size="md" />
      </div>

      {/* User Actions */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Notifications */}
        <Link 
          to="/notifications" 
          className="relative p-2 rounded-full bg-[#10131d] border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-200"
          title="Notifications"
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
          to="/profile" 
          className="flex items-center space-x-2.5 group"
          title="View Profile"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10131d] text-[#d2fd2a] font-bold border border-white/10 group-hover:border-[#d2fd2a]/50 transition-colors">
            {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-white group-hover:text-[#d2fd2a] transition-colors leading-none">
              {user?.fullName || 'Client'}
            </span>
            <span className="text-[9px] text-gray-500 font-medium mt-0.5">
              Verified Member
            </span>
          </div>
        </Link>

        <span className="h-5 w-[1px] bg-white/10 hidden md:inline" />

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-rose-400 rounded-full hover:bg-white/5 transition-colors focus:outline-none"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
