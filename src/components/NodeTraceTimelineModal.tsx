import React from 'react';
import { X, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { NodeTrace } from '../utils/mockNodeTraces';

interface NodeTraceTimelineModalProps {
    isOpen: boolean;
    onClose: () => void;
    nodeId: string;
    traces: NodeTrace[];
}

const NodeTraceTimelineModal: React.FC<NodeTraceTimelineModalProps> = ({
    isOpen,
    onClose,
    nodeId,
    traces
}) => {
    if (!isOpen) return null;

    const getStatusIcon = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('success') || statusLower.includes('completed') || statusLower.includes('resolved')) {
            return <CheckCircle className="w-5 h-5 text-green-600" />;
        } else if (statusLower.includes('failed') || statusLower.includes('error')) {
            return <XCircle className="w-5 h-5 text-red-600" />;
        } else if (statusLower.includes('pending') || statusLower.includes('progress')) {
            return <Clock className="w-5 h-5 text-yellow-600" />;
        }
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    };

    const getStatusBadgeColor = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('success') || statusLower.includes('completed') || statusLower.includes('resolved')) {
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        } else if (statusLower.includes('failed') || statusLower.includes('error')) {
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        } else if (statusLower.includes('pending') || statusLower.includes('awaiting')) {
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        } else if (statusLower.includes('progress')) {
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        } else if (statusLower.includes('skipped')) {
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
                    onClick={onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Trace Summary for Node {nodeId}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Chronological list of all AutoSage automation actions for this node
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 px-6 py-6 max-h-[600px] overflow-y-auto">
                        {traces.length === 0 ? (
                            <div className="text-center py-12">
                                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No traces found</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    No automation actions have been recorded for this node yet.
                                </p>
                            </div>
                        ) : (
                            <ol className="relative border-l-2 border-gray-300 dark:border-gray-600 ml-3">
                                {traces.map((trace, index) => (
                                    <li key={index} className="mb-8 ml-6">
                                        <span className="absolute flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-800 rounded-full -left-4 ring-4 ring-white dark:ring-gray-800">
                                            {getStatusIcon(trace.status)}
                                        </span>

                                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                                                    {trace.actionType}
                                                </h4>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(trace.status)}`}>
                                                    {trace.status}
                                                </span>
                                            </div>

                                            <time className="block mb-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                                <Clock className="inline w-4 h-4 mr-1" />
                                                {formatTimestamp(trace.timestamp)}
                                            </time>

                                            {trace.description && (
                                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                                    {trace.description}
                                                </p>
                                            )}

                                            {trace.gdcoUrl && (
                                                <div className="mt-2">
                                                    <a
                                                        href={trace.gdcoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        <ExternalLink className="w-4 h-4 mr-1" />
                                                        Open GDCO {trace.gdcoId}
                                                    </a>
                                                </div>
                                            )}

                                            {trace.rtoUrl && (
                                                <div className="mt-2">
                                                    <a
                                                        href={trace.rtoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        <ExternalLink className="w-4 h-4 mr-1" />
                                                        Open RTO {trace.rtoId}
                                                    </a>
                                                </div>
                                            )}

                                            {trace.oldFaultCode && trace.newFaultCode && (
                                                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700">
                                                    <p className="text-sm text-yellow-900 dark:text-yellow-200">
                                                        <strong>Fault Code Change:</strong> <code className="font-mono">{trace.oldFaultCode}</code> → <code className="font-mono">{trace.newFaultCode}</code>
                                                    </p>
                                                </div>
                                            )}

                                            {trace.reason && (
                                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-700">
                                                    <p className="text-sm text-red-900 dark:text-red-200">
                                                        <strong>Failure Reason:</strong> {trace.reason}
                                                    </p>
                                                </div>
                                            )}

                                            {trace.lifecycleStatus && (
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        <strong>Lifecycle Status:</strong> {trace.lifecycleStatus}
                                                    </p>
                                                </div>
                                            )}

                                            {trace.autoSageStatus && (
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        <strong>Autosage Status:</strong> {trace.autoSageStatus}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NodeTraceTimelineModal;
