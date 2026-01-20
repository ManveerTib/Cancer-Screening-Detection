import { useState, useCallback } from 'react';

interface Column {
  key: string;
  label: string;
  visible: boolean;
}

interface UseColumnVisibilityProps {
  initialColumns: Column[];
  storageKey?: string;
}

export function useColumnVisibility({ initialColumns, storageKey }: UseColumnVisibilityProps) {
  const [columns, setColumns] = useState<Column[]>(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const savedColumns = JSON.parse(saved);
          return initialColumns.map(col => ({
            ...col,
            visible: savedColumns[col.key] !== false
          }));
        } catch {
          // If parsing fails, use initial columns
        }
      }
    }
    return initialColumns;
  });

  const toggleColumn = useCallback((columnKey: string) => {
    setColumns(prev => {
      const updated = prev.map(col =>
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      );
      
      if (storageKey) {
        const visibility = updated.reduce((acc, col) => {
          acc[col.key] = col.visible;
          return acc;
        }, {} as Record<string, boolean>);
        localStorage.setItem(storageKey, JSON.stringify(visibility));
      }
      
      return updated;
    });
  }, [storageKey]);

  const isColumnVisible = useCallback((columnKey: string) => {
    return columns.find(col => col.key === columnKey)?.visible ?? true;
  }, [columns]);

  return {
    columns,
    toggleColumn,
    isColumnVisible,
  };
}