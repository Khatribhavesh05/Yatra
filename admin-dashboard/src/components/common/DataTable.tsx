import React from 'react';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No operational records available.',
  isLoading = false,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center gap-3 text-slate-500 text-xs font-semibold">
          <span className="material-symbols-outlined animate-spin text-teal-600 text-xl">
            progress_activity
          </span>
          Fetching operational data...
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl text-center">
        <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">inbox</span>
        <p className="text-xs font-semibold text-slate-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-3 px-4 ${
                  col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                }`}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick && onRowClick(item)}
              className={`transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-teal-50/50' : 'hover:bg-slate-50/80'
              }`}
            >
              {columns.map((col, cIdx) => {
                let cellContent: React.ReactNode = null;
                if (typeof col.accessor === 'function') {
                  cellContent = col.accessor(item);
                } else if (col.accessor) {
                  cellContent = String(item[col.accessor] ?? '');
                }

                return (
                  <td
                    key={cIdx}
                    className={`py-3 px-4 whitespace-nowrap ${
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
