import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, FileText, X, Edit } from 'lucide-react';
import SolutionDropdown from './SolutionDropdown';
import SolutionModal from './SolutionModal';

interface ExpandableTextAreaProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    recommendedAction?: 'Auto Sage' | 'DRI Input' | 'Hold';
    onDropdownToggle?: (isOpen: boolean) => void;
    isModalOpen?: boolean;
    sageStatus?: string;
    nodeStatus?: string;
}

/** ------------------ JSON Editor with Validation ------------------ */
interface JsonEditorProps {
    value: string;
    onChange: (value: string) => void;
    onValidationChange: (isValid: boolean) => void;
    className?: string;
}

const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, onValidationChange, className = '' }) => {
    const [error, setError] = useState<string | null>(null);
    const [errorLine, setErrorLine] = useState<number | null>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const overlayRef = React.useRef<HTMLDivElement>(null);

    const getLineAndColumn = (str: string, index: number) => {
        const lines = str.substring(0, index).split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;
        return { line, column };
    };

    const validateJson = (text: string) => {
        if (!text.trim()) {
            setError(null);
            setErrorLine(null);
            onValidationChange(true);
            return;
        }

        try {
            JSON.parse(text);
            setError(null);
            setErrorLine(null);
            onValidationChange(true);
        } catch (err: any) {
            const match = err.message.match(/position\s+(\d+)/i);
            if (match) {
                const pos = parseInt(match[1], 10);
                const { line, column } = getLineAndColumn(text, pos);
                setError(`JSON Error: ${err.message}\n➡️ At line ${line}, column ${column}`);
                setErrorLine(line);
            } else {
                setError(`JSON Error: ${err.message}`);
                setErrorLine(null);
            }
            onValidationChange(false);
        }
    };

    React.useEffect(() => {
        validateJson(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
    };

    const handleScroll = () => {
        if (overlayRef.current && textareaRef.current) {
            overlayRef.current.scrollTop = textareaRef.current.scrollTop;
            overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    const renderHighlightedText = () => {
        return value.split('\n').map((line, idx) => {
            const lineNumber = idx + 1;
            return (
                <div
                    key={idx}
                    className={`whitespace-pre ${
                        errorLine === lineNumber ? 'bg-red-200 dark:bg-red-900/50' : ''
                    }`}
                >
                    {line || ' '}
                </div>
            );
        });
    };

    return (
        <div className="space-y-2">
            <div className="relative">
                {/* Overlay for highlighting */}
                <div
                    ref={overlayRef}
                    className="absolute inset-0 p-3 font-mono text-sm text-transparent pointer-events-none overflow-auto border border-transparent rounded-md"
                    aria-hidden="true"
                >
                    {renderHighlightedText()}
                </div>

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onScroll={handleScroll}
                    rows={4}
                    className={`relative w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono z-10 ${className}`}
                    placeholder="JSON payload will appear here..."
                />
            </div>

            {error && (
                <div className="text-red-600 dark:text-red-400 text-xs whitespace-pre-wrap bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-2">
                    {error}
                </div>
            )}
        </div>
    );
};

 

 

/** ------------------ ExpandableTextArea ------------------ */
const ExpandableTextArea: React.FC<ExpandableTextAreaProps> = ({
    value,
    onChange,
    disabled = true, // Always read-only for Solution column
    placeholder = '',
    recommendedAction = 'Auto Sage',
    onDropdownToggle,
    isModalOpen = false,
    sageStatus,
    nodeStatus,
}) => {
    const [showModal, setShowModal] = useState(false);
    const [modalValue, setModalValue] = useState(value);
    const [selectedDropdownValue, setSelectedDropdownValue] = useState('');
    const [jsonPayload, setJsonPayload] = useState('');
    const [isPreviewEditing, setIsPreviewEditing] = useState(false);
    const [previewEditValue, setPreviewEditValue] = useState('');
    const [isJsonValid, setIsJsonValid] = useState(true);
    const [isPreviewJsonValid, setIsPreviewJsonValid] = useState(true);
    const [autoSageError, setAutoSageError] = useState<string | null>(null);
    const [autoSageErrorLine, setAutoSageErrorLine] = useState<number | null>(null);
    const autoSageTextareaRef = React.useRef<HTMLTextAreaElement>(null);
    const overlayRef = React.useRef<HTMLDivElement>(null);

    // Helper function to get line and column from position
    const getLineAndColumn = (str: string, index: number) => {
        const lines = str.substring(0, index).split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;
        return { line, column };
    };

    // Validate JSON for Auto Sage
    const validateAutoSageJson = (text: string) => {
        if (!text.trim()) {
            setAutoSageError('JSON content is required');
            setAutoSageErrorLine(null);
            setIsJsonValid(false);
            return;
        }

        try {
            JSON.parse(text);
            setAutoSageError(null);
            setAutoSageErrorLine(null);
            setIsJsonValid(true);
        } catch (err: any) {
            const match = err.message.match(/position\s+(\d+)/i);
            if (match) {
                const pos = parseInt(match[1], 10);
                const { line, column } = getLineAndColumn(text, pos);
                setAutoSageError(`JSON Error: ${err.message}\n➡️ At line ${line}, column ${column}`);
                setAutoSageErrorLine(line);
            } else {
                setAutoSageError(`JSON Error: ${err.message}`);
                setAutoSageErrorLine(null);
            }
            setIsJsonValid(false);
        }
    };

    // Handle Auto Sage textarea change
    const handleAutoSageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setModalValue(newValue);
        validateAutoSageJson(newValue);
    };

    // Handle Auto Sage textarea scroll
    const handleAutoSageScroll = () => {
        if (overlayRef.current && autoSageTextareaRef.current) {
            overlayRef.current.scrollTop = autoSageTextareaRef.current.scrollTop;
            overlayRef.current.scrollLeft = autoSageTextareaRef.current.scrollLeft;
        }
    };
    // Helper function to format value as JSON payload
    const formatAsJsonPayload = (inputValue: string): string => {
        if (!inputValue) return '';
        
        // Check if it's already in JSON format
        try {
            JSON.parse(inputValue);
            return inputValue; // Already JSON, return as is
        } catch {
            // Not JSON, format it
            const lines = inputValue.split('\n');
            const firstLine = lines[0];
            const jsonPayload = JSON.stringify({ "Action": firstLine }, null, 2);
            return jsonPayload;
        }
    };

    // Format the display value
    const displayValue = recommendedAction === 'Hold' ? value : formatAsJsonPayload(value);

    // Helper function to convert dropdown selection to JSON payload
    const convertSelectionToJson = (selection: string): string => {
        if (!selection) return '';

        // Check if selection is already a JSON object
        try {
            const parsed = JSON.parse(selection);
            // If it's already a valid JSON object, return it formatted
            return JSON.stringify(parsed, null, 2);
        } catch {
            // For DRI Input, use "ActionSelected" key for "Open GDCO" and "Other" only
            const useActionSelectedKey = recommendedAction === 'DRI Input' &&
                (selection === 'Open GDCO' || selection === 'Other');
            const keyName = useActionSelectedKey ? "ActionSelected" : "Action";

            // Handle hierarchical selections (e.g., "PROFORGE > Default")
            if (selection.includes(' > ')) {
                const parts = selection.split(' > ');
                if (parts.length === 2) {
                    return JSON.stringify({ [keyName]: `${parts[0]} - ${parts[1]}` }, null, 2);
                }
            }

            // Handle simple selections
            return JSON.stringify({ [keyName]: selection }, null, 2);
        }
    };

    useEffect(() => {
        // Format the value as JSON payload for Auto Sage
        if (recommendedAction === 'Auto Sage') {
            const formattedValue = formatAsJsonPayload(value);
            setModalValue(formattedValue);
            validateAutoSageJson(formattedValue);
        } else {
            setModalValue(value);
        }
        // Validate Auto Sage JSON on initial load
        // Extract dropdown value and JSON payload from the current value
        if (value && recommendedAction === 'DRI Input') {
            const lines = value.split('\n');
            if (lines.length > 0) {
                const firstLine = lines[0];
                setSelectedDropdownValue(firstLine);
                
                // Check if the rest is JSON or convert selection to JSON
                const restOfValue = lines.slice(1).join('\n').trim();
                const jsonFromSelection = convertSelectionToJson(firstLine);
                
                if (restOfValue) {
                    setJsonPayload(restOfValue);
                } else {
                    // Convert selection to JSON format
                    setJsonPayload(jsonFromSelection);
                }
            }
        } else {
            setJsonPayload(value);
        }
    }, [value, recommendedAction]);

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const handleModalSave = () => {
        if (recommendedAction === 'DRI Input') {
            // For DRI Input, save only the JSON payload if it's valid JSON, otherwise combine
            try {
                const parsed = JSON.parse(jsonPayload);
                // If jsonPayload is valid JSON and contains complete data, save only jsonPayload
                if (typeof parsed === 'object' && parsed !== null) {
                    onChange(jsonPayload);
                } else {
                    // Fallback to combined format
                    const combinedValue = selectedDropdownValue + (jsonPayload ? '\n' + jsonPayload : '');
                    onChange(combinedValue);
                }
            } catch {
                // If jsonPayload is not valid JSON, use combined format
                const combinedValue = selectedDropdownValue + (jsonPayload ? '\n' + jsonPayload : '');
                onChange(combinedValue);
            }
        } else {
            onChange(modalValue);
        }
        setShowModal(false);
    };

    const handleModalCancel = () => {
        setModalValue(value);
        if (value && recommendedAction === 'DRI Input') {
            const lines = value.split('\n');
            if (lines.length > 0) {
                const firstLine = lines[0];
                setSelectedDropdownValue(firstLine);
                const restOfValue = lines.slice(1).join('\n').trim();
                if (restOfValue) {
                    setJsonPayload(restOfValue);
                } else {
                    const jsonFromSelection = convertSelectionToJson(firstLine);
                    setJsonPayload(jsonFromSelection);
                }
            }
        } else {
            setJsonPayload(value);
        }
        setShowModal(false);
    };

    const handleDropdownChange = (newValue: string) => {
        setSelectedDropdownValue(newValue);
        // Convert new selection to JSON format
        const newJsonPayload = convertSelectionToJson(newValue);
        setJsonPayload(newJsonPayload);
    };

    // Always allow editing in modal for both Auto Sage and DRI Input
    const isEditable = true;

    const getContainerZIndex = () =>
        showModal || isModalOpen ? 'z-10' : 'z-[100050]';

    // Show edit icon when SAGE STATUS != "Processing" and STATUS != "In Production" and not "Hold"
    const shouldShowEditIcon = sageStatus != "Processing" && nodeStatus != "In Production" && recommendedAction !== 'Hold';

    /** ---------- Common path for both Auto Sage and DRI Input ---------- */
    return (
        <>
            <div className="space-y-2">
                {recommendedAction === 'Hold' && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Why?
                    </label>
                )}
                <div className="flex items-center space-x-2">
                <textarea
                    value={displayValue}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={recommendedAction !== 'Hold'} // Editable only for Hold
                    placeholder={placeholder}
                    rows={4}
                    className={`flex-1 px-3 py-2 border rounded-md text-sm transition-colors resize-none ${
                        recommendedAction === 'Hold'
                            ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                            : 'bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white cursor-not-allowed'
                    } font-mono`}
                />
                {shouldShowEditIcon && (
                        <button
                            onClick={openModal}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-shrink-0"
                            title="Edit Solution"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Modal accessible via edit icon */}
            <SolutionModal
                show={showModal}
                title={`Solution Details (Editable) - ${recommendedAction}`}
                isEditable={isEditable}
                value={value}
                modalValue={recommendedAction === 'DRI Input' ? selectedDropdownValue + (jsonPayload ? '\n' + jsonPayload : '') : modalValue}
                onChangeModalValue={recommendedAction === 'DRI Input' ? () => {} : setModalValue}
                onSave={handleModalSave}
                onCancel={handleModalCancel}
                onClose={closeModal}
                size="lg"
                recommendedAction={recommendedAction}
                isJsonValid={recommendedAction === 'DRI Input' ? (isPreviewEditing ? false : isJsonValid) : isJsonValid}
            >
                {recommendedAction === 'DRI Input' ? (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Solution Selection ({recommendedAction})
                        </h4>
                        <SolutionDropdown
                            value={selectedDropdownValue}
                            onChange={handleDropdownChange}
                            disabled={disabled}
                            isModal
                            onDropdownToggle={onDropdownToggle}
                        />
                        
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Preview - Combined Value (JSON Format)
                                </h4>
                                <button
                                    onClick={() => {
                                        setIsPreviewEditing(true);
                                        const currentPreview = (() => {
                                            try {
                                                const parsed = JSON.parse(jsonPayload);
                                                if (typeof parsed === 'object' && parsed !== null) {
                                                    return jsonPayload;
                                                }
                                            } catch {
                                                // Not valid JSON, fall back to combined format
                                            }
                                            return selectedDropdownValue + (jsonPayload ? '\n' + jsonPayload : '');
                                        })();
                                        setPreviewEditValue(currentPreview);
                                        // Only update main validation state if preview JSON is valid
                                        if (isPreviewJsonValid) {
                                            setIsJsonValid(true);
                                        }
                                        // Reset to original validation state when canceling
                                        setIsPreviewJsonValid(isJsonValid);
                                    }}
                                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    title="Edit Preview"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            </div>
                            {isPreviewEditing ? (
                                <JsonEditor
                                    value={previewEditValue}
                                    onChange={setPreviewEditValue}
                                    onValidationChange={setIsPreviewJsonValid}
                                />
                            ) : (
                                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-3">
                                    <pre className="text-sm font-mono text-gray-900 dark:text-white whitespace-pre-wrap">
                                        {(() => {
                                            // If jsonPayload is already a valid JSON that matches the dropdown selection, show only jsonPayload
                                            try {
                                                const parsed = JSON.parse(jsonPayload);
                                                // If jsonPayload contains the dropdown selection data, show only jsonPayload
                                                if (typeof parsed === 'object' && parsed !== null) {
                                                    return jsonPayload;
                                                }
                                            } catch {
                                                // Not valid JSON, fall back to combined format
                                            }
                                            // Default: combine dropdown value with JSON payload
                                            return selectedDropdownValue + (jsonPayload ? '\n' + jsonPayload : '');
                                        })()}
                                    </pre>
                                </div>
                            )}
                            {isPreviewEditing ? (
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Edit the combined value directly. Changes will be applied after clicking Apply.
                                    </p>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                // Apply the edited value to jsonPayload
                                                setJsonPayload(previewEditValue);
                                                setIsPreviewEditing(false);
                                                setPreviewEditValue('');
                                                setIsJsonValid(isPreviewJsonValid);
                                            }}
                                            disabled={!isPreviewJsonValid}
                                            className={`px-3 py-1 text-xs rounded transition-colors ${
                                                isPreviewJsonValid
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-gray-400 text-white cursor-not-allowed'
                                            }`}
                                        >
                                            Apply
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsPreviewEditing(false);
                                                setPreviewEditValue('');
                                                setIsPreviewJsonValid(true);
                                            }}
                                            className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    This shows the final JSON value that will be saved. Click the edit icon to modify.
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Solution Details (Editable) - {recommendedAction}
                        </h4>
                        <div className="space-y-2">
                            <div className="relative">
                                {/* Overlay for highlighting */}
                                <div
                                    ref={overlayRef}
                                    className="absolute inset-0 p-3 font-mono text-sm text-transparent pointer-events-none overflow-auto border border-transparent rounded-md"
                                    aria-hidden="true"
                                >
                                    {modalValue.split('\n').map((line, idx) => {
                                        const lineNumber = idx + 1;
                                        return (
                                            <div
                                                key={idx}
                                                className={`whitespace-pre ${
                                                    autoSageErrorLine === lineNumber ? 'bg-red-200 dark:bg-red-900/50' : ''
                                                }`}
                                            >
                                                {line || ' '}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Textarea */}
                                <textarea
                                    ref={autoSageTextareaRef}
                                    value={modalValue}
                                    onChange={handleAutoSageChange}
                                    onScroll={handleAutoSageScroll}
                                    rows={8}
                                    className="relative w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono z-10 min-h-[200px]"
                                    placeholder="Enter JSON payload here..."
                                />
                            </div>

                            {autoSageError && (
                                <div className="text-red-600 dark:text-red-400 text-xs whitespace-pre-wrap bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-2">
                                    {autoSageError}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </SolutionModal>
        </>
    );
};

export default ExpandableTextArea;