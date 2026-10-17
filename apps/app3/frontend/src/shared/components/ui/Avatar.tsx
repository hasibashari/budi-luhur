import React, { useState } from 'react';
import { User } from 'lucide-react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | number;
export type AvatarShape = 'circle' | 'rounded';

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  alt?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  className?: string;
  ringClassName?: string;
  badge?: React.ReactNode;
}

const AVATAR_PALETTES = [
  'bg-emerald-600 text-white',
  'bg-teal-600 text-white',
  'bg-amber-600 text-white',
  'bg-emerald-700 text-white',
  'bg-slate-700 text-white',
  'bg-cyan-600 text-white',
  'bg-emerald-800 text-white',
  'bg-teal-700 text-white',
  'bg-amber-700 text-white',
  'bg-stone-700 text-white',
];

export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return '';

  const cleanName = name
    .replace(/(dr\.|drg\.|prof\.|apt\.|sp\.[a-z]+|s\.pd|s\.ked|m\.kes)/gi, '')
    .trim();

  const words = cleanName.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return (words[0][0] + words[1][0]).toUpperCase();
}

function getPaletteForName(name?: string | null): string {
  if (!name) return AVATAR_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

const SIZE_MAP: Record<string, { sizePx: number; containerClass: string; textClass: string; iconSize: number }> = {
  xs: { sizePx: 24, containerClass: 'w-6 h-6', textClass: 'text-[10px] font-bold', iconSize: 12 },
  sm: { sizePx: 32, containerClass: 'w-8 h-8', textClass: 'text-xs font-bold', iconSize: 15 },
  md: { sizePx: 40, containerClass: 'w-10 h-10', textClass: 'text-sm font-bold', iconSize: 18 },
  lg: { sizePx: 48, containerClass: 'w-12 h-12', textClass: 'text-base font-extrabold', iconSize: 22 },
  xl: { sizePx: 64, containerClass: 'w-16 h-16', textClass: 'text-xl font-extrabold', iconSize: 28 },
  '2xl': { sizePx: 96, containerClass: 'w-24 h-24', textClass: 'text-2xl font-black', iconSize: 36 },
  '3xl': { sizePx: 112, containerClass: 'w-28 h-28', textClass: 'text-3xl font-black', iconSize: 44 },
};

export function Avatar({
  src,
  name,
  alt,
  size = 'md',
  shape = 'circle',
  className = '',
  ringClassName = '',
  badge,
}: AvatarProps) {
  const [hasImageError, setHasImageError] = useState(false);

  const isPresetSize = typeof size === 'string' && size in SIZE_MAP;
  const config = isPresetSize ? SIZE_MAP[size as string] : SIZE_MAP.md;
  const sizePx = typeof size === 'number' ? size : config.sizePx;

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const initials = getInitials(name);
  const paletteClass = getPaletteForName(name);

  const hasValidImage = src && src.trim() !== '' && !hasImageError;

  return (
    <div className={`relative inline-flex shrink-0 select-none ${className}`}>
      <div
        style={!isPresetSize ? { width: sizePx, height: sizePx } : undefined}
        className={`relative overflow-hidden flex items-center justify-center font-bold tracking-wider shadow-2xs transition-transform ${shapeClass} ${
          isPresetSize ? config.containerClass : ''
        } ${ringClassName}`}
      >
        {hasValidImage ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className='w-full h-full object-cover'
            onError={() => setHasImageError(true)}
          />
        ) : initials ? (
          <div
            className={`w-full h-full flex items-center justify-center font-bold tracking-tight shadow-inner ${paletteClass} ${
              isPresetSize ? config.textClass : 'text-sm'
            }`}
          >
            {initials}
          </div>
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-600'>
            <User size={config.iconSize} />
          </div>
        )}
      </div>

      {badge && <div className='absolute bottom-0 right-0 z-10'>{badge}</div>}
    </div>
  );
}

export default Avatar;
