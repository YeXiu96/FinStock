import React from 'react';

const Table = ({ columns, data, keyField = 'id', isLoading = false, emptyMessage = 'Data tidak ditemukan' }) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-neutral-50 border-y border-neutral-200">
            {columns.map((col, idx) => (
              <th 
                key={col.key || idx} 
                className={`py-3 px-4 text-sm font-semibold text-neutral-600 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-neutral-500">
                <div className="flex justify-center items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memuat data...
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-neutral-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row[keyField] || rowIndex} className="even:bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={`${row[keyField] || rowIndex}-${col.key || colIndex}`} className={`py-3 px-4 text-sm text-neutral-700 ${col.className || ''}`}>
                    {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
