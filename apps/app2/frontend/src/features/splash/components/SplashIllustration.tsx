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
      {/* Soft Ambient Glow */}
      <div className='absolute inset-0 rounded-full bg-[#0D9488]/20 blur-2xl animate-pulse pointer-events-none' />

      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-xl overflow-visible'
      >
        <defs>
          {/* Main Teal Capsule Gradient */}
          <linearGradient id='pillunaTeal' x1='20' y1='20' x2='90' y2='90' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#2DD4BF' />
            <stop offset='60%' stopColor='#0D9488' />
            <stop offset='100%' stopColor='#0F766E' />
          </linearGradient>

          {/* Clean White Capsule Half Gradient */}
          <linearGradient id='pillunaWhite' x1='70' y1='70' x2='140' y2='140' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#FFFFFF' />
            <stop offset='100%' stopColor='#F0FDFA' />
          </linearGradient>

          {/* Capsule Gloss / Highlight */}
          <linearGradient id='pillunaGloss' x1='40' y1='30' x2='60' y2='70' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#FFFFFF' stopOpacity='0.8' />
            <stop offset='100%' stopColor='#FFFFFF' stopOpacity='0' />
          </linearGradient>

          {/* Warm Coral Sparkle Gradient */}
          <linearGradient id='coralSparkle' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#FB923C' />
            <stop offset='100%' stopColor='#EA580C' />
          </linearGradient>
        </defs>

        {/* Soft shadow below mascot */}
        <ellipse cx='80' cy='146' rx='44' ry='10' fill='#0D9488' fillOpacity='0.12' />

        {/* Diagonal Rotated Capsule Mascot Container */}
        <g transform='translate(80, 78) rotate(-28) translate(-80, -78)'>
          {/* Capsule Left/Top Half: Medical Teal */}
          <path
            d='M44 80 C44 54 60 38 80 38 L80 118 C60 118 44 102 44 80 Z'
            fill='url(#pillunaTeal)'
          />

          {/* Capsule Right/Bottom Half: Pure White with Soft Slate Border */}
          <path
            d='M80 38 C100 38 116 54 116 80 C116 102 100 118 80 118 Z'
            fill='url(#pillunaWhite)'
            stroke='#E2E8F0'
            strokeWidth='1'
          />

          {/* Dividing Ring */}
          <line x1='80' y1='38' x2='80' y2='118' stroke='#CCFBF1' strokeWidth='2' strokeOpacity='0.8' />

          {/* Curved Glossy Highlight on Top */}
          <path
            d='M52 64 C56 50 68 44 80 44 C84 44 88 45 92 46 C80 48 64 54 58 66 Z'
            fill='url(#pillunaGloss)'
          />

          {/* Mascot Eyes */}
          <ellipse cx='70' cy='72' rx='3.5' ry='5' fill='#0F172A' />
          <circle cx='69' cy='70' r='1.5' fill='#FFFFFF' />

          <ellipse cx='90' cy='72' rx='3.5' ry='5' fill='#0F172A' />
          <circle cx='89' cy='70' r='1.5' fill='#FFFFFF' />

          {/* Mascot Cheeks: Warm Coral Blush */}
          <ellipse cx='62' cy='78' rx='4.5' ry='2.5' fill='#FED7AA' fillOpacity='0.9' />
          <ellipse cx='98' cy='78' rx='4.5' ry='2.5' fill='#FED7AA' fillOpacity='0.9' />

          {/* Mascot Smile */}
          <path
            d='M75 78 Q80 84 85 78'
            stroke='#0F172A'
            strokeWidth='2.2'
            strokeLinecap='round'
            fill='none'
          />

          {/* Mini Cute Protection Cross/Shield in White Half */}
          <circle cx='103' cy='94' r='6' fill='#0D9488' fillOpacity='0.15' />
          <path
            d='M103 91 L103 97 M100 94 L106 94'
            stroke='#0D9488'
            strokeWidth='1.75'
            strokeLinecap='round'
          />
        </g>

        {/* Ambient Sparkles around mascot */}
        {/* Top-Right Coral Sparkle */}
        <path
          d='M132 40 L134 46 L140 48 L134 50 L132 56 L130 50 L124 48 L130 46 Z'
          fill='url(#coralSparkle)'
          className='animate-pulse'
        />

        {/* Bottom-Left Teal Sparkle */}
        <path
          d='M26 68 L27.5 72 L32 73.5 L27.5 75 L26 79 L24.5 75 L20 73.5 L24.5 72 Z'
          fill='#14B8A6'
          className='animate-pulse'
        />

        {/* Small soft dot sparkles */}
        <circle cx='138' cy='74' r='2' fill='#F97316' />
        <circle cx='34' cy='46' r='2.5' fill='#0D9488' />
        <circle cx='122' cy='112' r='2' fill='#0D9488' fillOpacity='0.5' />
      </svg>
    </div>
  );
};

export default SplashIllustration;
