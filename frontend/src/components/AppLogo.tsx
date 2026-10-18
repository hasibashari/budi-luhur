import React from 'react';

interface AppLogoProps {
  type: 'femory' | 'pilluna' | 'preluna';
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ type, className = '', size = 48 }) => {
  if (type === 'femory') {
    return (
      <div
        className={`relative rounded-xl overflow-hidden shadow-sm shrink-0 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src='/images/apps/femory-logo.svg'
          alt='Logo FEMORY'
          className='w-full h-full object-contain'
          onError={e => {
            // Fallback inline rendering if image fails
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  if (type === 'pilluna') {
    return (
      <div
        className={`relative rounded-xl overflow-hidden shadow-sm shrink-0 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src='/images/apps/pilluna-logo.svg'
          alt='Logo Pilluna'
          className='w-full h-full object-contain'
          onError={e => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow-sm shrink-0 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src='/images/apps/preluna-logo.svg'
        alt='Logo PRELUNA'
        className='w-full h-full object-contain'
        onError={e => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};

export default AppLogo;
