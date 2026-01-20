import React, { useState, useRef, useCallback } from 'react';

interface ResizableTableProps {
  children: React.ReactNode;
  className?: string;
  nonResizableColumns?: number[];
}

interface ColumnWidths {
  [key: string]: number;
}

const ResizableTable: React.FC<ResizableTableProps> = ({ 
  children, 
  className = '', 
  nonResizableColumns = [] 
}) => {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({});
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent, columnIndex: number) => {
    // Don't allow resizing for non-resizable columns
    if (nonResizableColumns.includes(columnIndex)) {
      return;
    }
    
    e.preventDefault();
    setIsResizing(true);
    setResizingColumn(`col-${columnIndex}`);
    startXRef.current = e.clientX;
    
    const table = tableRef.current;
    if (table) {
      const th = table.querySelector(`th:nth-child(${columnIndex + 1})`) as HTMLElement;
      if (th) {
        startWidthRef.current = th.offsetWidth;
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.max(80, startWidthRef.current + deltaX); // Minimum width of 80px
      
      setColumnWidths(prev => ({
        ...prev,
        [`col-${columnIndex}`]: newWidth
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizingColumn(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [isResizing, nonResizableColumns]);

  const getColumnStyle = (columnIndex: number) => {
    const width = columnWidths[`col-${columnIndex}`];
    return width ? { width: `${width}px`, minWidth: `${width}px` } : {};
  };

  const enhanceChildren = (children: React.ReactNode): React.ReactNode => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        if (child.type === 'thead') {
          return React.cloneElement(child, {
            children: React.Children.map(child.props.children, (row) => {
              if (React.isValidElement(row) && row.type === 'tr') {
                return React.cloneElement(row, {
                  children: React.Children.map(row.props.children, (th, index) => {
                    if (React.isValidElement(th) && th.type === 'th') {
                      return (
                        <th
                          key={index}
                          {...th.props}
                          style={{
                            ...th.props.style,
                            ...getColumnStyle(index),
                            position: 'relative',
                            borderRight: '1px solid rgb(229 231 235)',
                            borderBottom: 'none'
                          }}
                          className={`${th.props.className || ''} dark:border-gray-600`}
                        >
                          {th.props.children}
                          {!nonResizableColumns.includes(index) && (
                            <div
                              className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-blue-500 hover:opacity-30 transition-all duration-200 z-10"
                              onMouseDown={(e) => handleMouseDown(e, index)}
                              style={{
                                background: resizingColumn === `col-${index}` ? 'rgba(59, 130, 246, 0.5)' : 'transparent',
                                right: '-1px'
                              }}
                              title="Drag to resize column"
                            />
                          )}
                        </th>
                      );
                    }
                    return th;
                  })
                });
              }
              return row;
            })
          });
        } else if (child.type === 'tbody') {
          return React.cloneElement(child, {
            children: React.Children.map(child.props.children, (row) => {
              if (React.isValidElement(row) && row.type === 'tr') {
                return React.cloneElement(row, {
                  children: React.Children.map(row.props.children, (td, index) => {
                    if (React.isValidElement(td) && td.type === 'td') {
                      return React.cloneElement(td, {
                        style: {
                          ...td.props.style,
                          ...getColumnStyle(index),
                          borderRight: '1px solid rgb(229 231 235)',
                          borderBottom: 'none'
                        },
                        className: `${td.props.className || ''} dark:border-gray-600`
                      });
                    }
                    return td;
                  })
                });
              }
              return row;
            })
          });
        }
      }
      return child;
    });
  };

  return (
    <div className="relative">
      <table
        ref={tableRef}
        className={`${className} ${isResizing ? 'select-none' : ''} border-collapse`}
        style={{ tableLayout: 'fixed' }}
      >
        {enhanceChildren(children)}
      </table>
      {isResizing && (
        <div className="absolute inset-0 pointer-events-none bg-blue-50 dark:bg-blue-900 opacity-10 transition-opacity" />
      )}
    </div>
  );
};

export default ResizableTable;