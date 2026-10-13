'use client';

import React from 'react';

export interface FilterOption<T extends string = string> {
  label: string;
  value: T;
  count?: number;
}

export interface MobileFilterChipsProps<T extends string = string> {
  options: FilterOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  className?: string;
}

export function MobileFilterChips<T extends string = string>({
  options,
  selectedValue,
  onSelect,
  className = '',
}: MobileFilterChipsProps<T>) {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5 ${className}`}>
      {options.map(option => {
        const isSelected = selectedValue === option.value;
        return (
          <button
            key={option.value}
            type='button'
            onClick={() => onSelect(option.value)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] select-none ${
              isSelected
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-200 scale-102'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
            }`}
          >
            <span>{option.label}</span>
            {typeof option.count === 'number' && (
              <span
                className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default MobileFilterChips;
