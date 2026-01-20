import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: string;
  direction: SortDirection;
}

interface FilterConfig {
  [key: string]: string;
}

interface UseTableDataProps<T> {
  data: T[];
  itemsPerPage?: number;
}

export function useTableData<T extends Record<string, any>>({
  data,
  itemsPerPage = 10,
}: UseTableDataProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });
  const [filters, setFilters] = useState<FilterConfig>({});

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        const itemValue = item[key];
        if (itemValue == null) return false;
        return String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [data, filters]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === key) {
        const newDirection = 
          prevConfig.direction === 'asc' ? 'desc' : 
          prevConfig.direction === 'desc' ? null : 'asc';
        return { key: newDirection ? key : '', direction: newDirection };
      }
      return { key, direction: 'asc' };
    });
    setCurrentPage(1);
  };

  const handleSortAsc = (key: string) => {
    setSortConfig({ key, direction: 'asc' });
    setCurrentPage(1);
  };

  const handleSortDesc = (key: string) => {
    setSortConfig({ key, direction: 'desc' });
    setCurrentPage(1);
  };

  const handleClearSort = () => {
    setSortConfig({ key: '', direction: null });
    setCurrentPage(1);
  };

  const handleFilter = (key: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    paginatedData,
    currentPage,
    totalPages,
    totalItems: sortedData.length,
    itemsPerPage,
    sortConfig,
    filters,
    handleSort,
    handleSortAsc,
    handleSortDesc,
    handleClearSort,
    handleFilter,
    handlePageChange,
  };
}