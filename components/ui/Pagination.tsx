import React from 'react';
import { Button, Icon } from '@/components/ui';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className = '',
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) {
    return null;
  }
  
  if (totalItems <= itemsPerPage) {
     return (
        <div className={`flex items-center justify-between py-3 px-4 border-t dark:border-gray-700 ${className}`}>
            <div className="flex items-center gap-2">
                <label htmlFor="rowsPerPage" className="text-sm text-gray-600 dark:text-gray-400">Rows:</label>
                <select
                id="rowsPerPage"
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-sm p-1.5 focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400"
                >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                </select>
            </div>
             <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {startItem}-{endItem} of {totalItems}
            </span>
            {/* Empty div to keep alignment with pages that have buttons */}
            <div className="w-[170px]"></div>
        </div>
     );
  }


  return (
    <div className={`flex items-center justify-between py-3 px-4 border-t dark:border-gray-700 ${className}`}>
      <div className="flex items-center gap-2">
        <label htmlFor="rowsPerPage" className="text-sm text-gray-600 dark:text-gray-400">Rows:</label>
        <select
          id="rowsPerPage"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md text-sm p-1.5 focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      <span className="text-sm text-gray-600 dark:text-gray-400">
        Showing {startItem}-{endItem} of {totalItems}
      </span>

      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          leftIconName="fas fa-chevron-left"
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next <Icon name="fas fa-chevron-right" className="ml-2"/>
        </Button>
      </div>
    </div>
  );
};
