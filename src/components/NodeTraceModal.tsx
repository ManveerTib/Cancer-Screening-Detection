import React from 'react';
import { X, Clock, CheckCircle, AlertCircle, FileText, Package, XCircle } from 'lucide-react';
import { NodeTrace } from '../types';

interface NodeTraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  traces: NodeTrace[];
}

const NodeTraceModal: React.FC<NodeTraceModalProps> = ({ isOpen, onClose, nodeId, traces }) => {
  if (!isOpen) return null;

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'NodePicked':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'GDCOCreated':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'RTOCreated':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'FaultCodeFixAttempt':
      case 'FaultCodeFixAttempted':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'NodeResolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'NodeEscalated':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('success') || lowerStatus.includes('completed') || lowerStatus.includes('resolved')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    if (lowerStatus.includes('pending') || lowerStatus.includes('progress')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
    if (lowerStatus.includes('failed') || lowerStatus.includes('error') || lowerStatus.includes('escalated')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  const getActionTypeLabel = (actionType: string) => {
    switch (actionType) {
      case 'NodePicked':
        return 'Node Picked by AutoSage';
      case 'GDCOCreated':
        return 'GDCO Created';
      case 'RTOCreated':
        return 'RTO Created';
      case 'FaultCodeFixAttempt':
      case 'FaultCodeFixAttempted':
        return 'Fault Code Fix Attempted';
      case 'NodeResolved':
        return 'Node Resolved';
      case 'NodeEscalated':
        return 'Node Escalated';
      default:
        return actionType;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" aria-hidden="true"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div
          className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Trace Summary for Node {nodeId}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Complete automation history and actions performed by AutoSage
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {traces.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No traces found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No automation actions have been recorded for this node yet.
                </p>
              </div>
            ) : (
              <div className="mt-6">
                <ol className="relative border-l-2 border-gray-300 dark:border-gray-600 ml-3">
                  {traces.map((trace, index) => (
                    <li key={index} className="mb-8 ml-6">
                      <span className="absolute flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-800 rounded-full -left-4 ring-4 ring-white dark:ring-gray-800">
                        {getActionIcon(trace.ActionType)}
                      </span>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <time className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(trace.Timestamp).toLocaleString()}
                          </time>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(trace.Status)}`}>
                            {trace.Status}
                          </span>
                        </div>

                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                          {getActionTypeLabel(trace.ActionType)}
                        </h3>

                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                          {trace.ActionType === 'NodePicked' && (
                            <p>Node was automatically picked up by AutoSage automation system for processing.</p>
                          )}

                          {trace.GDCOId && trace.GDCOUrl && (
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-green-600" />
                              <span>GDCO ID: <strong>{trace.GDCOId}</strong></span>
                              <a
                                href={trace.GDCOUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                              >
                                Open GDCO
                              </a>
                            </div>
                          )}

                          {trace.RTOId && trace.RTOUrl && (
                            <div className="flex items-center space-x-2">
                              <Package className="w-4 h-4 text-purple-600" />
                              <span>RTO ID: <strong>{trace.RTOId}</strong></span>
                              <a
                                href={trace.RTOUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                              >
                                Open RTO
                              </a>
                            </div>
                          )}

                          {trace.OldFaultCode && trace.NewFaultCode && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-2">
                              <p className="font-medium">Fault Code Change:</p>
                              <p className="flex items-center space-x-2">
                                <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">{trace.OldFaultCode}</span>
                                <span>→</span>
                                <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">{trace.NewFaultCode}</span>
                              </p>
                            </div>
                          )}

                          {trace.LifecycleStatus && (
                            <div className="flex items-center space-x-2">
                              <span>Lifecycle Status:</span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(trace.LifecycleStatus)}`}>
                                {trace.LifecycleStatus}
                              </span>
                            </div>
                          )}

                          {trace.AutoSageStatus && (
                            <div className="flex items-center space-x-2">
                              <span>Autosage Status:</span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(trace.AutoSageStatus)}`}>
                                {trace.AutoSageStatus}
                              </span>
                            </div>
                          )}

                          {trace.Reason && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-2">
                              <p className="font-medium text-red-900 dark:text-red-200">Failure Reason:</p>
                              <p className="text-red-800 dark:text-red-300">{trace.Reason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeTraceModal;
