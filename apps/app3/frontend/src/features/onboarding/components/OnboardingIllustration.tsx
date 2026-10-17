import React from 'react';

interface OnboardingIllustrationProps {
  className?: string;
  size?: number;
}

export const OnboardingIllustration: React.FC<OnboardingIllustrationProps> = ({
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
          <linearGradient id='prelunaShieldGrad' x1='30' y1='20' x2='130' y2='140' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#10b981' />
            <stop offset='50%' stopColor='#059669' />
            <stop offset='100%' stopColor='#047857' />
          </linearGradient>

          <linearGradient id='prelunaGoldRing' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#fcd34d' />
            <stop offset='50%' stopColor='#f59e0b' />
            <stop offset='100%' stopColor='#d97706' />
          </linearGradient>

          <linearGradient id='prelunaGloss' x1='40' y1='25' x2='80' y2='90' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#ffffff' stopOpacity='0.6' />
            <stop offset='100%' stopColor='#ffffff' stopOpacity='0' />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx='80' cy='146' rx='44' ry='8' fill='#047857' fillOpacity='0.2' />

        {/* Shield Body */}
        <path
          d='M80 18 L128 36 C128 88 106 126 80 144 C54 126 32 88 32 36 L80 18 Z'
          fill='url(#prelunaShieldGrad)'
        />

        {/* Shield Gloss Inset */}
        <path
          d='M80 26 L120 42 C120 82 102 116 80 132 C58 116 40 82 40 42 L80 26 Z'
          fill='url(#prelunaGloss)'
        />

        {/* Central Pure White Medical Cross */}
        <rect x='74' y='48' width='12' height='36' rx='4' fill='#ffffff' />
        <rect x='62' y='60' width='36' height='12' rx='4' fill='#ffffff' />

        {/* Interlocking Golden Wedding Rings Floating Bottom */}
        <g transform='translate(60, 94)'>
          <circle cx='14' cy='14' r='12' stroke='url(#prelunaGoldRing)' strokeWidth='3.5' fill='none' />
          <circle cx='26' cy='14' r='12' stroke='url(#prelunaGoldRing)' strokeWidth='3.5' fill='none' />
          <circle cx='14' cy='14' r='14' stroke='#ffffff' strokeWidth='1' strokeDasharray='2 3' fill='none' />
        </g>

        {/* Sparkles of Hope and Blessings */}
        <path
          d='M132 40 L134 46 L140 48 L134 50 L132 56 L130 50 L124 48 L130 46 Z'
          fill='#fbbf24'
          className='animate-pulse'
        />
        <circle cx='26' cy='48' r='2.5' fill='#fcd34d' />
        <circle cx='138' cy='82' r='2' fill='#ffffff' />
      </svg>
    </div>
  );
};

export default OnboardingIllustration;
