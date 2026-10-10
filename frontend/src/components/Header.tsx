import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
  TrendingUp, 
  Bell, 
  User, 
  LogOut, 
  Globe,
  ChevronDown,
  Bot,
  Zap,
  BookOpen,
  Calendar,
  Layers,
  Menu,
  X
} from 'lucide-react';
import { LampThemeToggle } from './LampThemeToggle.js';
import { TELEGRAM_CHANNEL_URL, WHATSAPP_CHANNEL_URL } from './CommunityChannels.js';

export const Header: React.FC = () => {
  const { user, subscription, notifications, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem('app_theme') || 'dark';
  });

  React.useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const unreadNotifications = notifications.filter(n => !n.isRead).length;
  
  const isAdmin = user?.roles.includes('ADMIN') || user?.roles.includes('SUPER_ADMIN');
  const isTrader = user?.roles.includes('TRADER');

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-[#08090d]/95 backdrop-blur-2xl border-b border-white/5 relative overflow-hidden">
      {/* High-Visibility Scanning Cyber Laser Beam */}
      <div className="absolute bottom-0 left-0 w-2/5 h-[2px] bg-gradient-to-r from-transparent via-[#d2fd2a] to-[#7c5cfc] shadow-[0_0_14px_#d2fd2a] animate-header-laser pointer-events-none z-20" />
      
      {/* Ambient Moving Cyber Glow in Header Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#7c5cfc]/15 via-transparent to-[#d2fd2a]/15 animate-header-glow pointer-events-none z-0" />
      
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Brand Logo - SCALPER AKASH with Animated Shimmer Badge */}
        <Link 
          to="/" 
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center space-x-2 sm:space-x-2.5 text-sm sm:text-base lg:text-lg font-black tracking-tight text-white hover:opacity-90 transition-opacity shrink-0 group"
        >
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-[#d2fd2a] text-black font-black text-xs shadow-[0_0_15px_rgba(210,253,42,0.4)] shrink-0 animate-badge-glow">
            ⚡
          </div>
          <span className="whitespace-nowrap">SCALPER <span className="text-[#d2fd2a]">AKASH</span></span>
        </Link>

        {/* Center Navigation Links - Responsive Fluid Navigation */}
        <nav className="hidden lg:flex items-center space-x-3 xl:space-x-5 text-xs xl:text-sm font-semibold">
          <Link 
            to="/" 
            className={`transition-colors whitespace-nowrap relative py-1 ${
              isActive('/') ? 'text-[#d2fd2a]' : 'text-gray-300 hover:text-white'
            }`}
          >
            <span>Home</span>
            {isActive('/') && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d2fd2a] rounded-full shadow-[0_0_8px_#d2fd2a]" />}
          </Link>
          <Link 
            to="/tools" 
            className={`transition-colors whitespace-nowrap relative py-1 ${
              isActive('/tools') ? 'text-[#d2fd2a]' : 'text-gray-300 hover:text-white'
            }`}
          >
            <span>Pro Tools</span>
            {isActive('/tools') && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d2fd2a] rounded-full shadow-[0_0_8px_#d2fd2a]" />}
          </Link>
          <Link 
            to="/playbooks" 
            className={`transition-colors whitespace-nowrap relative py-1 ${
              isActive('/playbooks') ? 'text-[#d2fd2a]' : 'text-gray-300 hover:text-white'
            }`}
          >
            <span>Playbooks</span>
            {isActive('/playbooks') && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d2fd2a] rounded-full shadow-[0_0_8px_#d2fd2a]" />}
          </Link>
          <Link 
            to="/strategy-lab" 
            className={`transition-colors whitespace-nowrap relative py-1 ${
              isActive('/strategy-lab') ? 'text-[#d2fd2a]' : 'text-gray-300 hover:text-white'
            }`}
          >
            <span>Strategy Lab</span>
            {isActive('/strategy-lab') && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d2fd2a] rounded-full shadow-[0_0_8px_#d2fd2a]" />}
          </Link>
          <Link 
            to="/marketplace" 
            className={`transition-colors whitespace-nowrap relative py-1 ${
              isActive('/marketplace') ? 'text-[#d2fd2a]' : 'text-gray-300 hover:text-white'
            }`}
          >
            <span>Marketplace</span>
            {isActive('/marketplace') && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d2fd2a] rounded-full shadow-[0_0_8px_#d2fd2a]" />}
          </Link>
          <Link 
            to="/mentorship" 
            className={`transition-colors whitespace-nowrap relative py-1 ${
              isActive('/mentorship') ? 'text-[#d2fd2a]' : 'text-gray-300 hover:text-white'
            }`}
          >
            <span>Mentorship</span>
            {isActive('/mentorship') && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d2fd2a] rounded-full shadow-[0_0_8px_#d2fd2a]" />}
          </Link>
          <Link 
            to="/pricing" 
            className={`transition-colors whitespace-nowrap relative py-1 ${
              isActive('/pricing') ? 'text-[#d2fd2a]' : 'text-gray-300 hover:text-white'
            }`}
          >
            <span>Pricing</span>
            {isActive('/pricing') && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d2fd2a] rounded-full shadow-[0_0_8px_#d2fd2a]" />}
          </Link>
          <Link 
            to="/about" 
            className={`transition-colors whitespace-nowrap relative py-1 ${
              isActive('/about') ? 'text-[#d2fd2a]' : 'text-gray-300 hover:text-white'
            }`}
          >
            <span>About</span>
            {isActive('/about') && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d2fd2a] rounded-full shadow-[0_0_8px_#d2fd2a]" />}
          </Link>

          {user && (
            <>
              <Link 
                to="/dashboard" 
                className={`font-bold transition-colors whitespace-nowrap relative py-1 ${
                  isActive('/dashboard') ? 'text-[#d2fd2a]' : 'text-[#8b5cf6] hover:text-white'
                }`}
              >
                <span>Terminal</span>
                {isActive('/dashboard') && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d2fd2a] rounded-full shadow-[0_0_8px_#d2fd2a]" />}
              </Link>
              <Link 
                to="/dashboard/ai-assistant" 
                className="font-bold text-violet-300 hover:text-white flex items-center space-x-1 whitespace-nowrap"
              >
                <Bot className="h-3.5 w-3.5 text-violet-400" />
                <span>Scalper AI</span>
              </Link>
            </>
          )}

          {(isAdmin || isTrader) && (
            <Link 
              to="/admin" 
              className="text-xs font-black text-[#d2fd2a] bg-[#d2fd2a]/10 border border-[#d2fd2a]/30 hover:bg-[#d2fd2a] hover:text-black px-2.5 py-1 rounded-full transition-all shadow-[0_0_10px_rgba(210,253,42,0.15)] whitespace-nowrap"
            >
              ERP Panel
            </Link>
          )}
        </nav>

        {/* User Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          
          {/* Live Market Active Indicator Pill */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#10131d]/90 border border-white/10 text-[10px] text-gray-300 shadow-inner select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d2fd2a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d2fd2a]"></span>
            </span>
            <span className="font-extrabold text-white tracking-wider text-[9.5px]">LIVE SIGNALS</span>
          </div>

          {/* Quick Community & Theme icons */}
          <div className="hidden lg:flex items-center gap-1.5 bg-[#0e1017] border border-white/10 rounded-full py-0.5 px-2">
            <div className="flex items-center justify-center pr-1 border-r border-[#1c202e]">
              <LampThemeToggle size="sm" />
            </div>

            <a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-full hover:bg-[#229ED9]/20 text-[#229ED9] transition-colors"
              title="Join Official Telegram"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
            </a>
            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-full hover:bg-[#25D366]/20 text-[#25D366] transition-colors"
              title="WhatsApp Support"
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.27-2.42 5.82a8.17 8.17 0 01-5.82 2.42c-1.47 0-2.91-.39-4.17-1.14l-.3-.18-3.12.82.83-3.04-.2-.32a8.19 8.19 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44s-.56-1.35-.77-1.85c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.29 3.8 2.52 1.09 2.52.73 2.98.68.46-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.11-.23-.17-.48-.3z"/>
              </svg>
            </a>
          </div>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link to="/notifications" className="relative p-2 rounded-full hover:bg-white/5 text-gray-300 hover:text-white transition-all">
                <Bell className="h-4.5 w-4.5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white">
                    {unreadNotifications}
                  </span>
                )}
              </Link>

              <Link to="/profile" className="flex items-center space-x-2 text-xs text-gray-200 hover:text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#141722] border border-white/10 text-[#d2fd2a] font-bold">
                  {user.fullName[0].toUpperCase()}
                </div>
              </Link>

              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-rose-400 transition-colors"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link 
                to="/login" 
                className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-white/20 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition-all"
              >
                Log in
              </Link>
              <Link 
                to="/pricing" 
                className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#d2fd2a] hover:bg-[#bcf018] text-black font-extrabold text-xs sm:text-sm shadow-md transition-all hidden sm:inline-flex"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 lg:hidden focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0b10] border-b border-white/10 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive('/') ? 'bg-[#d2fd2a]/10 text-[#d2fd2a]' : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/tools" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive('/tools') ? 'bg-[#d2fd2a]/10 text-[#d2fd2a]' : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Pro Tools
          </Link>
          <Link 
            to="/playbooks" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive('/playbooks') ? 'bg-[#d2fd2a]/10 text-[#d2fd2a]' : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Playbooks
          </Link>
          <Link 
            to="/strategy-lab" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive('/strategy-lab') ? 'bg-[#d2fd2a]/10 text-[#d2fd2a]' : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Strategy Lab
          </Link>
          <Link 
            to="/marketplace" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive('/marketplace') ? 'bg-[#d2fd2a]/10 text-[#d2fd2a]' : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Marketplace
          </Link>
          <Link 
            to="/mentorship" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive('/mentorship') ? 'bg-[#d2fd2a]/10 text-[#d2fd2a]' : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Mentorship
          </Link>
          <Link 
            to="/courses" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive('/courses') ? 'bg-[#d2fd2a]/10 text-[#d2fd2a]' : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Courses
          </Link>
          <Link 
            to="/pricing" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive('/pricing') ? 'bg-[#d2fd2a]/10 text-[#d2fd2a]' : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Pricing
          </Link>
          <Link 
            to="/about" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
              isActive('/about') ? 'bg-[#d2fd2a]/10 text-[#d2fd2a]' : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            About
          </Link>

          {user && (
            <>
              <Link 
                to="/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-bold ${
                  isActive('/dashboard') ? 'bg-[#d2fd2a]/10 text-[#d2fd2a]' : 'text-[#8b5cf6] hover:bg-white/5'
                }`}
              >
                Terminal
              </Link>
              <Link 
                to="/dashboard/ai-assistant" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-bold text-violet-300 hover:bg-white/5"
              >
                <Bot className="h-4 w-4 text-violet-400" />
                <span>Scalper AI Assistant</span>
              </Link>
            </>
          )}

          {(isAdmin || isTrader) && (
            <Link 
              to="/admin" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-black text-[#d2fd2a] bg-[#d2fd2a]/10 border border-[#d2fd2a]/30"
            >
              ERP Panel
            </Link>
          )}

          {/* Social Links on Mobile */}
          <div className="pt-3 border-t border-white/10 flex items-center gap-3">
            <a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#229ED9]/15 text-[#229ED9] text-xs font-semibold"
            >
              Telegram
            </a>
            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#25D366]/15 text-[#25D366] text-xs font-semibold"
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
