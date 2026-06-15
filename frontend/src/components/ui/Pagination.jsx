import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Generate page numbers
  const pageNumbers = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (currentPage <= 3) {
    endPage = Math.min(totalPages, 5);
  }
  if (currentPage >= totalPages - 2) {
    startPage = Math.max(1, totalPages - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const start = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between py-3 px-4 bg-neutral-100/50 border-t border-neutral-100 rounded-b-xl gap-4">
      <div className="text-xs text-neutral-500 font-medium">
        Showing {start}–{end} of {totalItems} records
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 rounded text-neutral-500 hover:text-[#1e3251] hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`min-w-[28px] h-7 px-2 text-xs font-medium rounded transition-colors ${
              currentPage === number 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-neutral-600 bg-white hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            {number}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 rounded text-neutral-500 hover:text-[#1e3251] hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="text-xs text-neutral-500 font-medium">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
