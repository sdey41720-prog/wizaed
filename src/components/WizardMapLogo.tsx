import React from 'react';

interface WizardMapLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showSubtitle?: boolean;
  variant?: 'light' | 'dark' | 'header';
}

export const WizardMapEmblem: React.FC<{ className?: string; size?: number }> = ({ 
  className = '', 
  size = 44 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 130 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Wizard Map Emblem"
    >
      <defs>
        {/* Globe Clip for Continents */}
        <clipPath id="globe-clip">
          <circle cx="65" cy="74" r="30" />
        </clipPath>
        
        {/* Soft Globe Shadow */}
        <radialGradient id="globe-gradient" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="70%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </radialGradient>

        <linearGradient id="orbit-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        <filter id="star-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Behind Globe: Back Section of Orbital Ring */}
      <path
        d="M 32 78 C 30 60 52 50 82 54"
        stroke="#38bdf8"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.35"
      />

      {/* Earth Globe Sphere */}
      <circle
        cx="65"
        cy="74"
        r="30"
        fill="url(#globe-gradient)"
        className="drop-shadow-md"
      />

      {/* Earth Continents (Green) */}
      <g clipPath="url(#globe-clip)">
        {/* Northern Continents / Eurasia shape */}
        <path
          d="M 52 50 C 58 48 68 50 76 54 C 84 58 88 66 84 72 C 80 75 74 68 67 66 C 60 64 54 68 50 64 C 47 61 48 53 52 50 Z"
          fill="#22c55e"
        />
        {/* Indian subcontinent & South Asia shape */}
        <path
          d="M 64 68 C 67 67 71 70 70 76 C 69 82 66 87 63 91 C 61 87 60 81 60 76 C 60 71 62 69 64 68 Z"
          fill="#16a34a"
        />
        {/* West Continent / Africa & Americas side */}
        <path
          d="M 37 68 C 42 66 48 70 47 78 C 46 86 40 92 36 88 C 33 85 34 74 37 68 Z"
          fill="#22c55e"
        />
        {/* Australia / East Islands */}
        <path
          d="M 82 78 C 87 77 92 81 90 87 C 88 91 83 93 80 89 C 78 86 80 80 82 78 Z"
          fill="#22c55e"
        />
      </g>

      {/* Front Orbit Ring Wrapping Across Globe */}
      <path
        d="M 30 84 C 32 94 48 100 68 96 C 88 92 102 78 111 50"
        stroke="url(#orbit-grad)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Airplane at end of orbit path (banking up-right at ~40 deg) */}
      <g transform="translate(108, 46) rotate(38)">
        {/* Airplane Fuselage & Wings in Deep Navy */}
        <path
          d="M 0 -13 
             C 1.5 -13 2.5 -10 2.5 -4 
             L 13 2 
             L 13 4.5 
             L 2.5 3 
             L 2.5 9.5 
             L 6.5 12.5 
             L 6.5 14.5 
             L 0 13.5 
             L -6.5 14.5 
             L -6.5 12.5 
             L -2.5 9.5 
             L -2.5 3 
             L -13 4.5 
             L -13 2 
             L -2.5 -4 
             C -2.5 -10 -1.5 -13 0 -13 Z"
          fill="#1e3a8a"
          stroke="#93c5fd"
          strokeWidth="0.75"
        />
      </g>

      {/* Wizard Hat Sitting on Top of Globe */}
      {/* Hat Brim */}
      <path
        d="M 32 58 C 30 52 45 42 66 43 C 86 44 98 52 97 57 C 96 61 82 53 66 52 C 50 51 34 62 32 58 Z"
        fill="#1e3a8a"
      />
      {/* Hat Brim Underside Accent */}
      <path
        d="M 33 57 C 46 51 64 51 80 53 C 94 55 97 58 95 60 C 85 55 70 53 55 53 C 41 53 34 59 33 57 Z"
        fill="#0f172a"
        opacity="0.4"
      />

      {/* Hat Cone with stylish curved tip drooping to the left */}
      <path
        d="M 49 51 
           C 47 40 45 31 38 23 
           C 33 18 24 20 22 26 
           C 21 30 26 33 32 32 
           C 40 31 44 38 48 48 
           L 75 51 
           C 66 46 57 48 49 51 Z"
        fill="#1e3a8a"
      />

      {/* Large Golden Star on Hat Cone */}
      <g filter="url(#star-glow)">
        <polygon
          points="46,27 48.2,32.2 53.8,32.8 49.6,36.5 50.8,42 46,39.1 41.2,42 42.4,36.5 38.2,32.8 43.8,32.2"
          fill="#fbb01b"
        />
      </g>

      {/* Small Golden Star on Hat Cone */}
      <polygon
        points="57,36 58.2,38.8 61.2,39.1 59,41.1 59.6,44 57,42.5 54.4,44 55,41.1 52.8,39.1 55.8,38.8"
        fill="#fbb01b"
      />
    </svg>
  );
};

export const WizardMapLogo: React.FC<WizardMapLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  showSubtitle = true,
  variant = 'header',
}) => {
  const emblemSize = size === 'sm' ? 32 : size === 'lg' ? 56 : 42;

  return (
    <div
      id="wizard-map-logo-container"
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
    >
      {/* Vector Logo Emblem */}
      <WizardMapEmblem size={emblemSize} />

      {/* Typography */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1">
            {/* "Wizard" in clean bold navy/white with yellow star over the 'i' */}
            <span className="relative inline-flex items-center text-white font-extrabold tracking-tight font-sans text-base sm:text-lg">
              <span>W</span>
              {/* Custom 'i' with star dot */}
              <span className="relative inline-flex flex-col items-center mx-[1px]">
                {/* 5-point Star replacing the dot of the 'i' */}
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill="#fbb01b"
                  className="animate-pulse"
                >
                  <polygon points="12,2 15,8.5 22,9.3 17,14 18.5,21 12,17.3 5.5,21 7,14 2,9.3 9,8.5" />
                </svg>
                <span className="mt-[-2px]">ı</span>
              </span>
              <span>zard</span>
            </span>

            {/* "Map" in bright sky blue */}
            <span className="text-sky-400 font-extrabold tracking-tight font-sans text-base sm:text-lg ml-1">
              Map
            </span>
          </div>

          {/* Subtitle: "― FLIGHT TRACKING ―" */}
          {showSubtitle && (
            <div className="flex items-center gap-1 mt-1 text-[9px] font-bold tracking-[0.2em] uppercase text-sky-300/80 font-mono">
              <span className="text-sky-500 font-extrabold">—</span>
              <span>FLIGHT TRACKING</span>
              <span className="text-sky-500 font-extrabold">—</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
