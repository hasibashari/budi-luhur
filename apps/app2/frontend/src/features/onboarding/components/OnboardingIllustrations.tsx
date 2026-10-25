import React from 'react';

interface IllustrationProps {
  className?: string;
  size?: number;
}

/**
 * Slide 1: Pengingat Minum Pil Tepat Waktu (Pilluna 3D Capsule with Elegant Alarm Clock & Sparkles)
 */
export const ReminderIllustration: React.FC<IllustrationProps> = ({
  className = '',
  size = 150,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <div className='absolute inset-0 rounded-full bg-[#0D9488]/15 blur-2xl animate-pulse pointer-events-none' />
      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-xl overflow-visible'
      >
        <defs>
          <linearGradient id='remindPillTeal' x1='15' y1='10' x2='48' y2='48' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#2DD4BF' />
            <stop offset='50%' stopColor='#0D9488' />
            <stop offset='100%' stopColor='#0F766E' />
          </linearGradient>
          <linearGradient id='remindPillWhite' x1='24' y1='48' x2='48' y2='96' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#FFFFFF' />
            <stop offset='70%' stopColor='#F0FDFA' />
            <stop offset='100%' stopColor='#E2E8F0' />
          </linearGradient>
          <linearGradient id='remindClockFace' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#FFFFFF' />
            <stop offset='100%' stopColor='#F0FDFA' />
          </linearGradient>
          <linearGradient id='remindCoralAccent' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#FB923C' />
            <stop offset='100%' stopColor='#EA580C' />
          </linearGradient>
        </defs>

        {/* Soft Floor Shadow */}
        <ellipse cx='76' cy='144' rx='38' ry='8' fill='#0F172A' fillOpacity='0.10' />

        {/* 3D Capsule Pill Body (Left Side) */}
        <g transform='translate(60, 72) rotate(-22) translate(-22, -44)'>
          {/* Top Half: Medical Teal */}
          <path
            d='M 0,22 C 0,9.85 9.85,0 22,0 C 34.15,0 44,9.85 44,22 L 44,44 L 0,44 Z'
            fill='url(#remindPillTeal)'
          />
          {/* Bottom Half: Pearl White */}
          <path
            d='M 0,44 L 44,44 L 44,66 C 44,78.15 34.15,88 22,88 C 9.85,88 0,78.15 0,66 Z'
            fill='url(#remindPillWhite)'
            stroke='#E2E8F0'
            strokeWidth='1'
          />
          {/* Waist Joint Seam */}
          <line x1='0' y1='44' x2='44' y2='44' stroke='#0F766E' strokeWidth='1.5' strokeOpacity='0.3' />
          <line x1='0' y1='45' x2='44' y2='45' stroke='#FFFFFF' strokeWidth='1' strokeOpacity='0.8' />

          {/* Specular 3D Gloss Highlight */}
          <path d='M 5,14 C 5,8 9,5 14,5 L 14,44 L 5,44 Z' fill='#FFFFFF' fillOpacity='0.45' />
          <path d='M 5,44 L 14,44 L 14,74 C 9,74 5,70 5,64 Z' fill='#FFFFFF' fillOpacity='0.25' />

          {/* Medical Cross on Teal Half */}
          <rect x='19' y='14' width='6' height='14' rx='1.5' fill='#FFFFFF' fillOpacity='0.95' />
          <rect x='15' y='18' width='14' height='6' rx='1.5' fill='#FFFFFF' fillOpacity='0.95' />
        </g>

        {/* Floating Elegant Alarm Clock (Right Side) */}
        <g transform='translate(92, 72)'>
          {/* Clock Outer Rim & Shadow */}
          <circle cx='24' cy='24' r='24' fill='#FFFFFF' filter='drop-shadow(0 6px 14px rgba(13,148,136,0.22))' />
          <circle cx='24' cy='24' r='21' fill='url(#remindClockFace)' stroke='#0D9488' strokeWidth='2.5' />

          {/* Alarm Bells */}
          <ellipse cx='11' cy='8' rx='4.5' ry='3' transform='rotate(-30 11 8)' fill='#0D9488' />
          <ellipse cx='37' cy='8' rx='4.5' ry='3' transform='rotate(30 37 8)' fill='#0D9488' />

          {/* Clock Hands pointing to 20:00 (Daily Pill Time) */}
          <line x1='24' y1='24' x2='24' y2='14' stroke='#0F172A' strokeWidth='2.2' strokeLinecap='round' />
          <line x1='24' y1='24' x2='32' y2='24' stroke='#F97316' strokeWidth='2.2' strokeLinecap='round' />
          <circle cx='24' cy='24' r='2.5' fill='#F97316' />

          {/* Clock Ringing Wave Ripples */}
          <path d='M2 9 C-3 14 -3 22 2 27' stroke='#0D9488' strokeWidth='2' strokeLinecap='round' fill='none' />
          <path d='M46 9 C51 14 51 22 46 27' stroke='#0D9488' strokeWidth='2' strokeLinecap='round' fill='none' />
        </g>

        {/* Floating Sparkle Stars */}
        <path d='M134 26 L136 32 L142 34 L136 36 L134 42 L132 36 L126 34 L132 32 Z' fill='url(#remindCoralAccent)' />
        <circle cx='22' cy='54' r='2.5' fill='#14B8A6' />
        <circle cx='138' cy='118' r='2' fill='#0D9488' fillOpacity='0.5' />
      </svg>
    </div>
  );
};

/**
 * Slide 2: Kalender Blister & Status Siklus (Pilluna Blister Pack Strip Card)
 */
export const TrackingIllustration: React.FC<IllustrationProps> = ({
  className = '',
  size = 150,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <div className='absolute inset-0 rounded-full bg-[#0D9488]/15 blur-2xl animate-pulse pointer-events-none' />
      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-xl overflow-visible'
      >
        <defs>
          <linearGradient id='blisterCardGrad' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#FFFFFF' />
            <stop offset='60%' stopColor='#F8FAFC' />
            <stop offset='100%' stopColor='#F1F5F9' />
          </linearGradient>
          <linearGradient id='blisterHeaderGrad' x1='0' y1='0' x2='1' y2='0'>
            <stop offset='0%' stopColor='#0D9488' />
            <stop offset='100%' stopColor='#14B8A6' />
          </linearGradient>
          <linearGradient id='activePillGrad' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#2DD4BF' />
            <stop offset='100%' stopColor='#0D9488' />
          </linearGradient>
        </defs>

        {/* Soft Floor Shadow */}
        <ellipse cx='80' cy='144' rx='44' ry='8' fill='#0F172A' fillOpacity='0.10' />

        {/* Contraceptive Blister Pack Card (Centered Perspective) */}
        <g transform='translate(38, 28)'>
          {/* Foil Blister Pack Card Outer Shell */}
          <rect
            x='0'
            y='0'
            width='84'
            height='104'
            rx='16'
            fill='url(#blisterCardGrad)'
            stroke='#CCFBF1'
            strokeWidth='2'
            filter='drop-shadow(0 8px 20px rgba(13,148,136,0.18))'
          />

          {/* Blister Card Metallic Header Strip */}
          <rect x='0' y='0' width='84' height='24' rx='16' fill='url(#blisterHeaderGrad)' />
          <rect x='0' y='12' width='84' height='12' fill='url(#blisterHeaderGrad)' />

          {/* Header Brand Indicator */}
          <circle cx='14' cy='12' r='3' fill='#FFFFFF' />
          <rect x='22' y='10' width='32' height='4' rx='2' fill='#FFFFFF' fillOpacity='0.9' />

          {/* Active Pills Grid - Row 1 (Consumed Pills with Checkmarks) */}
          <circle cx='20' cy='38' r='6.5' fill='url(#activePillGrad)' />
          <circle cx='18.5' cy='36.5' r='2' fill='#FFFFFF' fillOpacity='0.6' />

          <circle cx='42' cy='38' r='6.5' fill='url(#activePillGrad)' />
          <circle cx='40.5' cy='36.5' r='2' fill='#FFFFFF' fillOpacity='0.6' />

          <circle cx='64' cy='38' r='6.5' fill='url(#activePillGrad)' />
          <circle cx='62.5' cy='36.5' r='2' fill='#FFFFFF' fillOpacity='0.6' />

          {/* Active Pills Grid - Row 2 (Today's Pill Highlighted) */}
          <circle cx='20' cy='56' r='6.5' fill='url(#activePillGrad)' />
          <circle cx='18.5' cy='54.5' r='2' fill='#FFFFFF' fillOpacity='0.6' />

          {/* Today's Target Pill (Golden Pulse Ring) */}
          <circle cx='42' cy='56' r='8.5' fill='none' stroke='#F97316' strokeWidth='2' strokeDasharray='2 2' />
          <circle cx='42' cy='56' r='6.5' fill='url(#activePillGrad)' />
          <circle cx='40.5' cy='54.5' r='2' fill='#FFFFFF' fillOpacity='0.8' />

          <circle cx='64' cy='56' r='6.5' fill='url(#activePillGrad)' />
          <circle cx='62.5' cy='54.5' r='2' fill='#FFFFFF' fillOpacity='0.6' />

          {/* Active Pills Grid - Row 3 */}
          <circle cx='20' cy='74' r='6.5' fill='url(#activePillGrad)' />
          <circle cx='42' cy='74' r='6.5' fill='url(#activePillGrad)' />
          <circle cx='64' cy='74' r='6.5' fill='url(#activePillGrad)' />

          {/* Placebo Pills Grid - Row 4 (Iron/Placebo Pilluna Slate) */}
          <circle cx='20' cy='90' r='5' fill='#94A3B8' />
          <circle cx='42' cy='90' r='5' fill='#94A3B8' />
          <circle cx='64' cy='90' r='5' fill='#94A3B8' />

          {/* Verified Success Badge floating in top right */}
          <circle cx='76' cy='12' r='8' fill='#FFFFFF' stroke='#0D9488' strokeWidth='2' />
          <path d='M72.5 12 L75 14.5 L79.5 9.5' stroke='#0D9488' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' fill='none' />
        </g>

        {/* Ambient Sparkles */}
        <path d='M134 32 L136 38 L142 40 L136 42 L134 48 L132 42 L126 40 L132 38 Z' fill='#F97316' />
        <circle cx='24' cy='46' r='2.5' fill='#0D9488' />
        <circle cx='136' cy='108' r='2' fill='#14B8A6' />
      </svg>
    </div>
  );
};

/**
 * Slide 3: Kesehatan Holistik & Panduan SADARI (Breast Health Ribbon & Heart Shield)
 */
export const BuddyIllustration: React.FC<IllustrationProps> = ({
  className = '',
  size = 150,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <div className='absolute inset-0 rounded-full bg-[#0D9488]/15 blur-2xl animate-pulse pointer-events-none' />
      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-xl overflow-visible'
      >
        <defs>
          <linearGradient id='ribbonTealGrad' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#2DD4BF' />
            <stop offset='100%' stopColor='#0D9488' />
          </linearGradient>
          <linearGradient id='ribbonRoseGrad' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#FB7185' />
            <stop offset='100%' stopColor='#E11D48' />
          </linearGradient>
          <linearGradient id='shieldGrad' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#FFFFFF' />
            <stop offset='100%' stopColor='#F0FDFA' />
          </linearGradient>
        </defs>

        {/* Floor Shadow */}
        <ellipse cx='80' cy='144' rx='40' ry='8' fill='#0F172A' fillOpacity='0.10' />

        {/* Center Health Shield */}
        <g transform='translate(42, 28)'>
          <path
            d='M38 0 C64 0 76 12 76 28 C76 60 38 82 38 82 C38 82 0 60 0 28 C0 12 12 0 38 0 Z'
            fill='url(#shieldGrad)'
            stroke='#CCFBF1'
            strokeWidth='2'
            filter='drop-shadow(0 8px 18px rgba(13,148,136,0.18))'
          />

          {/* Heart Beat Pulse Line */}
          <path
            d='M18 42 L28 42 L32 32 L38 52 L44 38 L48 42 L58 42'
            stroke='#0D9488'
            strokeWidth='3'
            strokeLinecap='round'
            strokeLinejoin='round'
            fill='none'
          />

          {/* Medical Plus Header */}
          <rect x='35' y='14' width='6' height='14' rx='2' fill='#F97316' />
          <rect x='31' y='18' width='14' height='6' rx='2' fill='#F97316' />
        </g>

        {/* Floating Women Health / SADARI Awareness Ribbon (Bottom Right) */}
        <g transform='translate(90, 78)'>
          <circle cx='22' cy='22' r='22' fill='#FFFFFF' filter='drop-shadow(0 6px 14px rgba(225,29,72,0.22))' />
          <circle cx='22' cy='22' r='19' fill='#FFF1F2' stroke='#FFE4E6' strokeWidth='2' />

          {/* Dual Tone Awareness Ribbon (Loop) */}
          <path
            d='M16 32 C18 25 22 17 22 12 C22 8 20 6 18 6 C15 6 14 9 14 12 C14 16 17 24 22 28 L28 32'
            stroke='url(#ribbonRoseGrad)'
            strokeWidth='3.5'
            strokeLinecap='round'
            fill='none'
          />
          <path
            d='M28 32 C26 25 22 17 22 12 C22 8 24 6 26 6 C29 6 30 9 30 12 C30 16 27 24 22 28 L16 32'
            stroke='url(#ribbonTealGrad)'
            strokeWidth='3.5'
            strokeLinecap='round'
            fill='none'
          />
          <circle cx='22' cy='12' r='2.5' fill='#E11D48' />
        </g>

        {/* Sparkles */}
        <path d='M26 36 L28 42 L34 44 L28 46 L26 52 L24 46 L18 44 L24 42 Z' fill='#0D9488' />
        <path d='M134 32 L136 38 L142 40 L136 42 L134 48 L132 42 L126 40 L132 38 Z' fill='#FB7185' />
        <circle cx='138' cy='78' r='2.5' fill='#F97316' />
      </svg>
    </div>
  );
};

export default ReminderIllustration;
