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
      <div className='absolute inset-0 rounded-full bg-rose-400/25 blur-2xl animate-pulse pointer-events-none' />

      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-xl overflow-visible'
      >
        <defs>
          <linearGradient id='feDropGrad' x1='40' y1='20' x2='120' y2='150' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#fb7185' />
            <stop offset='50%' stopColor='#e11d48' />
            <stop offset='100%' stopColor='#be123c' />
          </linearGradient>

          <linearGradient id='feDropGloss' x1='60' y1='30' x2='80' y2='80' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#ffffff' stopOpacity='0.7' />
            <stop offset='100%' stopColor='#ffffff' stopOpacity='0' />
          </linearGradient>

          <linearGradient id='pillPink' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#fda4af' />
            <stop offset='100%' stopColor='#f43f5e' />
          </linearGradient>
          <linearGradient id='pillWhite' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#ffffff' />
            <stop offset='100%' stopColor='#f1f5f9' />
          </linearGradient>
        </defs>

        <ellipse cx='80' cy='148' rx='42' ry='8' fill='#e11d48' fillOpacity='0.15' />

        <path
          d='M80 18 C80 18 130 75 130 108 C130 135.6 107.6 148 80 148 C52.4 148 30 135.6 30 108 C30 75 80 18 80 18 Z'
          fill='url(#feDropGrad)'
        />

        <path
          d='M80 26 C80 26 50 68 45 98 C42 118 52 136 68 142 C54 136 44 122 46 102 C49 78 80 26 80 26 Z'
          fill='url(#feDropGloss)'
        />

        <ellipse cx='65' cy='96' rx='5.5' ry='7.5' fill='#1e293b' />
        <circle cx='63.5' cy='93.5' r='2.5' fill='#ffffff' />
        <circle cx='67' cy='99' r='1.2' fill='#ffffff' />

        <ellipse cx='95' cy='96' rx='5.5' ry='7.5' fill='#1e293b' />
        <circle cx='93.5' cy='93.5' r='2.5' fill='#ffffff' />
        <circle cx='97' cy='99' r='1.2' fill='#ffffff' />

        <ellipse cx='53' cy='105' rx='6' ry='3.5' fill='#ff8da1' fillOpacity='0.8' />
        <ellipse cx='107' cy='105' rx='6' ry='3.5' fill='#ff8da1' fillOpacity='0.8' />

        <path
          d='M72 106 Q80 115 88 106'
          stroke='#1e293b'
          strokeWidth='3'
          strokeLinecap='round'
          fill='none'
        />

        <g transform='translate(100, 110) rotate(-25) scale(0.9)'>
          <rect x='0' y='0' width='16' height='14' rx='7' fill='url(#pillPink)' />
          <rect x='14' y='0' width='16' height='14' rx='7' fill='url(#pillWhite)' stroke='#fecdd3' strokeWidth='0.5' />
          <line x1='15' y1='0' x2='15' y2='14' stroke='#e2e8f0' strokeWidth='1' />
          <text x='7' y='10' fill='#ffffff' fontSize='7' fontWeight='bold' fontFamily='sans-serif'>Fe</text>
        </g>

        <path
          d='M125 45 L127 52 L134 54 L127 56 L125 63 L123 56 L116 54 L123 52 Z'
          fill='#fbbf24'
          className='animate-pulse'
        />
        <path
          d='M32 60 L33.5 65 L38 66 L33.5 67 L32 72 L30.5 67 L26 66 L30.5 65 Z'
          fill='#f472b6'
          className='animate-pulse'
        />
        <circle cx='135' cy='85' r='2' fill='#fbcfe8' />
        <circle cx='28' cy='40' r='2.5' fill='#fef08a' />
      </svg>
    </div>
  );
};

export default SplashIllustration;
