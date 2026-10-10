import React from 'react';

interface TradingBackgroundProps {
  opacity?: number;
}

export const TradingBackground: React.FC<TradingBackgroundProps> = ({ opacity = 1 }) => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 transition-opacity duration-700"
      style={{ opacity }}
    >
      {/* 1. Deep Ambient Atmosphere Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-violet-600/15 via-indigo-600/5 to-transparent rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute -top-32 right-10 w-[400px] h-[400px] bg-[#ccff00]/8 rounded-full blur-[100px] animate-float" style={{ animationDuration: '14s' }} />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-violet-500/10 rounded-full blur-[110px] animate-float" style={{ animationDuration: '18s', animationDelay: '3s' }} />

      {/* 2. Micro Dot Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(204,255,0,0.12)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,#000_60%,transparent_100%)] opacity-40" />

      {/* 3. Subtle Animated Floating Candlestick Bars */}
      <div className="absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_50%,#000_50%,transparent_100%)]">
        {/* Left Side Candlesticks */}
        <div className="absolute left-[8%] top-[35%] flex items-end gap-3 animate-float" style={{ animationDuration: '10s' }}>
          <div className="flex flex-col items-center">
            <div className="w-[1px] h-6 bg-[#ccff00]/60" />
            <div className="w-2.5 h-12 rounded-sm bg-gradient-to-b from-[#ccff00] to-emerald-500 shadow-[0_0_8px_rgba(204,255,0,0.6)]" />
            <div className="w-[1px] h-8 bg-[#ccff00]/60" />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-[1px] h-8 bg-rose-500/60" />
            <div className="w-2.5 h-8 rounded-sm bg-gradient-to-b from-rose-500 to-rose-700" />
            <div className="w-[1px] h-4 bg-rose-500/60" />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-[1px] h-10 bg-[#ccff00]/60" />
            <div className="w-2.5 h-16 rounded-sm bg-gradient-to-b from-[#ccff00] to-emerald-500 shadow-[0_0_10px_rgba(204,255,0,0.7)]" />
            <div className="w-[1px] h-6 bg-[#ccff00]/60" />
          </div>
        </div>

        {/* Right Side Candlesticks */}
        <div className="absolute right-[8%] top-[25%] flex items-end gap-3 animate-float" style={{ animationDuration: '12s', animationDelay: '2s' }}>
          <div className="flex flex-col items-center">
            <div className="w-[1px] h-6 bg-rose-500/60" />
            <div className="w-2.5 h-10 rounded-sm bg-gradient-to-b from-rose-500 to-rose-700" />
            <div className="w-[1px] h-6 bg-rose-500/60" />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-[1px] h-12 bg-violet-400/60" />
            <div className="w-2.5 h-20 rounded-sm bg-gradient-to-b from-violet-400 to-indigo-600 shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
            <div className="w-[1px] h-8 bg-violet-400/60" />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-[1px] h-5 bg-[#ccff00]/60" />
            <div className="w-2.5 h-14 rounded-sm bg-gradient-to-b from-[#ccff00] to-emerald-500" />
            <div className="w-[1px] h-5 bg-[#ccff00]/60" />
          </div>
        </div>
      </div>

      {/* 4. Glowing Horizon Wave */}
      <div className="absolute inset-x-0 bottom-0 top-1/4 flex items-center justify-center opacity-20">
        <svg 
          className="w-full h-full object-cover" 
          viewBox="0 0 1440 600" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="chartWaveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ccff00" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="chartWaveStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#ccff00" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <path 
            d="M0 450 C 200 420, 300 320, 480 340 C 660 360, 750 220, 960 260 C 1170 300, 1300 180, 1440 160 L 1440 600 L 0 600 Z" 
            fill="url(#chartWaveFill)" 
          />
          <path 
            d="M0 450 C 200 420, 300 320, 480 340 C 660 360, 750 220, 960 260 C 1170 300, 1300 180, 1440 160" 
            stroke="url(#chartWaveStroke)" 
            strokeWidth="2" 
            fill="none" 
          />
        </svg>
      </div>
    </div>
  );
};
