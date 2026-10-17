import React from 'react';

interface IllustrationProps {
  className?: string;
  size?: number;
}

/**
 * Slide 1: Imunisasi TT Calon Pengantin (Shield & Vaccine Ampoule - Protection from Maternal/Neonatal Tetanus)
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
      <div className='absolute inset-0 rounded-full bg-emerald-500/15 blur-2xl animate-pulse pointer-events-none' />
      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-xl overflow-visible'
      >
        <defs>
          <linearGradient id='shieldGrad' x1='20' y1='20' x2='140' y2='140' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#10b981' />
            <stop offset='60%' stopColor='#059669' />
            <stop offset='100%' stopColor='#047857' />
          </linearGradient>
          <linearGradient id='goldBadgeGrad' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#fbbf24' />
            <stop offset='100%' stopColor='#d97706' />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx='80' cy='144' rx='42' ry='7' fill='#047857' fillOpacity='0.2' />

        {/* Medical Protection Shield Body */}
        <path
          d='M80 18 L126 36 C126 84 106 122 80 140 C54 122 34 84 34 36 L80 18 Z'
          fill='url(#shieldGrad)'
        />

        {/* Shield Inner Inset */}
        <path
          d='M80 26 L120 42 C120 80 102 114 80 130 C58 114 40 80 40 42 L80 26 Z'
          fill='#ffffff'
          fillOpacity='0.15'
        />

        {/* Golden Cross / Medical Emblem */}
        <rect x='74' y='46' width='12' height='36' rx='4' fill='#ffffff' />
        <rect x='62' y='58' width='36' height='12' rx='4' fill='#ffffff' />

        {/* Stylized Vaccine Syringe Overlay (Right Bottom) */}
        <g transform='translate(92, 80)'>
          {/* Circular Glow Container */}
          <circle cx='24' cy='24' r='24' fill='#ffffff' filter='drop-shadow(0 4px 12px rgba(5,150,105,0.25))' />
          <circle cx='24' cy='24' r='21' fill='#ecfdf5' stroke='#a7f3d0' strokeWidth='2' />

          {/* Syringe Needle & Body */}
          <path d='M30 14 L34 18 L22 30 L18 26 Z' fill='url(#goldBadgeGrad)' />
          <line x1='18' y1='26' x2='12' y2='32' stroke='#059669' strokeWidth='2.5' strokeLinecap='round' />
          <line x1='12' y1='32' x2='9' y2='35' stroke='#64748b' strokeWidth='1.5' strokeLinecap='round' />
          <line x1='32' y1='12' x2='38' y2='6' stroke='#d97706' strokeWidth='2' strokeLinecap='round' />
          <circle cx='24' cy='24' r='2' fill='#059669' />
        </g>

        {/* Sparkles of Purity */}
        <circle cx='38' cy='32' r='2' fill='#fbbf24' />
        <circle cx='128' cy='28' r='2.5' fill='#fbbf24' />
        <circle cx='28' cy='78' r='1.8' fill='#ffffff' />
      </svg>
    </div>
  );
};

/**
 * Slide 2: Jadwal & Riwayat Imunisasi TT Catin (Calendar, Wedding Rings & 5-Dose Steps)
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
      <div className='absolute inset-0 rounded-full bg-amber-500/15 blur-2xl animate-pulse pointer-events-none' />
      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-xl overflow-visible'
      >
        <defs>
          <linearGradient id='calGrad' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#ffffff' />
            <stop offset='100%' stopColor='#f8fafc' />
          </linearGradient>
          <linearGradient id='goldRingGrad' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#fcd34d' />
            <stop offset='50%' stopColor='#f59e0b' />
            <stop offset='100%' stopColor='#d97706' />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx='78' cy='144' rx='44' ry='7' fill='#d97706' fillOpacity='0.18' />

        {/* Calendar Body Card */}
        <rect x='34' y='32' width='88' height='98' rx='18' fill='url(#calGrad)' stroke='#e2e8f0' strokeWidth='2' />
        {/* Calendar Top Banner */}
        <path d='M34 46 C34 38.27 40.27 32 48 32 L108 32 C115.73 32 122 38.27 122 46 L122 58 L34 58 Z' fill='#059669' />

        {/* Calendar Ring Binders */}
        <rect x='52' y='24' width='6' height='14' rx='3' fill='#047857' />
        <rect x='98' y='24' width='6' height='14' rx='3' fill='#047857' />

        {/* Calendar Dose Checklist Rows */}
        <g transform='translate(46, 68)'>
          {/* Row 1: TT1 */}
          <circle cx='8' cy='8' r='6' fill='#059669' />
          <path d='M5 8 L7 10 L11 6' stroke='#ffffff' strokeWidth='1.5' strokeLinecap='round' />
          <rect x='20' y='5' width='42' height='6' rx='3' fill='#cbd5e1' />

          {/* Row 2: TT2 */}
          <circle cx='8' cy='26' r='6' fill='#059669' />
          <path d='M5 26 L7 28 L11 24' stroke='#ffffff' strokeWidth='1.5' strokeLinecap='round' />
          <rect x='20' y='23' width='38' height='6' rx='3' fill='#cbd5e1' />

          {/* Row 3: TT3 Pending */}
          <circle cx='8' cy='44' r='6' fill='#ecfdf5' stroke='#059669' strokeWidth='1.5' />
          <rect x='20' y='41' width='32' height='6' rx='3' fill='#e2e8f0' />
        </g>

        {/* Interlocking Wedding Rings Badge (Right Bottom) */}
        <g transform='translate(90, 84)'>
          <circle cx='24' cy='24' r='24' fill='#ffffff' filter='drop-shadow(0 4px 12px rgba(217,119,6,0.25))' />
          <circle cx='24' cy='24' r='21' fill='#fffbeb' stroke='#fde68a' strokeWidth='2' />

          {/* Interlocking Golden Rings */}
          <circle cx='18' cy='24' r='9' stroke='url(#goldRingGrad)' strokeWidth='2.8' fill='none' />
          <circle cx='28' cy='24' r='9' stroke='url(#goldRingGrad)' strokeWidth='2.8' fill='none' />
          <path d='M22 17 L25 14 L27 16' stroke='#ffffff' strokeWidth='1.2' strokeLinecap='round' />
        </g>
      </svg>
    </div>
  );
};

/**
 * Slide 3: Kesiapan Fisik & Konsultasi Pranikah (Health Book, Stethoscope & Consultation Heart)
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
      <div className='absolute inset-0 rounded-full bg-teal-500/15 blur-2xl animate-pulse pointer-events-none' />
      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-xl overflow-visible'
      >
        <defs>
          <linearGradient id='bookCoverGrad' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#0d9488' />
            <stop offset='100%' stopColor='#0f766e' />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx='80' cy='144' rx='44' ry='7' fill='#0f766e' fillOpacity='0.2' />

        {/* Premarital Health Handbook */}
        <rect x='36' y='32' width='88' height='102' rx='16' fill='#ffffff' stroke='#e2e8f0' strokeWidth='2' />
        {/* Book Spine */}
        <path d='M36 32 L48 32 L48 134 L36 134 Z' fill='url(#bookCoverGrad)' />

        {/* Book Cover Emblem */}
        <circle cx='86' cy='74' r='22' fill='#f0fdfa' stroke='#ccfbf1' strokeWidth='2' />
        {/* Heart & Ribbon in center */}
        <path
          d='M86 66 C82 60 74 62 74 70 C74 78 86 86 86 86 C86 86 98 78 98 70 C98 62 90 60 86 66 Z'
          fill='#059669'
        />

        {/* Text Lines in Book */}
        <rect x='64' y='104' width='44' height='5' rx='2.5' fill='#cbd5e1' />
        <rect x='70' y='114' width='32' height='5' rx='2.5' fill='#e2e8f0' />

        {/* Floating Chat / Consultation Bubble Badge (Right Bottom) */}
        <g transform='translate(92, 82)'>
          <circle cx='24' cy='24' r='24' fill='#ffffff' filter='drop-shadow(0 4px 12px rgba(13,148,136,0.25))' />
          <circle cx='24' cy='24' r='21' fill='#f0fdfa' stroke='#99f6e4' strokeWidth='2' />

          {/* Stethoscope / AI Heart */}
          <path
            d='M17 21 C17 27 31 27 31 21'
            stroke='#0d9488'
            strokeWidth='2.4'
            strokeLinecap='round'
            fill='none'
          />
          <circle cx='17' cy='20' r='2.2' fill='#0d9488' />
          <circle cx='31' cy='20' r='2.2' fill='#0d9488' />
          <path d='M24 25 L24 30 A3 3 0 0 1 21 33' stroke='#0d9488' strokeWidth='2' strokeLinecap='round' fill='none' />
        </g>
      </svg>
    </div>
  );
};
