import React, { useEffect, useState, useRef } from 'react';

interface CosmicBackgroundProps {
  showAstronaut?: boolean;
  astronautOpacity?: number;
  position?: 'side' | 'center';
  className?: string;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  brightness: number;
}

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({
  showAstronaut = true,
  astronautOpacity = 0.95,
  position = 'side',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const targetOffset = useRef({ x: 0, y: 0 });
  const currentOffset = useRef({ x: 0, y: 0 });
  const [stars, setStars] = useState<Star[]>([]);

  // Generate subtle background stars
  useEffect(() => {
    const starList: Star[] = [];
    for (let i = 0; i < 48; i++) {
      starList.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 4,
        duration: Math.random() * 3 + 2,
        brightness: Math.random() * 0.7 + 0.3,
      });
    }
    setStars(starList);
  }, []);

  // Smooth mouse parallax animation
  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      if (innerWidth === 0 || innerHeight === 0) return;
      // Normalized between -1 and 1
      const nx = (e.clientX / innerWidth) * 2 - 1;
      const ny = (e.clientY / innerHeight) * 2 - 1;
      targetOffset.current = { x: nx, y: ny };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const loop = () => {
      // Lerp smoothing
      currentOffset.current.x += (targetOffset.current.x - currentOffset.current.x) * 0.05;
      currentOffset.current.y += (targetOffset.current.y - currentOffset.current.y) * 0.05;

      setMouseOffset({
        x: currentOffset.current.x,
        y: currentOffset.current.y,
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="cosmic-background-root"
      className={`fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 ${className}`}
    >
      {/* 1. Deep Space Cosmic Backdrop */}
      <div
        className="absolute -inset-10 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-out will-change-transform"
        style={{
          backgroundImage: `url('/images/cosmic-bg.jpg')`,
          transform: `translate3d(${mouseOffset.x * 10}px, ${mouseOffset.y * 10}px, 0) scale(1.06)`,
          filter: 'contrast(1.08) brightness(0.92)',
        }}
      />

      {/* 2. Soft Vignette and Cosmic Teal Ambient Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/80 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(20,80,95,0.45)_0%,_rgba(10,25,35,0.2)_50%,_transparent_80%)] pointer-events-none" />

      {/* 3. Twinkling Cosmic Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white will-change-opacity animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.brightness,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)`,
            }}
          />
        ))}

        {/* Ambient Shooting Star Effect */}
        <div className="shooting-star-1 absolute top-1/4 -left-20 w-36 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-200 to-transparent rotate-[-25deg] opacity-0" />
        <div className="shooting-star-2 absolute top-1/3 -right-20 w-44 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent rotate-[145deg] opacity-0" />
      </div>

      {/* 4. Drifting Volumetric Cloud Layers */}
      {/* Cloud Layer 1 - Deep Background Bank */}
      <div
        className="absolute -bottom-16 -left-20 w-[65vw] max-w-4xl opacity-40 mix-blend-screen will-change-transform animate-cloud-drift-1"
        style={{
          transform: `translate3d(${mouseOffset.x * -18}px, ${mouseOffset.y * -10}px, 0)`,
        }}
      >
        <img
          src="/images/cloud1.webp"
          alt="Cosmic cloud layer 1"
          referrerPolicy="no-referrer"
          className="w-full h-auto object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
        />
      </div>

      {/* Cloud Layer 2 - Right Midground Horizon */}
      <div
        className="absolute bottom-10 -right-24 w-[75vw] max-w-5xl opacity-45 mix-blend-screen will-change-transform animate-cloud-drift-2"
        style={{
          transform: `translate3d(${mouseOffset.x * 22}px, ${mouseOffset.y * 14}px, 0)`,
        }}
      >
        <img
          src="/images/cloud2.webp"
          alt="Cosmic cloud layer 2"
          referrerPolicy="no-referrer"
          className="w-full h-auto object-contain filter drop-shadow-[0_0_25px_rgba(150,220,255,0.2)]"
        />
      </div>

      {/* Cloud Layer 3 - Lower Ambient Mist */}
      <div
        className="absolute -bottom-24 left-1/4 w-[60vw] max-w-3xl opacity-50 mix-blend-screen will-change-transform animate-cloud-drift-3"
        style={{
          transform: `translate3d(${mouseOffset.x * -12}px, ${mouseOffset.y * -8}px, 0)`,
        }}
      >
        <img
          src="/images/cloud3.webp"
          alt="Cosmic cloud layer 3"
          referrerPolicy="no-referrer"
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Cloud Layer 4 - Foreground Accent Cloud */}
      <div
        className="absolute top-1/3 -right-16 w-[45vw] max-w-2xl opacity-35 mix-blend-screen will-change-transform animate-cloud-drift-4"
        style={{
          transform: `translate3d(${mouseOffset.x * 15}px, ${mouseOffset.y * 20}px, 0)`,
        }}
      >
        <img
          src="/images/cloud4.webp"
          alt="Cosmic cloud layer 4"
          referrerPolicy="no-referrer"
          className="w-full h-auto object-contain"
        />
      </div>

      {/* 5. Animated Metallic Chrome Astronaut */}
      {showAstronaut && (
        <div
          id="cosmic-astronaut-container"
          className={`absolute inset-0 flex items-center pointer-events-none select-none ${
            position === 'side' ? 'md:justify-end md:pr-14 lg:pr-24 justify-center' : 'justify-center'
          }`}
          style={{
            perspective: '1000px',
          }}
        >
          <div
            className="relative will-change-transform animate-astronaut-float"
            style={{
              transform: `translate3d(${mouseOffset.x * 32}px, ${mouseOffset.y * 24}px, 0) rotate(${mouseOffset.x * 3.5}deg)`,
              opacity: astronautOpacity,
              transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {/* Astronaut Radial Backlight Aura */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none -z-10 animate-pulse" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-sky-300/15 blur-2xl pointer-events-none -z-10" />

            {/* Astronaut Cutout Image */}
            <div className="relative group max-w-[280px] sm:max-w-[380px] md:max-w-[460px] lg:max-w-[540px] px-4">
              <img
                src="/images/astronaut.webp"
                alt="Floating astronaut in zero-g cosmic space suit"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.85)] filter brightness-[1.02] contrast-[1.05]"
              />

              {/* Specular Chrome Shimmer Ray */}
              <div
                className="absolute inset-0 pointer-events-none overflow-hidden rounded-full opacity-35 mix-blend-overlay animate-chrome-shimmer"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.7) 50%, transparent 60%)',
                  backgroundSize: '200% 100%',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. Subtle Cosmic Scanline / Cinematic Film Grain Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.6)_100%)] pointer-events-none" />
    </div>
  );
};
