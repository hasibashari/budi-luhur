import React from 'react';

interface IllustrationProps {
  className?: string;
  size?: number;
}

/**
 * Slide 1: Pengingat Minum TTD (Fe-Drop with Clock / Alarm / Calendar)
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
      <div className='absolute inset-0 rounded-full bg-rose-400/20 blur-2xl animate-pulse pointer-events-none' />
      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-xl overflow-visible'
      >
        <defs>
          <linearGradient id='feReminderGrad' x1='40' y1='20' x2='120' y2='150' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#fb7185' />
            <stop offset='60%' stopColor='#e11d48' />
            <stop offset='100%' stopColor='#be123c' />
          </linearGradient>
          <linearGradient id='feReminderGloss' x1='60' y1='30' x2='80' y2='80' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#ffffff' stopOpacity='0.65' />
            <stop offset='100%' stopColor='#ffffff' stopOpacity='0' />
          </linearGradient>
          <linearGradient id='clockGrad' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#ffffff' />
            <stop offset='100%' stopColor='#f1f5f9' />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx='76' cy='146' rx='38' ry='7' fill='#e11d48' fillOpacity='0.18' />

        {/* Mascot Body */}
        <path
          d='M76 22 C76 22 122 72 122 104 C122 130 101.4 146 76 146 C50.6 146 30 130 30 104 C30 72 76 22 76 22 Z'
          fill='url(#feReminderGrad)'
        />

        {/* Gloss highlight */}
        <path
          d='M76 30 C76 30 48 70 44 98 C41 116 50 132 64 140 C52 134 43 120 45 102 C47 78 76 30 76 30 Z'
          fill='url(#feReminderGloss)'
        />

        {/* Cheerful Eyes */}
        <ellipse cx='63' cy='92' rx='5' ry='7' fill='#1e293b' />
        <circle cx='61.5' cy='89.5' r='2.2' fill='#ffffff' />
        <circle cx='65' cy='95' r='1' fill='#ffffff' />

        <ellipse cx='89' cy='92' rx='5' ry='7' fill='#1e293b' />
        <circle cx='87.5' cy='89.5' r='2.2' fill='#ffffff' />
        <circle cx='91' cy='95' r='1' fill='#ffffff' />

        {/* Cheeks */}
        <ellipse cx='52' cy='100' rx='5.5' ry='3' fill='#ff8da1' fillOpacity='0.85' />
        <ellipse cx='100' cy='100' rx='5.5' ry='3' fill='#ff8da1' fillOpacity='0.85' />

        {/* Big Happy Smile */}
        <path
          d='M69 101 Q76 110 83 101'
          stroke='#1e293b'
          strokeWidth='2.8'
          strokeLinecap='round'
          fill='none'
        />

        {/* Floating Ringing Alarm Clock (Right Bottom) */}
        <g transform='translate(96, 88)'>
          {/* Outer glow ring */}
          <circle cx='22' cy='22' r='22' fill='#ffffff' filter='drop-shadow(0 4px 10px rgba(225,29,72,0.25))' />
          <circle cx='22' cy='22' r='19' fill='url(#clockGrad)' stroke='#fda4af' strokeWidth='2.5' />

          {/* Clock Bells */}
          <ellipse cx='10' cy='8' rx='4' ry='2.5' transform='rotate(-30 10 8)' fill='#fb7185' />
          <ellipse cx='34' cy='8' rx='4' ry='2.5' transform='rotate(30 34 8)' fill='#fb7185' />

          {/* Clock Hands */}
          <line x1='22' y1='22' x2='22' y2='13' stroke='#e11d48' strokeWidth='2' strokeLinecap='round' />
          <line x1='22' y1='22' x2='28' y2='22' stroke='#e11d48' strokeWidth='2' strokeLinecap='round' />
          <circle cx='22' cy='22' r='2' fill='#be123c' />

          {/* Ring sound wave ripples */}
          <path d='M3 8 C-1 12 -1 18 3 22' stroke='#fb7185' strokeWidth='1.8' strokeLinecap='round' fill='none' />
          <path d='M41 8 C45 12 45 18 41 22' stroke='#fb7185' strokeWidth='1.8' strokeLinecap='round' fill='none' />
        </g>

        {/* Sparkles */}
        <path d='M126 32 L128 38 L134 40 L128 42 L126 48 L124 42 L118 40 L124 38 Z' fill='#fbbf24' />
        <circle cx='24' cy='68' r='2.5' fill='#f472b6' />
      </svg>
    </div>
  );
};

/**
 * Slide 2: Pantau Kepatuhan & Hb (Fe-Drop with Health Chart & Shield)
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
      <div className='absolute inset-0 rounded-full bg-emerald-400/20 blur-2xl animate-pulse pointer-events-none' />
      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-xl overflow-visible'
      >
        <defs>
          <linearGradient id='feTrackGrad' x1='40' y1='20' x2='120' y2='150' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#fb7185' />
            <stop offset='60%' stopColor='#e11d48' />
            <stop offset='100%' stopColor='#be123c' />
          </linearGradient>
          <linearGradient id='feTrackGloss' x1='60' y1='30' x2='80' y2='80' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#ffffff' stopOpacity='0.65' />
            <stop offset='100%' stopColor='#ffffff' stopOpacity='0' />
          </linearGradient>
          <linearGradient id='cardGrad' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#ffffff' />
            <stop offset='100%' stopColor='#f8fafc' />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx='72' cy='146' rx='38' ry='7' fill='#e11d48' fillOpacity='0.18' />

        {/* Mascot Body */}
        <path
          d='M72 22 C72 22 118 72 118 104 C118 130 97.4 146 72 146 C46.6 146 26 130 26 104 C26 72 72 22 72 22 Z'
          fill='url(#feTrackGrad)'
        />

        {/* Gloss highlight */}
        <path
          d='M72 30 C72 30 44 70 40 98 C37 116 46 132 60 140 C48 134 39 120 41 102 C43 78 72 30 72 30 Z'
          fill='url(#feTrackGloss)'
        />

        {/* Wink / Proud Cheerful Eyes */}
        {/* Left eye happy arch */}
        <path d='M54 92 Q60 85 66 92' stroke='#1e293b' strokeWidth='2.8' strokeLinecap='round' fill='none' />
        {/* Right eye sparkling */}
        <ellipse cx='84' cy='91' rx='5' ry='6.5' fill='#1e293b' />
        <circle cx='82.5' cy='88.5' r='2' fill='#ffffff' />
        <circle cx='85.5' cy='93.5' r='1' fill='#ffffff' />

        {/* Cheeks */}
        <ellipse cx='48' cy='99' rx='5' ry='3' fill='#ff8da1' fillOpacity='0.85' />
        <ellipse cx='93' cy='99' rx='5' ry='3' fill='#ff8da1' fillOpacity='0.85' />

        {/* Confident Smile */}
        <path
          d='M65 101 Q72 109 79 101'
          stroke='#1e293b'
          strokeWidth='2.8'
          strokeLinecap='round'
          fill='none'
        />

        {/* Floating Health Card / Chart Badge (Right Bottom) */}
        <g transform='translate(88, 80)'>
          {/* Card background */}
          <rect x='0' y='0' width='48' height='46' rx='12' fill='url(#cardGrad)' stroke='#a7f3d0' strokeWidth='2' filter='drop-shadow(0 4px 12px rgba(16,185,129,0.22))' />

          {/* Mini Chart Bars */}
          <rect x='8' y='26' width='6' height='12' rx='3' fill='#cbd5e1' />
          <rect x='17' y='18' width='6' height='20' rx='3' fill='#6ee7b7' />
          <rect x='26' y='12' width='6' height='26' rx='3' fill='#10b981' />
          <rect x='35' y='8' width='6' height='30' rx='3' fill='#059669' />

          {/* Upward Trend Line */}
          <path d='M10 24 L20 16 L29 10 L38 6' stroke='#047857' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' fill='none' />

          {/* Verified Checkmark Shield (Top Right of Card) */}
          <circle cx='40' cy='6' r='8' fill='#10b981' stroke='#ffffff' strokeWidth='2' />
          <path d='M37 6 L39 8 L44 3.5' stroke='#ffffff' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' fill='none' />
        </g>

        {/* Sparkles */}
        <path d='M126 30 L127.5 35 L133 36.5 L127.5 38 L126 43 L124.5 38 L119 36.5 L124.5 35 Z' fill='#34d399' />
        <circle cx='20' cy='55' r='2.5' fill='#fbcfe8' />
      </svg>
    </div>
  );
};

/**
 * Slide 3: Komunitas Sahabat & Streak Sehat (Two Fe-Drops Giving High Five)
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
      <div className='absolute inset-0 rounded-full bg-amber-400/20 blur-2xl animate-pulse pointer-events-none' />
      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-xl overflow-visible'
      >
        <defs>
          {/* Main Droplet */}
          <linearGradient id='feBuddyGrad1' x1='30' y1='25' x2='90' y2='140' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#fb7185' />
            <stop offset='60%' stopColor='#e11d48' />
            <stop offset='100%' stopColor='#be123c' />
          </linearGradient>
          {/* Friend Droplet (Warm Orange / Coral) */}
          <linearGradient id='feBuddyGrad2' x1='70' y1='40' x2='130' y2='140' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#fbcfe8' />
            <stop offset='60%' stopColor='#f43f5e' />
            <stop offset='100%' stopColor='#e11d48' />
          </linearGradient>
          {/* Flame Gradient */}
          <linearGradient id='flameGrad' x1='0' y1='1' x2='0' y2='0'>
            <stop offset='0%' stopColor='#ef4444' />
            <stop offset='50%' stopColor='#f59e0b' />
            <stop offset='100%' stopColor='#fef08a' />
          </linearGradient>
        </defs>

        {/* Shadows */}
        <ellipse cx='56' cy='144' rx='28' ry='6' fill='#e11d48' fillOpacity='0.16' />
        <ellipse cx='106' cy='144' rx='26' ry='6' fill='#e11d48' fillOpacity='0.16' />

        {/* Friend Droplet (Right Side, slightly smaller) */}
        <path
          d='M106 42 C106 42 142 80 142 108 C142 128 126 142 106 142 C86 142 70 128 70 108 C70 80 106 42 106 42 Z'
          fill='url(#feBuddyGrad2)'
        />

        {/* Friend Eyes */}
        <ellipse cx='98' cy='98' rx='4' ry='5.5' fill='#1e293b' />
        <circle cx='96.8' cy='96' r='1.8' fill='#ffffff' />
        <ellipse cx='118' cy='98' rx='4' ry='5.5' fill='#1e293b' />
        <circle cx='116.8' cy='96' r='1.8' fill='#ffffff' />
        <ellipse cx='90' cy='104' rx='4.5' ry='2.5' fill='#ff8da1' fillOpacity='0.8' />
        <ellipse cx='126' cy='104' rx='4.5' ry='2.5' fill='#ff8da1' fillOpacity='0.8' />
        <path d='M103 105 Q108 112 113 105' stroke='#1e293b' strokeWidth='2.2' strokeLinecap='round' fill='none' />

        {/* Main Droplet (Left Side, in front) */}
        <path
          d='M56 24 C56 24 96 68 96 98 C96 124 78 140 56 140 C34 140 16 124 16 98 C16 68 56 24 56 24 Z'
          fill='url(#feBuddyGrad1)'
        />

        {/* Main Droplet Eyes */}
        <ellipse cx='45' cy='88' rx='4.5' ry='6' fill='#1e293b' />
        <circle cx='43.8' cy='86' r='1.8' fill='#ffffff' />
        <ellipse cx='67' cy='88' rx='4.5' ry='6' fill='#1e293b' />
        <circle cx='65.8' cy='86' r='1.8' fill='#ffffff' />
        <ellipse cx='36' cy='94' rx='4.5' ry='2.5' fill='#ff8da1' fillOpacity='0.8' />
        <ellipse cx='76' cy='94' rx='4.5' ry='2.5' fill='#ff8da1' fillOpacity='0.8' />
        <path d='M51 96 Q56 104 61 96' stroke='#1e293b' strokeWidth='2.5' strokeLinecap='round' fill='none' />

        {/* Glowing Streak Flame between them (Top Center) */}
        <g transform='translate(66, 26) scale(0.9)'>
          {/* Flame aura */}
          <circle cx='18' cy='22' r='20' fill='#fef3c7' fillOpacity='0.7' filter='drop-shadow(0 2px 8px rgba(245,158,11,0.4))' />
          {/* Outer flame */}
          <path
            d='M18 2 C18 2 28 14 28 24 C28 31 23.5 36 18 36 C12.5 36 8 31 8 24 C8 17 14 10 18 2 Z'
            fill='url(#flameGrad)'
          />
          {/* Inner core flame */}
          <path
            d='M18 16 C18 16 23 23 23 27 C23 30.5 20.5 33 18 33 C15.5 33 13 30.5 13 27 C13 23 16 19 18 16 Z'
            fill='#ffffff'
          />
        </g>

        {/* Sparkles & Hearts */}
        <path d='M138 28 L139.5 33 L144 34 L139.5 35 L138 40 L136.5 35 L132 34 L136.5 33 Z' fill='#f59e0b' />
        <circle cx='18' cy='48' r='2.5' fill='#f472b6' />
      </svg>
    </div>
  );
};
