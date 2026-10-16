import React from 'react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function AdminHeader({ title, subtitle, action }: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200">
      {/* Title & Subtitle Section */}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Optional Action Controls Slot */}
      {action && (
        <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto justify-start sm:justify-end flex-wrap">
          {action}
        </div>
      )}
    </div>
  );
}
