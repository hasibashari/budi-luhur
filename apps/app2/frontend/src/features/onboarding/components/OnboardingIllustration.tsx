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
      {/* Soft Ambient Radial Glow */}
      <div className='absolute inset-0 rounded-full bg-[#0D9488]/20 blur-2xl animate-pulse pointer-events-none' />

      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-2xl overflow-visible'
      >
        <defs>
          {/* Medical Teal Gradient - Upper Half */}
          <linearGradient id='pillTealUpper' x1='15' y1='10' x2='48' y2='48' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#2DD4BF' />
            <stop offset='45%' stopColor='#0D9488' />
            <stop offset='100%' stopColor='#0F766E' />
          </linearGradient>

          {/* Pearl White Gradient - Lower Half */}
          <linearGradient id='pillPearlLower' x1='24' y1='48' x2='48' y2='96' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#FFFFFF' />
            <stop offset='65%' stopColor='#F0FDFA' />
            <stop offset='100%' stopColor='#E2E8F0' />
          </linearGradient>

          {/* Specular Gloss - Upper Highlight */}
          <linearGradient id='pillGlossUpper' x1='6' y1='8' x2='18' y2='48' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#FFFFFF' stopOpacity='0.85' />
            <stop offset='50%' stopColor='#FFFFFF' stopOpacity='0.35' />
            <stop offset='100%' stopColor='#FFFFFF' stopOpacity='0.0' />
          </linearGradient>

          {/* Specular Gloss - Lower Highlight */}
          <linearGradient id='pillGlossLower' x1='6' y1='48' x2='18' y2='88' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#FFFFFF' stopOpacity='0.5' />
            <stop offset='100%' stopColor='#FFFFFF' stopOpacity='0.05' />
          </linearGradient>

          {/* Coral Sparkle Accent Gradient */}
          <linearGradient id='pillCoralSparkle' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#FB923C' />
            <stop offset='100%' stopColor='#EA580C' />
          </linearGradient>

          {/* Teal Sparkle Accent Gradient */}
          <linearGradient id='pillTealSparkle' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#5EEAD4' />
            <stop offset='100%' stopColor='#0D9488' />
          </linearGradient>

          {/* Floor Shadow Radial Gradient */}
          <radialGradient id='pillFloorShadow' cx='50%' cy='50%' r='50%'>
            <stop offset='0%' stopColor='#0F172A' stopOpacity='0.20' />
            <stop offset='60%' stopColor='#0D9488' stopOpacity='0.12' />
            <stop offset='100%' stopColor='#0D9488' stopOpacity='0' />
          </radialGradient>
        </defs>

        {/* Soft Floating Shadow Beneath Pill */}
        <ellipse cx='80' cy='144' rx='42' ry='8' fill='url(#pillFloorShadow)' />

        {/* Diagonal Rotated 3D Pill Capsule Container */}
        <g transform='translate(80, 72) rotate(-35) translate(-24, -48)'>
          {/* Capsule Outer Shell Backdrop (Soft Edge Depth) */}
          <rect x='-1' y='-1' width='50' height='98' rx='25' fill='#0F766E' fillOpacity='0.15' />

          {/* 1. TOP HALF: Medical Teal Cap */}
          <path
            d='M 0,24 C 0,10.75 10.75,0 24,0 C 37.25,0 48,10.75 48,24 L 48,48 L 0,48 Z'
            fill='url(#pillTealUpper)'
          />

          {/* 2. BOTTOM HALF: Pearl White Body */}
          <path
            d='M 0,48 L 48,48 L 48,72 C 48,85.25 37.25,96 24,96 C 10.75,96 0,85.25 0,72 Z'
            fill='url(#pillPearlLower)'
            stroke='#E2E8F0'
            strokeWidth='1'
          />

          {/* 3. CAPSULE CENTER JOINT / WAIST SEAM */}
          <line x1='0' y1='48' x2='48' y2='48' stroke='#0F766E' strokeWidth='1.5' strokeOpacity='0.35' />
          <line x1='0' y1='49' x2='48' y2='49' stroke='#FFFFFF' strokeWidth='1' strokeOpacity='0.9' />

          {/* 4. SPECULAR GLOSS HIGHLIGHTS (Curved 3D Glass Surface) */}
          <path
            d='M 6,16 C 6,9 10,6 16,6 L 16,48 L 6,48 Z'
            fill='url(#pillGlossUpper)'
          />
          <path
            d='M 6,48 L 16,48 L 16,80 C 10,80 6,76 6,70 Z'
            fill='url(#pillGlossLower)'
          />

          {/* 5. MEDICAL CROSS EMBLEM ON TEAL HALF */}
          <g transform='translate(24, 24)'>
            {/* Soft subtle glow behind emblem */}
            <circle cx='0' cy='0' r='12' fill='#FFFFFF' fillOpacity='0.12' />
            {/* Vertical Bar */}
            <rect x='-3' y='-8' width='6' height='16' rx='2' fill='#FFFFFF' fillOpacity='0.95' />
            {/* Horizontal Bar */}
            <rect x='-8' y='-3' width='16' height='6' rx='2' fill='#FFFFFF' fillOpacity='0.95' />
          </g>
        </g>

        {/* SPARKLING ACCENT ELEMENTS (Brand Identity: Energy & Care) */}
        {/* Top Right Coral Sparkle */}
        <path
          d='M134 32 L136.5 40 L144.5 42.5 L136.5 45 L134 53 L131.5 45 L123.5 42.5 L131.5 40 Z'
          fill='url(#pillCoralSparkle)'
          className='animate-pulse'
        />

        {/* Bottom Left Teal Sparkle */}
        <path
          d='M26 88 L28 94 L34 96 L28 98 L26 104 L24 98 L18 96 L24 94 Z'
          fill='url(#pillTealSparkle)'
          className='animate-pulse'
        />

        {/* Ambient Halo Spheres */}
        <circle cx='138' cy='86' r='3' fill='#14B8A6' fillOpacity='0.75' />
        <circle cx='34' cy='42' r='2.5' fill='#FB923C' fillOpacity='0.85' />
        <circle cx='122' cy='118' r='2' fill='#0D9488' fillOpacity='0.5' />
      </svg>
    </div>
  );
};

export default OnboardingIllustration;
