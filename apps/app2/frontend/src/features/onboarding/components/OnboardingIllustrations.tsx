import React from 'react';

interface IllustrationProps {
  className?: string;
  size?: number;
}

/**
 * Slide 1: Pengingat Minum Pil Tepat Waktu (Pilluna Capsule with Clock & Sparkles)
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
      <div className='absolute inset-0 rounded-full bg-[#E94383]/15 blur-2xl animate-pulse pointer-events-none' />
      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-xl overflow-visible'
      >
        <defs>
          <linearGradient id='pillTopGrad1' x1='40' y1='25' x2='95' y2='80' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#F58CB4' />
            <stop offset='70%' stopColor='#E94383' />
            <stop offset='100%' stopColor='#D83272' />
          </linearGradient>
          <linearGradient id='pillBotGrad1' x1='40' y1='80' x2='95' y2='135' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#FFFFFF' />
            <stop offset='100%' stopColor='#FFF1F5' />
          </linearGradient>
          <linearGradient id='clockGrad1' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#FFFFFF' />
            <stop offset='100%' stopColor='#F0FDFA' />
          </linearGradient>
        </defs>

        {/* Soft Shadow */}
        <ellipse cx='72' cy='146' rx='34' ry='6' fill='#24354D' fillOpacity='0.12' />

        {/* Capsule Pill Body */}
        <g transform='rotate(-8 72 80)'>
          {/* Top Half of Capsule */}
          <path
            d='M44 80 L44 52 C44 34.3 58.3 20 76 20 C93.7 20 108 34.3 108 52 L108 80 Z'
            fill='url(#pillTopGrad1)'
          />
          {/* Bottom Half of Capsule */}
          <path
            d='M44 80 L44 108 C44 125.7 58.3 140 76 140 C93.7 140 108 125.7 108 108 L108 80 Z'
            fill='url(#pillBotGrad1)'
            stroke='#FCE7F3'
            strokeWidth='1.5'
          />
          {/* Capsule Center Joint Line */}
          <line x1='44' y1='80' x2='108' y2='80' stroke='#E94383' strokeWidth='1.5' strokeOpacity='0.4' />

          {/* Gloss Highlight */}
          <path
            d='M52 35 C52 35 50 60 50 80'
            stroke='#FFFFFF'
            strokeWidth='4'
            strokeLinecap='round'
            strokeOpacity='0.7'
          />

          {/* Cheerful Cute Face on Top Half */}
          <ellipse cx='64' cy='56' rx='4' ry='5.5' fill='#24354D' />
          <circle cx='62.5' cy='54' r='1.8' fill='#FFFFFF' />
          <ellipse cx='86' cy='56' rx='4' ry='5.5' fill='#24354D' />
          <circle cx='84.5' cy='54' r='1.8' fill='#FFFFFF' />

          {/* Blushing Cheeks */}
          <ellipse cx='55' cy='63' rx='4.5' ry='2.5' fill='#F58CB4' fillOpacity='0.9' />
          <ellipse cx='95' cy='63' rx='4.5' ry='2.5' fill='#F58CB4' fillOpacity='0.9' />

          {/* Smile */}
          <path d='M70 63 Q75 70 80 63' stroke='#24354D' strokeWidth='2.2' strokeLinecap='round' fill='none' />
        </g>

        {/* Floating Ringing Alarm Clock (Right Bottom) */}
        <g transform='translate(94, 86)'>
          {/* Outer glow ring */}
          <circle cx='22' cy='22' r='22' fill='#FFFFFF' filter='drop-shadow(0 4px 10px rgba(233,67,131,0.22))' />
          <circle cx='22' cy='22' r='19' fill='url(#clockGrad1)' stroke='#58AA96' strokeWidth='2.2' />

          {/* Clock Bells */}
          <ellipse cx='10' cy='8' rx='4' ry='2.5' transform='rotate(-30 10 8)' fill='#58AA96' />
          <ellipse cx='34' cy='8' rx='4' ry='2.5' transform='rotate(30 34 8)' fill='#58AA96' />

          {/* Clock Hands pointing to 20:00 (daily pill time) */}
          <line x1='22' y1='22' x2='22' y2='13' stroke='#24354D' strokeWidth='2' strokeLinecap='round' />
          <line x1='22' y1='22' x2='28' y2='22' stroke='#E94383' strokeWidth='2' strokeLinecap='round' />
          <circle cx='22' cy='22' r='2' fill='#E94383' />

          {/* Ring sound wave ripples */}
          <path d='M3 8 C-1 12 -1 18 3 22' stroke='#58AA96' strokeWidth='1.8' strokeLinecap='round' fill='none' />
          <path d='M41 8 C45 12 45 18 41 22' stroke='#58AA96' strokeWidth='1.8' strokeLinecap='round' fill='none' />
        </g>

        {/* Sparkles */}
        <path d='M126 30 L128 36 L134 38 L128 40 L126 46 L124 40 L118 38 L124 36 Z' fill='#E94383' />
        <circle cx='22' cy='62' r='2.5' fill='#58AA96' />
      </svg>
    </div>
  );
};

/**
 * Slide 2: Kalender & Laporan Kepatuhan (Pilluna with Contraceptive Calendar Card)
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
      <div className='absolute inset-0 rounded-full bg-[#58AA96]/15 blur-2xl animate-pulse pointer-events-none' />
      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-xl overflow-visible'
      >
        <defs>
          <linearGradient id='pillTopGrad2' x1='35' y1='25' x2='85' y2='80' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#F58CB4' />
            <stop offset='70%' stopColor='#E94383' />
            <stop offset='100%' stopColor='#D83272' />
          </linearGradient>
          <linearGradient id='pillBotGrad2' x1='35' y1='80' x2='85' y2='135' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#FFFFFF' />
            <stop offset='100%' stopColor='#FFF1F5' />
          </linearGradient>
          <linearGradient id='calCardGrad' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#FFFFFF' />
            <stop offset='100%' stopColor='#F9FAFB' />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx='65' cy='146' rx='34' ry='6' fill='#24354D' fillOpacity='0.12' />

        {/* Capsule Pill Mascot */}
        <g transform='rotate(-4 65 80)'>
          <path
            d='M38 80 L38 52 C38 34.3 52.3 20 70 20 C87.7 20 102 34.3 102 52 L102 80 Z'
            fill='url(#pillTopGrad2)'
          />
          <path
            d='M38 80 L38 108 C38 125.7 52.3 140 70 140 C87.7 140 102 125.7 102 108 L102 80 Z'
            fill='url(#pillBotGrad2)'
            stroke='#FCE7F3'
            strokeWidth='1.5'
          />
          <line x1='38' y1='80' x2='102' y2='80' stroke='#E94383' strokeWidth='1.5' strokeOpacity='0.4' />

          {/* Gloss */}
          <path d='M45 35 C45 35 44 60 44 80' stroke='#FFFFFF' strokeWidth='3.5' strokeLinecap='round' strokeOpacity='0.7' />

          {/* Wink Eyes */}
          <path d='M53 56 Q58 50 63 56' stroke='#24354D' strokeWidth='2.5' strokeLinecap='round' fill='none' />
          <ellipse cx='79' cy='55' rx='3.8' ry='5.2' fill='#24354D' />
          <circle cx='77.8' cy='53' r='1.6' fill='#FFFFFF' />

          {/* Cheeks */}
          <ellipse cx='48' cy='62' rx='4.2' ry='2.4' fill='#F58CB4' fillOpacity='0.9' />
          <ellipse cx='86' cy='62' rx='4.2' ry='2.4' fill='#F58CB4' fillOpacity='0.9' />

          {/* Happy smile */}
          <path d='M63 62 Q69 69 75 62' stroke='#24354D' strokeWidth='2.2' strokeLinecap='round' fill='none' />
        </g>

        {/* Floating Calendar & Report Card (Right Bottom) */}
        <g transform='translate(86, 74)'>
          <rect
            x='0'
            y='0'
            width='52'
            height='52'
            rx='12'
            fill='url(#calCardGrad)'
            stroke='#58AA96'
            strokeWidth='2'
            filter='drop-shadow(0 4px 12px rgba(88,170,150,0.22))'
          />

          {/* Card Top Header */}
          <rect x='0' y='0' width='52' height='14' rx='12' fill='#58AA96' />
          <rect x='0' y='8' width='52' height='6' fill='#58AA96' />
          <circle cx='12' cy='7' r='2' fill='#FFFFFF' />
          <circle cx='40' cy='7' r='2' fill='#FFFFFF' />

          {/* Calendar Dots Grid */}
          <circle cx='12' cy='22' r='3.5' fill='#58AA96' />
          <circle cx='26' cy='22' r='3.5' fill='#58AA96' />
          <circle cx='40' cy='22' r='3.5' fill='#58AA96' />

          <circle cx='12' cy='34' r='3.5' fill='#58AA96' />
          <circle cx='26' cy='34' r='3.5' fill='#58AA96' />
          <circle cx='40' cy='34' r='3.5' fill='#E94383' />

          <circle cx='12' cy='44' r='2.5' fill='#FCE7F3' />
          <circle cx='26' cy='44' r='2.5' fill='#FCE7F3' />
          <circle cx='40' cy='44' r='2.5' fill='#FCE7F3' />

          {/* Verified Check Badge */}
          <circle cx='46' cy='6' r='7' fill='#FFFFFF' stroke='#58AA96' strokeWidth='1.5' />
          <path d='M43 6 L45 8 L49 4' stroke='#58AA96' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' fill='none' />
        </g>

        {/* Sparkles */}
        <path d='M128 28 L129.5 33 L135 34.5 L129.5 36 L128 41 L126.5 36 L121 34.5 L126.5 33 Z' fill='#58AA96' />
        <circle cx='18' cy='52' r='2.5' fill='#F58CB4' />
      </svg>
    </div>
  );
};

/**
 * Slide 3: Catatan Kesehatan & Panduan SADARI (Pilluna with Health Shield & Ribbon)
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
      <div className='absolute inset-0 rounded-full bg-[#E94383]/15 blur-2xl animate-pulse pointer-events-none' />
      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-xl overflow-visible'
      >
        <defs>
          <linearGradient id='pillTopGrad3' x1='35' y1='25' x2='85' y2='80' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#F58CB4' />
            <stop offset='70%' stopColor='#E94383' />
            <stop offset='100%' stopColor='#D83272' />
          </linearGradient>
          <linearGradient id='pillBotGrad3' x1='35' y1='80' x2='85' y2='135' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#FFFFFF' />
            <stop offset='100%' stopColor='#FFF1F5' />
          </linearGradient>
          <linearGradient id='ribbonGrad' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#F58CB4' />
            <stop offset='100%' stopColor='#E94383' />
          </linearGradient>
        </defs>

        {/* Shadows */}
        <ellipse cx='72' cy='146' rx='34' ry='6' fill='#24354D' fillOpacity='0.12' />

        {/* Capsule Pill Mascot */}
        <g transform='translate(0, 0)'>
          <path
            d='M44 80 L44 52 C44 34.3 58.3 20 76 20 C93.7 20 108 34.3 108 52 L108 80 Z'
            fill='url(#pillTopGrad3)'
          />
          <path
            d='M44 80 L44 108 C44 125.7 58.3 140 76 140 C93.7 140 108 125.7 108 108 L108 80 Z'
            fill='url(#pillBotGrad3)'
            stroke='#FCE7F3'
            strokeWidth='1.5'
          />
          <line x1='44' y1='80' x2='108' y2='80' stroke='#E94383' strokeWidth='1.5' strokeOpacity='0.4' />

          {/* Gloss */}
          <path d='M52 35 C52 35 50 60 50 80' stroke='#FFFFFF' strokeWidth='3.5' strokeLinecap='round' strokeOpacity='0.7' />

          {/* Loving Cheerful Eyes */}
          <ellipse cx='64' cy='56' rx='4' ry='5.5' fill='#24354D' />
          <circle cx='62.5' cy='54' r='1.8' fill='#FFFFFF' />
          <ellipse cx='86' cy='56' rx='4' ry='5.5' fill='#24354D' />
          <circle cx='84.5' cy='54' r='1.8' fill='#FFFFFF' />

          {/* Cheeks */}
          <ellipse cx='55' cy='63' rx='4.5' ry='2.5' fill='#F58CB4' fillOpacity='0.9' />
          <ellipse cx='95' cy='63' rx='4.5' ry='2.5' fill='#F58CB4' fillOpacity='0.9' />

          {/* Smile */}
          <path d='M70 63 Q75 70 80 63' stroke='#24354D' strokeWidth='2.2' strokeLinecap='round' fill='none' />
        </g>

        {/* Floating Health & SADARI Ribbon Badge (Right Bottom) */}
        <g transform='translate(90, 80)'>
          {/* Circular Shield Badge */}
          <circle cx='22' cy='22' r='22' fill='#FFFFFF' filter='drop-shadow(0 4px 12px rgba(233,67,131,0.25))' />
          <circle cx='22' cy='22' r='19' fill='#FFF1F5' stroke='#FCE7F3' strokeWidth='2' />

          {/* Pink Ribbon for Women Health & SADARI */}
          <path
            d='M16 32 C18 25 22 17 22 12 C22 8 20 6 18 6 C15 6 14 9 14 12 C14 16 17 24 22 28 L28 32'
            stroke='url(#ribbonGrad)'
            strokeWidth='3.2'
            strokeLinecap='round'
            fill='none'
          />
          <path
            d='M28 32 C26 25 22 17 22 12 C22 8 24 6 26 6 C29 6 30 9 30 12 C30 16 27 24 22 28 L16 32'
            stroke='url(#ribbonGrad)'
            strokeWidth='3.2'
            strokeLinecap='round'
            fill='none'
          />
          <circle cx='22' cy='12' r='2' fill='#E94383' />
        </g>

        {/* Sparkles & Hearts */}
        <path d='M130 26 L131.5 31 L136 32.5 L131.5 34 L130 39 L128.5 34 L124 32.5 L128.5 31 Z' fill='#E94383' />
        <circle cx='20' cy='46' r='2.5' fill='#58AA96' />
      </svg>
    </div>
  );
};
