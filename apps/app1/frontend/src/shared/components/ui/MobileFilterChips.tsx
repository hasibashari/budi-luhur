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
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[38px] select-none ${
              isSelected
                ? 'bg-[#B8285F] text-white shadow-xs shadow-[#B8285F]/20 scale-[1.02]'
                : 'bg-white hover:bg-[#FAF0F4] text-[#525866] hover:text-[#B8285F] border border-[#F0DFE7]'
            }`}
          >
            <span>{option.label}</span>
            {typeof option.count === 'number' && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#FAF0F4] text-[#861A43]'
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
