import React from 'react';

interface IllustrationProps {
  className?: string;
  size?: number;
}

/**
 * Slide 1: Imunisasi TT Calon Pengantin (Ruby Shield & Protection from Maternal/Neonatal Tetanus)
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
      <div className='absolute inset-0 rounded-full bg-[#aa294d]/15 blur-2xl animate-pulse pointer-events-none' />
      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-xl overflow-visible'
      >
        <defs>
          <linearGradient id='shieldGradOnboard' x1='20' y1='20' x2='140' y2='140' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#cb4364' />
            <stop offset='50%' stopColor='#aa294d' />
            <stop offset='100%' stopColor='#8c0f39' />
          </linearGradient>
          <linearGradient id='goldBadgeGradOnboard' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#fbbf24' />
            <stop offset='100%' stopColor='#d97706' />
          </linearGradient>
        </defs>

        {/* Soft Wine Shadow */}
        <ellipse cx='80' cy='144' rx='42' ry='7' fill='#400014' fillOpacity='0.15' />

        {/* Medical Protection Shield Body */}
        <path
          d='M80 18 L126 36 C126 84 106 122 80 140 C54 122 34 84 34 36 L80 18 Z'
          fill='url(#shieldGradOnboard)'
        />

        {/* Shield Inner Gloss Inset */}
        <path
          d='M80 26 L120 42 C120 80 102 114 80 130 C58 114 40 80 40 42 L80 26 Z'
          fill='#ffffff'
          fillOpacity='0.16'
        />

        {/* Pure White Medical Cross */}
        <rect x='74' y='46' width='12' height='36' rx='4' fill='#ffffff' />
        <rect x='62' y='58' width='36' height='12' rx='4' fill='#ffffff' />

        {/* Stylized Vaccine Syringe Badge (Right Bottom) */}
        <g transform='translate(92, 80)'>
          <circle cx='24' cy='24' r='24' fill='#ffffff' filter='drop-shadow(0 4px 12px rgba(140,15,57,0.22))' />
          <circle cx='24' cy='24' r='21' fill='#fff0f2' stroke='#ffd9de' strokeWidth='2' />

          {/* Syringe Needle & Body */}
          <path d='M30 14 L34 18 L22 30 L18 26 Z' fill='url(#goldBadgeGradOnboard)' />
          <line x1='18' y1='26' x2='12' y2='32' stroke='#aa294d' strokeWidth='2.5' strokeLinecap='round' />
          <line x1='12' y1='32' x2='9' y2='35' stroke='#64748b' strokeWidth='1.5' strokeLinecap='round' />
          <line x1='32' y1='12' x2='38' y2='6' stroke='#d97706' strokeWidth='2' strokeLinecap='round' />
          <circle cx='24' cy='24' r='2' fill='#aa294d' />
        </g>

        {/* Sparkles of Health */}
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
            <stop offset='100%' stopColor='#fafaf9' />
          </linearGradient>
          <linearGradient id='goldRingGradOnboard' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#fde68a' />
            <stop offset='50%' stopColor='#f59e0b' />
            <stop offset='100%' stopColor='#b45309' />
          </linearGradient>
          <linearGradient id='calHeaderGrad' x1='0' y1='0' x2='1' y2='0'>
            <stop offset='0%' stopColor='#aa294d' />
            <stop offset='100%' stopColor='#8c0f39' />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx='78' cy='144' rx='44' ry='7' fill='#400014' fillOpacity='0.15' />

        {/* Calendar Body Card */}
        <rect x='34' y='32' width='88' height='98' rx='18' fill='url(#calGrad)' stroke='#ffd9de' strokeWidth='1.5' />
        
        {/* Calendar Top Header in PRELUNA Ruby */}
        <path d='M34 46 C34 38.27 40.27 32 48 32 L108 32 C115.73 32 122 38.27 122 46 L122 58 L34 58 Z' fill='url(#calHeaderGrad)' />

        {/* Calendar Ring Binders */}
        <rect x='52' y='24' width='6' height='14' rx='3' fill='#400014' />
        <rect x='98' y='24' width='6' height='14' rx='3' fill='#400014' />

        {/* Calendar Dose Checklist Rows */}
        <g transform='translate(46, 68)'>
          {/* Row 1: TT1 Complete (Deep Sage Check) */}
          <circle cx='8' cy='8' r='6' fill='#2a6950' />
          <path d='M5 8 L7 10 L11 6' stroke='#ffffff' strokeWidth='1.5' strokeLinecap='round' />
          <rect x='20' y='5' width='42' height='6' rx='3' fill='#e2e8f0' />

          {/* Row 2: TT2 Complete (Deep Sage Check) */}
          <circle cx='8' cy='26' r='6' fill='#2a6950' />
          <path d='M5 26 L7 28 L11 24' stroke='#ffffff' strokeWidth='1.5' strokeLinecap='round' />
          <rect x='20' y='23' width='38' height='6' rx='3' fill='#e2e8f0' />

          {/* Row 3: TT3 Pending (Ruby outline) */}
          <circle cx='8' cy='44' r='6' fill='#fff0f2' stroke='#aa294d' strokeWidth='1.5' />
          <rect x='20' y='41' width='32' height='6' rx='3' fill='#ffd9de' />
        </g>

        {/* Interlocking Wedding Rings Badge (Right Bottom) */}
        <g transform='translate(90, 84)'>
          <circle cx='24' cy='24' r='24' fill='#ffffff' filter='drop-shadow(0 4px 12px rgba(180,83,9,0.25))' />
          <circle cx='24' cy='24' r='21' fill='#fffbeb' stroke='#fde68a' strokeWidth='2' />

          {/* Interlocking Golden Rings */}
          <circle cx='18' cy='24' r='9' stroke='url(#goldRingGradOnboard)' strokeWidth='2.8' fill='none' />
          <circle cx='28' cy='24' r='9' stroke='url(#goldRingGradOnboard)' strokeWidth='2.8' fill='none' />
          <path d='M22 17 L25 14 L27 16' stroke='#ffffff' strokeWidth='1.2' strokeLinecap='round' />
        </g>
      </svg>
    </div>
  );
};

/**
 * Slide 3: Kesiapan Fisik & Konsultasi Pranikah (Health Book & Luna Health Heart)
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
      <div className='absolute inset-0 rounded-full bg-[#2a6950]/15 blur-2xl animate-pulse pointer-events-none' />
      <svg
        viewBox='0 0 160 160'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='w-full h-full drop-shadow-xl overflow-visible'
      >
        <defs>
          <linearGradient id='bookCoverGradOnboard' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#aa294d' />
            <stop offset='100%' stopColor='#8c0f39' />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx='80' cy='144' rx='44' ry='7' fill='#400014' fillOpacity='0.15' />

        {/* Premarital Health Handbook */}
        <rect x='36' y='32' width='88' height='102' rx='16' fill='#ffffff' stroke='#ffd9de' strokeWidth='1.5' />
        {/* Book Spine */}
        <path d='M36 32 L48 32 L48 134 L36 134 Z' fill='url(#bookCoverGradOnboard)' />

        {/* Book Cover Emblem */}
        <circle cx='86' cy='74' r='22' fill='#fff0f2' stroke='#ffd9de' strokeWidth='2' />
        {/* Heart in center */}
        <path
          d='M86 66 C82 60 74 62 74 70 C74 78 86 86 86 86 C86 86 98 78 98 70 C98 62 90 60 86 66 Z'
          fill='#aa294d'
        />

        {/* Text Lines in Book */}
        <rect x='64' y='104' width='44' height='5' rx='2.5' fill='#e2e8f0' />
        <rect x='70' y='114' width='32' height='5' rx='2.5' fill='#ffd9de' />

        {/* Floating Chat / Consultation Bubble Badge (Right Bottom in Deep Sage) */}
        <g transform='translate(92, 82)'>
          <circle cx='24' cy='24' r='24' fill='#ffffff' filter='drop-shadow(0 4px 12px rgba(42,105,80,0.25))' />
          <circle cx='24' cy='24' r='21' fill='#ecfdf5' stroke='#aff1d0' strokeWidth='2' />

          {/* Stethoscope / Consultation Icon in Deep Sage */}
          <path
            d='M17 21 C17 27 31 27 31 21'
            stroke='#2a6950'
            strokeWidth='2.4'
            strokeLinecap='round'
            fill='none'
          />
          <circle cx='17' cy='20' r='2.2' fill='#2a6950' />
          <circle cx='31' cy='20' r='2.2' fill='#2a6950' />
          <path d='M24 25 L24 30 A3 3 0 0 1 21 33' stroke='#2a6950' strokeWidth='2' strokeLinecap='round' fill='none' />
        </g>
      </svg>
    </div>
  );
};

export default ReminderIllustration;
