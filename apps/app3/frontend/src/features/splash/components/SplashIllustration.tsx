import React from 'react';

interface SplashIllustrationProps {
  className?: string;
  size?: number;
}

export const SplashIllustration: React.FC<SplashIllustrationProps> = ({
  className = '',
  size = 140,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <div className='absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl animate-pulse pointer-events-none' />

      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-xl overflow-visible'
      >
        <defs>
          <linearGradient id='splashShieldGrad' x1='30' y1='20' x2='130' y2='140' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#10b981' />
            <stop offset='50%' stopColor='#059669' />
            <stop offset='100%' stopColor='#047857' />
          </linearGradient>

          <linearGradient id='splashGoldRing' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#fcd34d' />
            <stop offset='50%' stopColor='#f59e0b' />
            <stop offset='100%' stopColor='#d97706' />
          </linearGradient>

          <linearGradient id='splashGloss' x1='40' y1='25' x2='80' y2='90' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#ffffff' stopOpacity='0.6' />
            <stop offset='100%' stopColor='#ffffff' stopOpacity='0' />
          </linearGradient>
        </defs>

        <ellipse cx='80' cy='146' rx='44' ry='8' fill='#047857' fillOpacity='0.2' />

        <path
          d='M80 18 L128 36 C128 88 106 126 80 144 C54 126 32 88 32 36 L80 18 Z'
          fill='url(#splashShieldGrad)'
        />

        <path
          d='M80 26 L120 42 C120 82 102 116 80 132 C58 116 40 82 40 42 L80 26 Z'
          fill='url(#splashGloss)'
        />

        <rect x='74' y='48' width='12' height='36' rx='4' fill='#ffffff' />
        <rect x='62' y='60' width='36' height='12' rx='4' fill='#ffffff' />

        <g transform='translate(60, 94)'>
          <circle cx='14' cy='14' r='12' stroke='url(#splashGoldRing)' strokeWidth='3.5' fill='none' />
          <circle cx='26' cy='14' r='12' stroke='url(#splashGoldRing)' strokeWidth='3.5' fill='none' />
        </g>
      </svg>
    </div>
  );
};

export default SplashIllustration;
