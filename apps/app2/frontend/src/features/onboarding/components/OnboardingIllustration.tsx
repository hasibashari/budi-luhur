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
      {/* Soft Ambient Glow */}
      <div className='absolute inset-0 rounded-full bg-[#0D9488]/20 blur-2xl animate-pulse pointer-events-none' />

      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-xl overflow-visible'
      >
        <defs>
          <linearGradient id='onboardingPillTeal' x1='20' y1='20' x2='90' y2='90' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#2DD4BF' />
            <stop offset='60%' stopColor='#0D9488' />
            <stop offset='100%' stopColor='#0F766E' />
          </linearGradient>

          <linearGradient id='onboardingPillWhite' x1='70' y1='70' x2='140' y2='140' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#FFFFFF' />
            <stop offset='100%' stopColor='#F0FDFA' />
          </linearGradient>

          <linearGradient id='onboardingPillGloss' x1='40' y1='30' x2='60' y2='70' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#FFFFFF' stopOpacity='0.8' />
            <stop offset='100%' stopColor='#FFFFFF' stopOpacity='0' />
          </linearGradient>

          <linearGradient id='onboardingCoralSparkle' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#FB923C' />
            <stop offset='100%' stopColor='#EA580C' />
          </linearGradient>
        </defs>

        <ellipse cx='80' cy='146' rx='44' ry='10' fill='#0D9488' fillOpacity='0.12' />

        <g transform='translate(80, 78) rotate(-28) translate(-80, -78)'>
          <path
            d='M44 80 C44 54 60 38 80 38 L80 118 C60 118 44 102 44 80 Z'
            fill='url(#onboardingPillTeal)'
          />

          <path
            d='M80 38 C100 38 116 54 116 80 C116 102 100 118 80 118 Z'
            fill='url(#onboardingPillWhite)'
            stroke='#FCE7F3'
            strokeWidth='1'
          />

          <line x1='80' y1='38' x2='80' y2='118' stroke='#F58CB4' strokeWidth='2' strokeOpacity='0.6' />

          <path
            d='M52 64 C56 50 68 44 80 44 C84 44 88 45 92 46 C80 48 64 54 58 66 Z'
            fill='url(#onboardingPillGloss)'
          />

          <ellipse cx='70' cy='72' rx='3.5' ry='5' fill='#24354D' />
          <circle cx='69' cy='70' r='1.5' fill='#FFFFFF' />

          <ellipse cx='90' cy='72' rx='3.5' ry='5' fill='#24354D' />
          <circle cx='89' cy='70' r='1.5' fill='#FFFFFF' />

          <ellipse cx='62' cy='78' rx='4.5' ry='2.5' fill='#F58CB4' fillOpacity='0.9' />
          <ellipse cx='98' cy='78' rx='4.5' ry='2.5' fill='#F58CB4' fillOpacity='0.9' />

          <path
            d='M75 78 Q80 84 85 78'
            stroke='#24354D'
            strokeWidth='2.2'
            strokeLinecap='round'
            fill='none'
          />

          <path
            d='M96 92 C96 90 98 88.5 100 88.5 C101.5 88.5 102.5 89.5 103 90.5 C103.5 89.5 104.5 88.5 106 88.5 C108 88.5 110 90 110 92 C110 95 106 98 103 100 C100 98 96 95 96 92 Z'
            fill='#E94383'
            fillOpacity='0.85'
          />
        </g>

        <path
          d='M132 40 L134 46 L140 48 L134 50 L132 56 L130 50 L124 48 L130 46 Z'
          fill='url(#onboardingTealSparkle)'
          className='animate-pulse'
        />

        <path
          d='M26 68 L27.5 72 L32 73.5 L27.5 75 L26 79 L24.5 75 L20 73.5 L24.5 72 Z'
          fill='#F58CB4'
          className='animate-pulse'
        />

        <circle cx='138' cy='74' r='2' fill='#F58CB4' />
        <circle cx='34' cy='46' r='2.5' fill='#58AA96' />
        <circle cx='122' cy='112' r='2' fill='#E94383' fillOpacity='0.5' />
      </svg>
    </div>
  );
};

export default OnboardingIllustration;
