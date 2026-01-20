import React from 'react';
import { X, Calendar, Activity, AlertCircle, CheckCircle, XCircle, Clock, Server, FileText, Settings, Wrench } from 'lucide-react';
import { ProbationNode } from '../types';

interface NodeSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: ProbationNode | null;
}

const NodeSummaryModal: React.FC<NodeSummaryModalProps> = ({ isOpen, onClose, node }) => {
  if (!isOpen || !node) return null;

  const faultCodeData = {
    code: 'FC-2024-1156',
    description: 'Memory ECC errors detected on DIMM slot 2. Multiple correctable errors reported indicating potential hardware degradation.',
    fixApplied: 'Replaced DIMM module in slot 2 with certified replacement. Updated BIOS firmware to latest version (v2.4.1). Ran memory diagnostics to verify stability.'
  };

  const getStatusIcon = (status: string | undefined) => {
    if (!status) return <Clock className="w-5 h-5 text-gray-400" />;
    if (status === 'Pass' || status === 'Completed' || status === 'Succeeded') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (status === 'Failed') {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Unknown</span>;
    if (status === 'Pass' || status === 'Completed' || status === 'Succeeded') {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Passed</span>;
    }
    if (status === 'Failed') {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Failed</span>;
    }
    return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</span>;
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full border border-gray-200 dark:border-gray-700">
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 px-6 py-5 border-b border-blue-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Node Summary Report</h3>
                  <p className="text-sm text-blue-100 mt-1">Comprehensive probation status and test results</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white/20 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3 mb-4">
                  <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Node Information</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Node ID</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{node.nodeId}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Tenant</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{node.tenant}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Status</p>
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                      node.nodeStatus === 'Production'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : node.nodeStatus === 'OFR'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      {node.nodeStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Generation</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">Gen {node.gen}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Device Type</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{node.deviceType}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Region</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{node.region}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Source Type</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{node.sourceType}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">SKU</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={node.sku}>{node.sku}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Model</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={node.model}>{node.model}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Probation Duration</h4>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Days in Probation</p>
                      <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{node.ageInProbation}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fallback Count</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{node.fallBackCountInProbation}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-xl p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Fault Code Analysis</h4>
                </div>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Fault Code</p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">{faultCodeData.code}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Issue Description</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{faultCodeData.description}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-3 mb-4">
                  <Wrench className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Fix Applied</h4>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{faultCodeData.fixApplied}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center space-x-3 mb-4">
                  <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Burn-in Test Results</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Test Status</p>
                      {getStatusIcon(node.burninRunStatus)}
                    </div>
                    {getStatusBadge(node.burninRunStatus)}
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Execution Time</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{node.burninExecutionTime || 'N/A'}</p>
                  </div>
                  {node.rtoIdForBurnin && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-700 md:col-span-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">RTO ID</p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">{node.rtoIdForBurnin}</p>
                    </div>
                  )}
                  {node.sentForBurninAt && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-700 md:col-span-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Sent For Burn-in</p>
                      <p className="text-sm text-gray-900 dark:text-white">{node.sentForBurninAt}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-3 mb-4">
                  <Settings className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">CRC Test Results</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Test Status</p>
                      {getStatusIcon(node.crcRunStatus)}
                    </div>
                    {getStatusBadge(node.crcRunStatus)}
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Execution Time</p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">{node.crcExecutionTime || 'N/A'}</p>
                  </div>
                  {node.crcExperimentName && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Experiment Name</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{node.crcExperimentName}</p>
                    </div>
                  )}
                  {node.crcExperimentId && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Experiment ID</p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">{node.crcExperimentId}</p>
                    </div>
                  )}
                  {node.rtoIdForCRC && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700 md:col-span-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">RTO ID</p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white">{node.rtoIdForCRC}</p>
                    </div>
                  )}
                  {node.sentForCRCAt && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700 md:col-span-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Sent For CRC</p>
                      <p className="text-sm text-gray-900 dark:text-white">{node.sentForCRCAt}</p>
                    </div>
                  )}
                  {node.crcWorkload && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700 md:col-span-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Workload</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{node.crcWorkload}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3 mb-4">
                  <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Probation Agent Status</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Agent Status</p>
                    <span className={`inline-flex px-3 py-1.5 text-sm font-bold rounded-full ${
                      node.probationAIAgentStatus === 'Completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : node.probationAIAgentStatus === 'Failed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {node.probationAIAgentStatus || 'In Progress'}
                    </span>
                  </div>
                  {node.probationAgentStarted && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Agent Started</p>
                      <p className="text-sm text-gray-900 dark:text-white">{node.probationAgentStarted}</p>
                    </div>
                  )}
                  {node.probationAgentEnded && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Agent Ended</p>
                      <p className="text-sm text-gray-900 dark:text-white">{node.probationAgentEnded}</p>
                    </div>
                  )}
                  {node.nodeStatusAfterBurninCRC && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status After Tests</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{node.nodeStatusAfterBurninCRC}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Print Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeSummaryModal;
