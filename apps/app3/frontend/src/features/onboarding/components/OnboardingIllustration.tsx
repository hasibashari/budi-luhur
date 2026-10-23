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
      {/* Soft Ruby Ambient Glow */}
      <div className='absolute inset-0 rounded-full bg-[#aa294d]/20 blur-2xl animate-pulse pointer-events-none' />

      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-2xl overflow-visible'
      >
        <defs>
          {/* Official TEMANI Ruby Gradient */}
          <linearGradient
            id='temaniShieldGrad'
            x1='30'
            y1='20'
            x2='130'
            y2='140'
            gradientUnits='userSpaceOnUse'
          >
            <stop offset='0%' stopColor='#cb4364' />
            <stop offset='50%' stopColor='#aa294d' />
            <stop offset='100%' stopColor='#8c0f39' />
          </linearGradient>

          {/* Golden Wedding Rings Gradient */}
          <linearGradient id='temaniGoldRing' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#fde68a' />
            <stop offset='45%' stopColor='#f59e0b' />
            <stop offset='100%' stopColor='#b45309' />
          </linearGradient>

          {/* Top-down Glass Gloss Inset */}
          <linearGradient
            id='temaniGloss'
            x1='40'
            y1='25'
            x2='80'
            y2='90'
            gradientUnits='userSpaceOnUse'
          >
            <stop offset='0%' stopColor='#ffffff' stopOpacity='0.55' />
            <stop offset='100%' stopColor='#ffffff' stopOpacity='0' />
          </linearGradient>
        </defs>

        {/* Soft Drop Shadow under Shield */}
        <ellipse cx='80' cy='146' rx='44' ry='8' fill='#400014' fillOpacity='0.18' />

        {/* Main Ruby Shield */}
        <path
          d='M80 18 L128 36 C128 88 106 126 80 144 C54 126 32 88 32 36 L80 18 Z'
          fill='url(#temaniShieldGrad)'
        />

        {/* Shield Glass Inset */}
        <path
          d='M80 26 L120 42 C120 82 102 116 80 132 C58 116 40 82 40 42 L80 26 Z'
          fill='url(#temaniGloss)'
        />

        {/* Crisp White Medical Cross */}
        <rect x='74' y='48' width='12' height='36' rx='4' fill='#ffffff' />
        <rect x='62' y='60' width='36' height='12' rx='4' fill='#ffffff' />

        {/* Interlocking Golden Wedding Rings */}
        <g transform='translate(60, 94)'>
          <circle
            cx='14'
            cy='14'
            r='12'
            stroke='url(#temaniGoldRing)'
            strokeWidth='3.5'
            fill='none'
          />
          <circle
            cx='26'
            cy='14'
            r='12'
            stroke='url(#temaniGoldRing)'
            strokeWidth='3.5'
            fill='none'
          />
          <circle
            cx='14'
            cy='14'
            r='14'
            stroke='#ffffff'
            strokeWidth='0.8'
            strokeDasharray='2 3'
            fill='none'
          />
        </g>

        {/* Sparkles of Hope and Blessings */}
        <path
          d='M132 40 L134 46 L140 48 L134 50 L132 56 L130 50 L124 48 L130 46 Z'
          fill='#fbbf24'
          className='animate-pulse'
        />
        <circle cx='26' cy='48' r='2.5' fill='#ffd9de' />
        <circle cx='138' cy='82' r='2' fill='#ffffff' />
      </svg>
    </div>
  );
};

export default OnboardingIllustration;
