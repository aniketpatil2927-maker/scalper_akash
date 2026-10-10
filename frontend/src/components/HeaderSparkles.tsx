import React, { useState, useEffect, useMemo } from 'react';

interface SparkleParticle {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  isStar: boolean;
}

export const HeaderSparkles: React.FC = () => {
  const [isLight, setIsLight] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('light') || localStorage.getItem('app_theme') === 'light';
    }
    return false;
  });

  useEffect(() => {
    const handleStorage = () => {
      const theme = localStorage.getItem('app_theme');
      setIsLight(theme === 'light');
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('themechange', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('themechange', handleStorage);
    };
  }, []);

  // Generate a fixed constellation of 28 sparkle particles across the header
  const particles: SparkleParticle[] = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: Math.round(((i * 3.6) + (i % 3) * 1.2 + 2) % 96),
      top: Math.round(((i * 7 + 13) % 75) + 12),
      size: (i % 4 === 0) ? 5 : (i % 3 === 0) ? 3.5 : (i % 2 === 0) ? 2.5 : 1.5,
      duration: 1.8 + (i % 5) * 0.5,
      delay: (i % 7) * 0.4,
      isStar: i % 3 === 0,
    }));
  }, []);

  // In dark mode (!isLight), display the sparkling starry background
  const showSparkles = !isLight;

  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-700 ${
        showSparkles ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animation: `sparkleTwinkle ${p.duration}s infinite ease-in-out ${p.delay}s, sparkleDrift ${p.duration * 2}s infinite ease-in-out ${p.delay}s`,
          }}
        >
          {p.isStar ? (
            /* 4-Point Shimmering Star Sparkle */
            <svg 
              viewBox="0 0 24 24" 
              className="fill-white text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]"
              style={{ width: `${p.size * 2}px`, height: `${p.size * 2}px` }}
            >
              <path d="M12 0 L14 9 L23 12 L14 15 L12 24 L10 15 L1 12 L10 9 Z" />
            </svg>
          ) : (
            /* Glowing Circular Particle */
            <div 
              className="rounded-full bg-white shadow-[0_0_6px_2px_rgba(255,255,255,0.85)]"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
