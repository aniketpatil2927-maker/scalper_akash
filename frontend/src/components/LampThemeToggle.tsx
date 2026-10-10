import React, { useState, useEffect } from 'react';

interface LampThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LampThemeToggle: React.FC<LampThemeToggleProps> = ({ 
  className = '',
  size = 'md' 
}) => {
  const [isLight, setIsLight] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('light') || localStorage.getItem('app_theme') === 'light';
    }
    return false;
  });

  useEffect(() => {
    const handleStorage = () => {
      const theme = localStorage.getItem('app_theme');
      const light = theme === 'light';
      setIsLight(light);
      if (light) {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('themechange', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('themechange', handleStorage);
    };
  }, []);

  const toggleTheme = () => {
    const nextLightState = !isLight;
    const nextTheme = nextLightState ? 'light' : 'dark';
    
    setIsLight(nextLightState);
    if (nextLightState) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('app_theme', nextTheme);
    window.dispatchEvent(new Event('themechange'));
  };

  const sizeClasses = {
    sm: 'w-[46px] h-[24px] p-[2px]',
    md: 'w-[54px] h-[28px] p-[3px]',
    lg: 'w-[64px] h-[34px] p-[4px]'
  };

  const thumbSizeClasses = {
    sm: 'h-[18px] w-[18px]',
    md: 'h-[20px] w-[20px]',
    lg: 'h-[24px] w-[24px]'
  };

  const translateClasses = {
    sm: isLight ? 'translate-x-[22px]' : 'translate-x-0',
    md: isLight ? 'translate-x-[26px]' : 'translate-x-0',
    lg: isLight ? 'translate-x-[30px]' : 'translate-x-0'
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center rounded-full bg-dark-950/80 border border-dark-800 cursor-pointer transition-all duration-300 outline-none focus:outline-none focus:ring-1 focus:ring-accent-cyan/50 shadow-inner group ${sizeClasses[size]} ${className}`}
      aria-label="Toggle theme"
      title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      {/* Sliding Thumb */}
      <span
        className={`absolute rounded-full bg-[#ccff00] text-black shadow-md transform transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center ${thumbSizeClasses[size]} ${translateClasses[size]}`}
      >
        {isLight ? (
          // Sun Icon inside sliding thumb (Light Mode active)
          <svg className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        ) : (
          // Moon Icon inside sliding thumb (Dark Mode active)
          <svg className="h-2.5 w-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </span>

      {/* Track Background Icons */}
      <div className="flex justify-between items-center w-full px-1.5 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity">
        {/* Moon Icon on the Left */}
        <svg className={`h-3 w-3 transition-colors ${!isLight ? 'text-[#ccff00]' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
        
        {/* Sun Icon on the Right */}
        <svg className={`h-3 w-3 transition-colors ${isLight ? 'text-yellow-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      </div>
    </button>
  );
};
