import React from 'react';
import { X, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ProbationNode, IncidentRecord } from '../types';

interface NodeTraceSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  node?: ProbationNode | null;
  incident?: IncidentRecord | null;
}

interface TimelineStage {
  stage: string;
  timestamp?: string;
  status: string;
  statusBadge?: 'success' | 'failed' | 'pending' | 'info';
  details: { label: string; value: string | undefined }[];
}

const NodeTraceSummaryModal: React.FC<NodeTraceSummaryModalProps> = ({ isOpen, onClose, node, incident }) => {
  if (!isOpen || (!node && !incident)) return null;

  const data = (node || incident) as any;

  const formatDateTime = (date: string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusBadgeClass = (type?: 'success' | 'failed' | 'pending' | 'info') => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800';
    }
  };

  const timeline: TimelineStage[] = [
    {
      stage: 'AutoSageFinalStage',
      timestamp: data.probationAgentEnded,
      status: data.probationAIAgentStatus || 'Completed',
      statusBadge: data.probationAIAgentStatus === 'Completed' ? 'success' : data.probationAIAgentStatus === 'Failed' ? 'failed' : 'pending',
      details: [
        { label: 'Lifecycle Status', value: data.nodeStatus },
        { label: 'Fault Code', value: '0' },
        { label: 'Health Grade', value: 'N/A' },
        { label: 'Node Final Status', value: data.nodeStatusAfterBurninCRC || 'N/A' },
        { label: 'AutoSage Status', value: data.probationAIAgentStatus || 'N/A' }
      ]
    },
    {
      stage: 'AutoSageProductionStage',
      timestamp: data.probationAgentEnded,
      status: data.nodeStatus === 'Production' ? 'Sent to Production' : 'Not Submitted',
      statusBadge: data.nodeStatus === 'Production' ? 'success' : 'info',
      details: [
        { label: 'Production Status', value: data.nodeStatus === 'Production' ? 'Pass' : 'N/A' },
        { label: 'RTO Id', value: data.rtoIdForCRC || data.rtoIdForBurnin || 'N/A' }
      ]
    },
    {
      stage: 'AutoSageCRCProcessingStage',
      timestamp: data.sentForCRCAt,
      status: data.crcRunStatus === 'Pass' ? 'CRC Passed' : data.crcRunStatus === 'Failed' ? 'CRC Failed' : 'CRC Not Submitted',
      statusBadge: data.crcRunStatus === 'Pass' ? 'success' : data.crcRunStatus === 'Failed' ? 'failed' : 'info',
      details: [
        { label: 'CRC Status', value: data.crcRunStatus || 'N/A' },
        { label: 'Experiment Name', value: data.crcExperimentName || 'N/A' },
        { label: 'Experiment Id', value: data.crcExperimentId || 'N/A' },
        { label: 'Execution Time', value: data.crcExecutionTime || 'N/A' }
      ]
    },
    {
      stage: 'AutoSageBurninProcessingStage',
      timestamp: data.sentForBurninAt,
      status: data.burninRunStatus === 'Pass' ? 'Burnin Passed' : data.burninRunStatus === 'Failed' ? 'Burnin Failed' : 'Burnin Not Submitted',
      statusBadge: data.burninRunStatus === 'Pass' ? 'success' : data.burninRunStatus === 'Failed' ? 'failed' : 'info',
      details: [
        { label: 'Burnin Status', value: data.burninRunStatus || 'N/A' },
        { label: 'RTO Id', value: data.rtoIdForBurnin || 'N/A' },
        { label: 'Execution Time', value: data.burninExecutionTime || 'N/A' }
      ]
    },
    {
      stage: 'AutoSageInitialStage',
      timestamp: data.probationAgentStarted,
      status: data.probationAIAgentStatus ? 'Picked by Probation Agent' : 'Not Submitted to AutoSage',
      statusBadge: data.probationAIAgentStatus ? 'info' : 'pending',
      details: [
        { label: 'Request Submitted By', value: 'N/A' },
        { label: 'Submitted Fault Code', value: '0' },
        { label: 'LifeCycle Stage', value: data.nodeStatus || 'Diagnostics' },
        { label: 'Health Grade', value: 'N/A' },
        { label: 'NodeId', value: data.nodeId }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
      <div className="modal-backdrop" onClick={onClose}></div>

      <div className="relative modal-content w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Trace Summary for Node {data.nodeId}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Complete automation history and actions performed by AutoSage
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {timeline.map((stage, index) => (
              <div key={index} className="relative">
                {/* Timeline vertical line */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-slate-300 dark:bg-slate-700"></div>
                )}

                {/* Timeline item */}
                <div className="flex gap-4">
                  {/* Timeline icon */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                  </div>

                  {/* Timeline content */}
                  <div className="flex-1 min-w-0">
                    {/* Timestamp and status badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(stage.timestamp)}</span>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold border ${getStatusBadgeClass(stage.statusBadge)}`}>
                        {stage.status}
                      </span>
                    </div>

                    {/* Stage name */}
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                      {stage.stage}
                    </h3>

                    {/* Stage details */}
                    {stage.details.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                        <div className="space-y-3">
                          {stage.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="flex justify-between items-start">
                              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                {detail.label}:
                              </span>
                              <span className="text-sm text-slate-900 dark:text-white font-mono text-right max-w-md break-all">
                                {detail.value || 'N/A'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#0078D4] hover:bg-[#106EBE] text-white font-semibold rounded-lg transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeTraceSummaryModal;
