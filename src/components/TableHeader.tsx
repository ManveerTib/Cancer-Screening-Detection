import React from 'react';
import { ChevronUp, ChevronDown, Filter, MoreVertical, ArrowUp, ArrowDown } from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;

interface TableHeaderProps {
  title?: string;
  label?: string; // Alternative to title for simpler usage
  sortKey?: string; // For simpler sort interface
  currentSort?: string; // Currently sorted column
  currentDirection?: SortDirection; // Current sort direction
  sortable?: boolean;
  filterable?: boolean;
  sortDirection?: SortDirection;
  filterValue?: string;
  onSort?: (key: string) => void; // Simplified sort handler
  onSortAsc?: () => void;
  onSortDesc?: () => void;
  onClearSort?: () => void;
  onFilterChange?: (value: string) => void;
  className?: string;
  isModalOpen?: boolean;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  title,
  label,
  sortKey,
  currentSort,
  currentDirection,
  sortable = false,
  filterable = false,
  sortDirection,
  filterValue = '',
  onSort,
  onSortAsc,
  onSortDesc,
  onClearSort,
  onFilterChange,
  className = '',
  isModalOpen = false,
}) => {
  const [showSortMenu, setShowSortMenu] = React.useState(false);
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);
  const sortMenuRef = React.useRef<HTMLDivElement>(null);
  const filterMenuRef = React.useRef<HTMLDivElement>(null);

  // Use label if title is not provided (simpler interface)
  const displayTitle = title || label || '';

  // Determine if this column is currently sorted (for simpler interface)
  const isCurrentlySorted = sortKey && currentSort === sortKey;
  const effectiveSortDirection = isCurrentlySorted ? currentDirection : sortDirection;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSortClick = () => {
    if (sortKey && onSort) {
      // Simpler interface - just pass the sort key
      onSort(sortKey);
    } else {
      // Original interface - no parameters
      onSort?.('' as any);
    }
  };

  const handleSortAsc = () => {
    onSortAsc?.();
    setShowSortMenu(false);
  };

  const handleSortDesc = () => {
    onSortDesc?.();
    setShowSortMenu(false);
  };

  const handleClearSort = () => {
    onClearSort?.();
    setShowSortMenu(false);
  };

  return (
    <th className={`relative px-6 py-4 text-left text-xs uppercase tracking-wider z-[200] ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-black dark:text-white">{displayTitle}</span>
          <div className="relative flex items-center space-x-1 z-[200]">
            {/* Simple sort button for simpler interface */}
            {sortKey && onSort && !isModalOpen && (
              <button
                onClick={handleSortClick}
                className="relative text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 z-[200]"
                title="Sort column"
              >
                {effectiveSortDirection === 'asc' ? (
                  <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                ) : effectiveSortDirection === 'desc' ? (
                  <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <MoreVertical className="w-4 h-4" />
                )}
              </button>
            )}
            {/* Complex sort menu for original interface */}
            {sortable && !sortKey && !isModalOpen && (
              <div className="relative z-[200]" ref={sortMenuRef}>
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="relative text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 z-[200]"
                  title="Sort options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showSortMenu && (
                  <div className="absolute z-[201] mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl"
                       style={{
                         top: '100%',
                         right: -100
                       }}>
                    <div className="py-1">
                      <button
                        onClick={handleSortAsc}
                        className="relative flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-[201]"
                      >
                        <ArrowUp className="w-4 h-4" />
                        <span>Sort Ascending</span>
                      </button>
                      <button
                        onClick={handleSortDesc}
                        className="relative flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-[201]"
                      >
                        <ArrowDown className="w-4 h-4" />
                        <span>Sort Descending</span>
                      </button>
                      {effectiveSortDirection && (
                        <button
                          onClick={handleClearSort}
                          className="relative flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-600 z-[201]"
                        >
                          <span>Clear Sort</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {filterable && !isModalOpen && (
              <div className="relative z-[200]" ref={filterMenuRef}>
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`p-1 transition-colors ${
                    filterValue
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  } relative z-[200]`}
                  title="Filter options"
                >
                  <Filter className="w-4 h-4" />
                </button>
                {showFilterMenu && (
                  <div className="absolute z-[201]  mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl"
                       style={{
                         top: '100%',
                         right: -100
                       }}>
                    <div className="p-3">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Filter by {displayTitle}
                      </label>
                      <input
                        type="text"
                        value={filterValue}
                        onChange={(e) => onFilterChange?.(e.target.value)}
                        placeholder={`Filter ${displayTitle.toLowerCase()}...`}
                        className="relative w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 z-[201]"
                        autoFocus
                      />
                      {filterValue && (
                        <button
                          onClick={() => onFilterChange?.('')}
                          className="relative mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors z-[201]"
                        >
                          Clear filter
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </th>
  );
};

export default TableHeader;