import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  className = '',
}: ScreenHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`flex items-center justify-between mb-4 sm:mb-6 ${className}`}>
      <div className='flex items-center gap-3'>
        {showBack && (
          <button
            type='button'
            onClick={handleBack}
            className='w-9 h-9 rounded-xl bg-white border border-[#e6eeff] flex items-center justify-center text-[#121c2a] hover:text-[#aa294d] hover:bg-[#ffd9de]/40 shadow-xs transition-colors cursor-pointer'
            aria-label='Kembali'
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <h1 className='text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight'>
            {title}
          </h1>
          {subtitle && <p className='text-xs sm:text-sm text-slate-500 mt-0.5'>{subtitle}</p>}
        </div>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </div>
  );
}

export default ScreenHeader;
