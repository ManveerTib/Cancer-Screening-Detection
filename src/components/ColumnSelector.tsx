import React, { useState, useRef, useEffect } from 'react';
import { Settings, Search, CheckSquare, Square } from 'lucide-react';

interface Column {
    key: string;
    label: string;
    visible: boolean;
}

interface ColumnSelectorProps {
    columns: Column[];
    onColumnToggle: (columnKey: string) => void;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({ columns, onColumnToggle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredColumns = columns.filter(column =>
        column.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const visibleCount = columns.filter(col => col.visible).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors relative"
                title="Column Selection"
            >
                <Settings className="w-4 h-4" />
                <span>Columns ({visibleCount})</span>
            </button>

            {isOpen && (
                <div className="absolute mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9998]"
                    style={{
                        top: '100%',
                        right: 0
                    }}>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                            Column Selection
                        </h3>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search columns..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                        <div className="p-2">
                            {filteredColumns.map((column) => (
                                <div
                                    key={column.key}
                                    className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-pointer transition-colors"
                                    onClick={() => onColumnToggle(column.key)}
                                >
                                    <button className="text-blue-600 dark:text-blue-400">
                                        {column.visible ? (
                                            <CheckSquare className="w-4 h-4" />
                                        ) : (
                                            <Square className="w-4 h-4" />
                                        )}
                                    </button>
                                    <span className="text-sm text-gray-900 dark:text-white flex-1">
                                        {column.label}
                                    </span>
                                </div>
                            ))}
                            {filteredColumns.length === 0 && (
                                <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No columns found
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColumnSelector;