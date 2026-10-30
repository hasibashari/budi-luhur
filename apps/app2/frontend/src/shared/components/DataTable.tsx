'use client';

import React, { ReactNode, useState } from 'react';
import Pagination from './Pagination';

export interface Column<T> {
  id: string;
  label: string;
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  width?: string | number;
  renderCell: (row: T, index: number) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  pagination?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  showItemCount?: boolean;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  renderMobileCard?: (row: T, index: number) => ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  emptyMessage = 'Tidak ada data.',
  pagination = true,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20],
  showItemCount = true,
  page: controlledPage,
  pageSize: controlledPageSize,
  onPageChange: controlledOnPageChange,
  onPageSizeChange: controlledOnPageSizeChange,
  renderMobileCard,
}: DataTableProps<T>) {
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);

  const activePageSize = controlledPageSize !== undefined ? controlledPageSize : internalPageSize;
  const totalPages = Math.max(1, Math.ceil(data.length / activePageSize));

  const rawPage = controlledPage !== undefined ? controlledPage : internalPage;
  const activePage = Math.min(Math.max(1, rawPage), totalPages);

  const handlePageChange = (newPage: number) => {
    if (controlledOnPageChange) {
      controlledOnPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (controlledOnPageSizeChange) {
      controlledOnPageSizeChange(newSize);
    } else {
      setInternalPageSize(newSize);
      setInternalPage(1);
    }
  };

  const paginatedData = pagination
    ? data.slice((activePage - 1) * activePageSize, activePage * activePageSize)
    : data;

  const alignClass = (align?: Column<T>['align']) => {
    if (align === 'right') return 'text-right justify-end';
    if (align === 'center') return 'text-center justify-center';
    return 'text-left justify-start';
  };

  return (
    <div className='w-full overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-xs'>
      {/* 1. Mobile-First Card View (< sm / mobile screens when renderMobileCard provided) */}
      {renderMobileCard && (
        <div className='flex sm:hidden flex-col gap-3 p-3 bg-slate-50/70'>
          {paginatedData.length === 0 ? (
            <div className='py-8 text-center bg-white rounded-xl border border-dashed border-slate-200'>
              <p className='text-xs text-slate-500'>{emptyMessage}</p>
            </div>
          ) : (
            paginatedData.map((row, index) => {
              const globalIndex = pagination ? (activePage - 1) * activePageSize + index : index;
              return <div key={row.id}>{renderMobileCard(row, globalIndex)}</div>;
            })
          )}
        </div>
      )}

      {/* 2. Desktop/Tablet Table View (>= sm or when no renderMobileCard provided) */}
      <div className={`${renderMobileCard ? 'hidden sm:block' : 'block'} overflow-x-auto`}>
        <table className='min-w-[640px] w-full border-collapse text-left'>
          <thead className='bg-[#F0FDFA] border-b border-teal-100/80'>
            <tr>
              {columns.map(col => (
                <th
                  key={col.id}
                  style={col.width ? { width: col.width } : undefined}
                  className={`py-3.5 px-4 text-xs font-bold text-slate-800 tracking-tight ${alignClass(
                    col.align,
                  )}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100'>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className='py-12 text-center text-sm text-slate-500'>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const globalIndex = pagination ? (activePage - 1) * activePageSize + index : index;
                return (
                  <tr key={row.id} className='hover:bg-[#F0FDFA]/50 transition-colors'>
                    {columns.map(col => (
                      <td
                        key={col.id}
                        className={`py-3 px-4 text-xs sm:text-sm text-slate-800 align-middle ${alignClass(
                          col.align,
                        )}`}
                      >
                        {col.renderCell(row, globalIndex)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Integrated Pagination Footer */}
      {pagination && data.length > 0 && (
        <div className='border-t border-slate-200'>
          <Pagination
            currentPage={activePage}
            totalPages={totalPages}
            totalItems={data.length}
            pageSize={activePageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={pageSizeOptions}
            showItemCount={showItemCount}
          />
        </div>
      )}
    </div>
  );
}

export default DataTable;
