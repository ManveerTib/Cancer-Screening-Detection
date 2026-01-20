import React from 'react';
import { X, CheckCircle, Database, Activity, Hash, Shield } from 'lucide-react';
import { ProbationNode } from '../types';

interface IsQualifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: ProbationNode | null;
}

const IsQualifiedModal: React.FC<IsQualifiedModalProps> = ({ isOpen, onClose, node }) => {
  if (!isOpen || !node) return null;

  const isNullSession = node.tipNodeSessionId === '00000000-0000-0000-0000-000000000000';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
      <div className="modal-backdrop" onClick={onClose}></div>

      <div className="relative modal-content w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Qualification Summary
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">{node.nodeId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Qualification Status */}
            <div className={`p-4 rounded-lg border ${
              node.isQualified === 'Yes'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">QUALIFICATION STATUS</p>
                  <div className="flex items-center space-x-2">
                    {node.isQualified === 'Yes' ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">Qualified</span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <span className="text-lg font-semibold text-red-700 dark:text-red-400">Not Qualified</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Container Count */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center text-slate-900 dark:text-white">
                  <Hash className="w-4 h-4 mr-2" />
                  <h3 className="text-sm font-semibold">Container Information</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">CONTAINER COUNT</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{node.containerCount}</p>
              </div>
            </div>

            {/* Session Information */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center text-slate-900 dark:text-white">
                  <Database className="w-4 h-4 mr-2" />
                  <h3 className="text-sm font-semibold">Session Details</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">TIP NODE SESSION ID</p>
                  <div className={`p-3 rounded-lg border ${
                    isNullSession
                      ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}>
                    <p className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">
                      {node.tipNodeSessionId}
                    </p>
                    {!isNullSession && (
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active Session</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Node States */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center text-slate-600 dark:text-slate-400 text-xs font-medium mb-3">
                  <Activity className="w-3.5 h-3.5 mr-1.5" />
                  NODE AVAILABILITY STATE
                </div>
                <span className="badge-enhanced badge-status-info">
                  <Activity className="w-3.5 h-3.5 mr-1.5" />
                  {node.nodeAvailabilityState}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center text-slate-600 dark:text-slate-400 text-xs font-medium mb-3">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  NODE STATE
                </div>
                <span className="badge-enhanced badge-status-pass">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  {node.nodeState}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IsQualifiedModal;
