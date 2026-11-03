export interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({
  message,
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-10 w-10 border-[3px]',
  };

  return (
    <div
      role='status'
      aria-live='polite'
      className={`flex flex-col items-center justify-center gap-3 p-4 ${className}`}
    >
      <div
        data-testid='loading-spinner-circle'
        className={`animate-spin rounded-full border-teal-100 border-t-teal-600 ${sizeClasses[size]}`}
      />
      {message ? (
        <span className='text-xs font-semibold text-slate-500'>{message}</span>
      ) : (
        <span className='sr-only'>Memuat data...</span>
      )}
    </div>
  );
}

export default LoadingSpinner;
