import React from 'react';
import { X } from 'lucide-react';

interface SolutionModalProps {
    show: boolean;
    title: string;
    isEditable: boolean;
    value: string;
    modalValue: string;
    onChangeModalValue: (value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    onClose: () => void;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    recommendedAction?: 'Auto Sage' | 'DRI Input';
    isJsonValid?: boolean;
    isJsonValid?: boolean;
    children?: React.ReactNode;
}

const SolutionModal: React.FC<SolutionModalProps> = ({
    show,
    title,
    isEditable,
    value,
    modalValue,
    onChangeModalValue,
    onSave,
    onCancel,
    onClose,
    size = 'md',
    recommendedAction,
    isJsonValid = true,
    children,
}) => {
    if (!show) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-hidden`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {children}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        disabled={!isJsonValid}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                            isJsonValid
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-gray-400 cursor-not-allowed'
                        }`}
                        title={!isJsonValid ? 'Please fix JSON errors before saving' : ''}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SolutionModal;