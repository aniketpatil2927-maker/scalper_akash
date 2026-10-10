import React, { useMemo } from 'react';

interface SparkleParticle {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  type: 'dot' | 'star' | 'glow';
  opacity: number;
}

export const HeroSparkles: React.FC = () => {
  // Generate 65 randomized white stardust and sparkle particles across the hero section
  const particles: SparkleParticle[] = useMemo(() => {
    return Array.from({ length: 65 }, (_, i) => {
      const type: 'dot' | 'star' | 'glow' = 
        i % 5 === 0 ? 'star' : i % 3 === 0 ? 'glow' : 'dot';
      
      const size = 
        type === 'star' 
          ? 3 + (i % 3) * 1.5 
          : type === 'glow' 
          ? 2.5 + (i % 2) * 1 
          : 1 + (i % 2) * 1.2;

      return {
        id: i,
        // Distribute nicely across the entire hero width (2% to 98%)
        left: ((i * 1.57 + (i % 7) * 13.3) % 96) + 2,
        // Distribute from top to bottom (5% to 95%)
        top: ((i * 2.31 + (i % 5) * 17.7) % 90) + 5,
        size,
        duration: 2.2 + (i % 7) * 0.6,
        delay: (i % 11) * 0.35,
        type,
        opacity: 0.3 + (i % 5) * 0.15,
      };
    });
  }, []);

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none z-0" 
      aria-hidden="true"
    >
      {/* Ambient Top Spotlight Cone Glow (as shown in reference image) */}
      <div 
        className="absolute -top-10 right-[15%] w-72 h-80 pointer-events-none opacity-40"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(255, 130, 0, 0.45) 0%, rgba(255, 107, 0, 0.15) 40%, transparent 75%)',
          clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
          filter: 'blur(10px)',
        }}
      />

      {/* Particle Constellation */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animation: `sparkleTwinkle ${p.duration}s infinite ease-in-out ${p.delay}s, sparkleDrift ${p.duration * 2.5}s infinite ease-in-out ${p.delay}s`,
            opacity: p.opacity,
          }}
        >
          {p.type === 'star' ? (
            /* 4-Point Shimmering Star Sparkle */
            <svg 
              viewBox="0 0 24 24" 
              className="fill-white text-white drop-shadow-[0_0_8px_rgba(255,255,255,1)]"
              style={{ width: `${p.size * 2.5}px`, height: `${p.size * 2.5}px` }}
            >
              <path d="M12 0 L14 9 L23 12 L14 15 L12 24 L10 15 L1 12 L10 9 Z" />
            </svg>
          ) : p.type === 'glow' ? (
            /* Glowing Stardust Particle with Soft Halo */
            <div 
              className="rounded-full bg-white shadow-[0_0_8px_3px_rgba(255,255,255,0.9)]"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
              }}
            />
          ) : (
            /* Crisp Diamond / Circular Pixel Sparkle */
            <div 
              className="rounded-full bg-white/90 shadow-[0_0_4px_1px_rgba(255,255,255,0.7)]"
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
