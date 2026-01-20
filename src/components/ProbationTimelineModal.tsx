import React from 'react';
import { X, Clock, CheckCircle, XCircle, AlertCircle, Box } from 'lucide-react';
import { IncidentRecord, ProbationNode } from '../types';

interface ProbationTimelineModalProps {
    isOpen: boolean;
    onClose: () => void;
    incident?: IncidentRecord | null;
    node?: ProbationNode | null;
}

const ProbationTimelineModal: React.FC<ProbationTimelineModalProps> = ({
    isOpen,
    onClose,
    incident,
    node
}) => {
    if (!isOpen || (!incident && !node)) return null;

    const data = incident || node;

    return (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
                    onClick={onClose}
                />

                <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Node Trace Summary for Node {data.nodeId}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Complete automation history and actions performed by ProbationAIAgent
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mt-6 space-y-6 max-h-[600px] overflow-y-auto">
                            <div className="space-y-4">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900">
                                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                Probation Agent Started the Node Run At
                                            </h4>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            {data.probationAgentStarted || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900">
                                            <Box className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Sent for Burnin At
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            {data.sentForBurninAt || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900">
                                            <Box className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Sent for CRC Run At
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            {data.sentForCRCAt || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                CRC Execution Time
                                            </h5>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                                {data.crcExecutionTime || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                Burnin Execution Time
                                            </h5>
                                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                                                {data.burninExecutionTime || 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                CRC Run Status
                                            </h5>
                                            <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                data.crcRunStatus === 'Pass'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : data.crcRunStatus === 'Failed'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}>
                                                {data.crcRunStatus || 'Pending'}
                                            </span>
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                Burnin Run Status
                                            </h5>
                                            <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                data.burninRunStatus === 'Pass'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : data.burninRunStatus === 'Failed'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}>
                                                {data.burninRunStatus || 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                            data.nodeStatusAfterBurninCRC === 'Production'
                                                ? 'bg-green-100 dark:bg-green-900'
                                                : data.nodeStatusAfterBurninCRC === 'OFR'
                                                    ? 'bg-red-100 dark:bg-red-900'
                                                    : 'bg-blue-100 dark:bg-blue-900'
                                        }`}>
                                            {data.nodeStatusAfterBurninCRC === 'Production' ? (
                                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-300" />
                                            ) : data.nodeStatusAfterBurninCRC === 'OFR' ? (
                                                <XCircle className="w-5 h-5 text-red-600 dark:text-red-300" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Node Status After Burnin/CRC
                                        </h4>
                                        <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            data.nodeStatusAfterBurninCRC === 'Production'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : data.nodeStatusAfterBurninCRC === 'OFR'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                        }`}>
                                            {data.nodeStatusAfterBurninCRC || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                                        RTO & Experiment Details
                                    </h5>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">RTO ID for Burnin</p>
                                            <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                                                {data.rtoIdForBurnin || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">RTO ID for CRC</p>
                                            <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                                                {data.rtoIdForCRC || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">CRC Experiment ID</p>
                                            <p className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
                                                {data.crcExperimentId || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">CRC Experiment Name</p>
                                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                                {data.crcExperimentName || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700">
                                            <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Probation Agent Ended the Node Run At
                                        </h4>
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            {data.probationAgentEnded || 'In Progress'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProbationTimelineModal;
