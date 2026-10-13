'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showItemCount?: boolean;
  showFirstLastButtons?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20],
  showItemCount = true,
  showFirstLastButtons = false,
  className = '',
}: PaginationProps) {
  if (totalPages <= 0 && (!totalItems || totalItems === 0)) {
    return null;
  }

  const effectiveTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), effectiveTotalPages);

  const startItem =
    totalItems && totalItems > 0 && pageSize ? (safeCurrentPage - 1) * pageSize + 1 : 0;
  const endItem =
    totalItems && totalItems > 0 && pageSize
      ? Math.min(safeCurrentPage * pageSize, totalItems)
      : 0;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1;

    if (effectiveTotalPages <= 7) {
      for (let i = 1; i <= effectiveTotalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    const left = safeCurrentPage - delta;
    const right = safeCurrentPage + delta + 1;
    let prev = 0;

    for (let i = 1; i <= effectiveTotalPages; i++) {
      if (i === 1 || i === effectiveTotalPages || (i >= left && i < right)) {
        if (prev) {
          if (i - prev === 2) {
            pages.push(prev + 1);
          } else if (i - prev !== 1) {
            pages.push('...');
          }
        }
        pages.push(i);
        prev = i;
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`flex items-center justify-between flex-wrap gap-3 py-3 px-4 w-full bg-white ${className}`}
    >
      {/* Left: Item Counter & Page Size Selector */}
      <div className='flex items-center gap-3 flex-wrap'>
        {showItemCount && totalItems !== undefined && (
          <p className='text-xs sm:text-sm text-[#64748b]'>
            {totalItems === 0 ? (
              '0 data'
            ) : (
              <>
                Menampilkan <strong className='text-[#1e293b] font-bold'>{startItem}–{endItem}</strong> dari{' '}
                <strong className='text-[#1e293b] font-bold'>{totalItems}</strong> data
              </>
            )}
          </p>
        )}

        {onPageSizeChange && pageSize && pageSizeOptions.length > 0 && (
          <div className='flex items-center gap-1.5'>
            <span className='text-xs text-[#64748b]'>Tampilkan:</span>
            <select
              value={pageSize}
              onChange={e => onPageSizeChange(Number(e.target.value))}
              className='text-xs font-semibold text-[#1e293b] bg-white border border-[#fce7f3] rounded-lg px-2 py-1 outline-none focus:border-[#e11d48]'
            >
              {pageSizeOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt} / hal
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Controls */}
      <div className='flex items-center gap-1.5'>
        {showFirstLastButtons && (
          <button
            type='button'
            disabled={safeCurrentPage <= 1}
            onClick={() => onPageChange(1)}
            aria-label='First page'
            className='w-8 h-8 rounded-lg border border-[#fce7f3] bg-white text-[#64748b] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:bg-rose-50 hover:not-disabled:text-[#e11d48] transition-colors cursor-pointer'
          >
            <ChevronsLeft size={15} />
          </button>
        )}

        <button
          type='button'
          disabled={safeCurrentPage <= 1}
          onClick={() => onPageChange(safeCurrentPage - 1)}
          aria-label='Previous page'
          className='w-8 h-8 rounded-lg border border-[#fce7f3] bg-white text-[#64748b] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:bg-rose-50 hover:not-disabled:text-[#e11d48] transition-colors cursor-pointer'
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Buttons */}
        <div className='flex items-center gap-1'>
          {pageNumbers.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className='px-1 text-xs text-[#94a3b8] select-none'
                >
                  …
                </span>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === safeCurrentPage;

            return (
              <button
                key={pageNum}
                type='button'
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-[#e11d48] text-white shadow-sm shadow-rose-500/20'
                    : 'bg-white border border-[#fce7f3] text-[#475569] hover:bg-rose-50 hover:text-[#e11d48]'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          type='button'
          disabled={safeCurrentPage >= effectiveTotalPages}
          onClick={() => onPageChange(safeCurrentPage + 1)}
          aria-label='Next page'
          className='w-8 h-8 rounded-lg border border-[#fce7f3] bg-white text-[#64748b] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:bg-rose-50 hover:not-disabled:text-[#e11d48] transition-colors cursor-pointer'
        >
          <ChevronRight size={16} />
        </button>

        {showFirstLastButtons && (
          <button
            type='button'
            disabled={safeCurrentPage >= effectiveTotalPages}
            onClick={() => onPageChange(effectiveTotalPages)}
            aria-label='Last page'
            className='w-8 h-8 rounded-lg border border-[#fce7f3] bg-white text-[#64748b] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:bg-rose-50 hover:not-disabled:text-[#e11d48] transition-colors cursor-pointer'
          >
            <ChevronsRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

export default Pagination;
