import React, { useState } from 'react';
import { Search, FileX, CheckSquare, Square, Trash2, CheckCircle2 } from 'lucide-react';
import TableHeader, { SortDirection } from '../components/TableHeader';
import TablePagination from '../components/TablePagination';
import { useTableData } from '../hooks/useTableData';
import APIService, { NodeExclusionRequest } from '../services/APIService';

interface NodeData {
  id: string;
  nodeId: string;
  generation: number;
  sourceType: string;
  sku: string;
  model: string;
  region: string;
  selected?: boolean;
  reason?: string;
}

const ExclusionRequest: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [processingNodes, setProcessingNodes] = useState<Set<string>>(new Set());
  const [isBulkAddProcessing, setIsBulkAddProcessing] = useState(false);
  const [isBulkRemoveProcessing, setIsBulkRemoveProcessing] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkReason, setBulkReason] = useState('');
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);

  // Mock data for demonstration
  const mockNodeData: NodeData[] = [
    {
      id: '1',
      nodeId: 'NODE001',
      generation: 10,
      sourceType: 'Compute',
      sku: 'ERASSY-AZURE-COMPUTE-GP-MM-GEN10.2-INT',
      model: 'Lenovo-Azure-Compute-GP-MM-Intel-WCS',
      region: 'EastUS2'
    },
    {
      id: '2',
      nodeId: 'NODE002',
      generation: 7,
      sourceType: 'M-Series',
      sku: 'ERASSY-AZURE-COMPUTE-GP-MM-GEN7.1-INT',
      model: 'Lenovo-Azure-Compute-GP-MM-Intel-WCS',
      region: 'EastUS'
    },
    {
      id: '3',
      nodeId: 'NODE003',
      generation: 8,
      sourceType: 'Storage',
      sku: 'ERASSY-AZURE-STORAGE-GP-MM-GEN8.3-INT',
      model: 'Dell-Azure-Storage-GP-MM-Intel-WCS',
      region: 'WestUS'
    },
    {
      id: '4',
      nodeId: 'NODE004',
      generation: 10,
      sourceType: 'Compute',
      sku: 'ERASSY-AZURE-COMPUTE-GP-MM-GEN10.2-INT',
      model: 'HP-Azure-Compute-GP-MM-Intel-WCS',
      region: 'CentralUS'
    },
    {
      id: '5',
      nodeId: 'NODE005',
      generation: 9,
      sourceType: 'Network',
      sku: 'ERASSY-AZURE-NETWORK-GP-MM-GEN9.1-INT',
      model: 'Cisco-Azure-Network-GP-MM-Intel-WCS',
      region: 'WestUS2'
    }
  ];

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    sortConfig,
    handleSort,
    handlePageChange,
    resetPagination
  } = useTableData({
    data: nodes,
    initialItemsPerPage: 10
  });

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    setIsSearchLoading(true);

    // Simulate API call
    setTimeout(() => {
      const searchTerms = searchTerm.toLowerCase().split(',').map(term => term.trim());

      const results = mockNodeData.filter(node => {
        const nodeIdMatch = searchTerms.some(term =>
          node.nodeId.toLowerCase().includes(term)
        );
        const skuMatch = searchTerms.some(term =>
          node.sku.toLowerCase().includes(term)
        );
        const regionMatch = searchTerms.some(term =>
          node.region.toLowerCase().includes(term)
        );

        return nodeIdMatch || skuMatch || regionMatch;
      });

      setNodes(results);
      setIsSearchActive(true);
      setIsSearchLoading(false);
      setSelectedNodes(new Set());
      resetPagination();
    }, 800);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setNodes([]);
    setIsSearchActive(false);
    setSelectedNodes(new Set());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleNodeSelection = (nodeId: string) => {
    setSelectedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedNodes.size === paginatedData.length && paginatedData.length > 0) {
      setSelectedNodes(new Set());
    } else {
      setSelectedNodes(new Set(paginatedData.map(node => node.id)));
    }
  };

  const showAlert = (type: 'success' | 'error' | 'warning', message: string) => {
    setAlertMessage({ type, message });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const handleReasonChange = (nodeId: string, reason: string) => {
    setNodes(prev => prev.map(node =>
      node.id === nodeId ? { ...node, reason } : node
    ));
  };

  const handleAddExclusion = async (node: NodeData) => {
    if (!node.reason?.trim()) {
      showAlert('warning', 'Please provide a reason for exclusion');
      return;
    }

    setProcessingNodes(prev => new Set(prev).add(`add-${node.id}`));

    const exclusionData: NodeExclusionRequest = {
      nodeId: node.nodeId,
      generation: node.generation,
      sourceType: node.sourceType,
      sku: node.sku,
      model: node.model,
      region: node.region,
      reason: node.reason
    };

    try {
      const result = await APIService.addNodeExclusion(exclusionData);
      showAlert('success', 'Successful completions.');

      // Remove from list after successful addition
      setNodes(prev => prev.filter(n => n.id !== node.id));
      setSelectedNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(node.id);
        return newSet;
      });
    } catch (error) {
      showAlert('error', 'Error adding node to exclusion list');
      console.error(error);
    } finally {
      setProcessingNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(`add-${node.id}`);
        return newSet;
      });
    }
  };

  const handleRemoveExclusion = async (node: NodeData) => {
    setProcessingNodes(prev => new Set(prev).add(`remove-${node.id}`));

    const exclusionData: NodeExclusionRequest = {
      nodeId: node.nodeId,
      generation: node.generation,
      sourceType: node.sourceType,
      sku: node.sku,
      model: node.model,
      region: node.region
    };

    try {
      const result = await APIService.removeNodeExclusion(exclusionData);
      showAlert('success', 'Successful completions.');

      // Remove from list after successful removal
      setNodes(prev => prev.filter(n => n.id !== node.id));
      setSelectedNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(node.id);
        return newSet;
      });
    } catch (error) {
      showAlert('error', 'Error removing node from exclusion list');
      console.error(error);
    } finally {
      setProcessingNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(`remove-${node.id}`);
        return newSet;
      });
    }
  };

  const handleBulkExclusion = () => {
    if (selectedNodes.size === 0) return;
    setIsBulkModalOpen(true);
  };

  const handleBulkExclusionSubmit = async () => {
    if (!bulkReason.trim()) {
      showAlert('warning', 'Please provide a reason for bulk exclusion');
      return;
    }

    setIsBulkAddProcessing(true);

    const selectedNodesData = nodes.filter(node => selectedNodes.has(node.id));
    const exclusionRequests: NodeExclusionRequest[] = selectedNodesData.map(node => ({
      nodeId: node.nodeId,
      generation: node.generation,
      sourceType: node.sourceType,
      sku: node.sku,
      model: node.model,
      region: node.region,
      reason: bulkReason
    }));

    try {
      const result = await APIService.addBulkExclusion(exclusionRequests);

      // Remove from list after successful addition
      setNodes(prev => prev.filter(n => !selectedNodes.has(n.id)));
      setSelectedNodes(new Set());

      // Close modal and reset
      setIsBulkModalOpen(false);
      setBulkReason('');

      // Show success message
      showAlert('success', 'Successful completions.');
    } catch (error) {
      showAlert('error', 'Error adding nodes to exclusion list');
      console.error(error);
    } finally {
      setIsBulkAddProcessing(false);
    }
  };

  const handleCloseBulkModal = () => {
    setIsBulkModalOpen(false);
    setBulkReason('');
  };

  const handleBulkRemoval = async () => {
    if (selectedNodes.size === 0) return;

    setIsBulkRemoveProcessing(true);

    const selectedNodesData = nodes.filter(node => selectedNodes.has(node.id));
    const exclusionRequests: NodeExclusionRequest[] = selectedNodesData.map(node => ({
      nodeId: node.nodeId,
      generation: node.generation,
      sourceType: node.sourceType,
      sku: node.sku,
      model: node.model,
      region: node.region
    }));

    try {
      const result = await APIService.removeBulkExclusion(exclusionRequests);
      showAlert('success', 'Successful completions.');

      // Remove from list after successful removal
      setNodes(prev => prev.filter(n => !selectedNodes.has(n.id)));
      setSelectedNodes(new Set());
    } catch (error) {
      showAlert('error', 'Error removing nodes from exclusion list');
      console.error(error);
    } finally {
      setIsBulkRemoveProcessing(false);
    }
  };

  const allSelected = paginatedData.length > 0 && paginatedData.every(node => selectedNodes.has(node.id));
  const someSelected = paginatedData.some(node => selectedNodes.has(node.id)) && !allSelected;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <FileX className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Exclusion Request</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Search and add nodes to the exclusion list
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Search Nodes</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Find nodes by Node ID, SKU, or Region (comma-separated)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Node ID, SKU, Region (Comma-Separated)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSearch}
              disabled={!searchTerm.trim() || isSearchLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-[#0078D4] text-white rounded-lg hover:bg-[#106EBE] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSearchLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </>
              )}
            </button>
            {isSearchActive && (
              <button
                onClick={handleClearSearch}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {isSearchActive && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mt-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Search Results:</strong> Found {nodes.length} node{nodes.length !== 1 ? 's' : ''}
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedNodes.size > 1 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {selectedNodes.size} node{selectedNodes.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkExclusion}
              disabled={isBulkAddProcessing || isBulkRemoveProcessing}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isBulkAddProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Add Bulk Exclusion ({selectedNodes.size})</span>
                </>
              )}
            </button>
            <button
              onClick={handleBulkRemoval}
              disabled={isBulkAddProcessing || isBulkRemoveProcessing}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isBulkRemoveProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Remove Bulk Exclusion ({selectedNodes.size})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Results Table */}
      {isSearchActive && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {nodes.length === 0 ? (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No nodes found matching your search criteria.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={toggleSelectAll}
                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                          >
                            {allSelected ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : someSelected ? (
                              <Square className="w-5 h-5 fill-current" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                          <span className="text-[10px]">Select</span>
                        </div>
                      </th>
                      <TableHeader
                        label="Node"
                        sortKey="nodeId"
                        currentSort={sortConfig?.key}
                        currentDirection={sortConfig?.direction as SortDirection}
                        onSort={handleSort}
                      />
                      <TableHeader
                        label="Gen"
                        sortKey="generation"
                        currentSort={sortConfig?.key}
                        currentDirection={sortConfig?.direction as SortDirection}
                        onSort={handleSort}
                      />
                      <TableHeader
                        label="Device Type"
                        sortKey="sourceType"
                        currentSort={sortConfig?.key}
                        currentDirection={sortConfig?.direction as SortDirection}
                        onSort={handleSort}
                      />
                      <TableHeader
                        label="SKU"
                        sortKey="sku"
                        currentSort={sortConfig?.key}
                        currentDirection={sortConfig?.direction as SortDirection}
                        onSort={handleSort}
                      />
                      <TableHeader
                        label="Model"
                        sortKey="model"
                        currentSort={sortConfig?.key}
                        currentDirection={sortConfig?.direction as SortDirection}
                        onSort={handleSort}
                      />
                      <TableHeader
                        label="Region"
                        sortKey="region"
                        currentSort={sortConfig?.key}
                        currentDirection={sortConfig?.direction as SortDirection}
                        onSort={handleSort}
                      />
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <span className="text-red-600 dark:text-red-400">* </span>Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedData.map((node) => (
                      <tr
                        key={node.id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          selectedNodes.has(node.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleNodeSelection(node.id)}
                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                          >
                            {selectedNodes.has(node.id) ? (
                              <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {node.nodeId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {node.generation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {node.sourceType}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="max-w-xs truncate" title={node.sku}>
                            {node.sku}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="max-w-xs truncate" title={node.model}>
                            {node.model}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {node.region}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <textarea
                            value={node.reason || ''}
                            onChange={(e) => handleReasonChange(node.id, e.target.value)}
                            placeholder="Enter reason for exclusion..."
                            rows={2}
                            className="w-80 min-w-[320px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAddExclusion(node)}
                              disabled={processingNodes.has(`add-${node.id}`) || processingNodes.has(`remove-${node.id}`)}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-xs font-medium min-w-[85px]"
                            >
                              {processingNodes.has(`add-${node.id}`) ? (
                                <span className="flex items-center justify-center gap-1">
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Processing
                                </span>
                              ) : (
                                'Add'
                              )}
                            </button>
                            <button
                              onClick={() => handleRemoveExclusion(node)}
                              disabled={processingNodes.has(`add-${node.id}`) || processingNodes.has(`remove-${node.id}`)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-xs font-medium min-w-[85px]"
                            >
                              {processingNodes.has(`remove-${node.id}`) ? (
                                <span className="flex items-center justify-center gap-1">
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Processing
                                </span>
                              ) : (
                                'Remove'
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Bulk Exclusion Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Bulk Node Exclusion
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Provide a reason for excluding {selectedNodes.size} node{selectedNodes.size !== 1 ? 's' : ''}
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span className="text-red-600 dark:text-red-400">* </span>Reason for Node Exclusion
                </label>
                <textarea
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  placeholder="Enter the reason for bulk exclusion..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCloseBulkModal}
                  disabled={isBulkAddProcessing}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkExclusionSubmit}
                  disabled={isBulkAddProcessing || !bulkReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium min-w-[100px]"
                >
                  {isBulkAddProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing
                    </span>
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alert Notification */}
      {alertMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none animate-fade-in">
          <div
            className={`rounded-lg p-6 shadow-2xl flex items-center gap-3 pointer-events-auto ${
              alertMessage.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
                : alertMessage.type === 'error'
                ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700'
                : 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700'
            }`}
          >
            {alertMessage.type === 'success' && (
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            )}
            {alertMessage.type === 'error' && (
              <FileX className="w-6 h-6 text-red-600 dark:text-red-400" />
            )}
            {alertMessage.type === 'warning' && (
              <FileX className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            )}
            <p
              className={`text-base font-medium ${
                alertMessage.type === 'success'
                  ? 'text-green-700 dark:text-green-300'
                  : alertMessage.type === 'error'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-amber-700 dark:text-amber-300'
              }`}
            >
              {alertMessage.type === 'success' ? 'Successful completions.' : alertMessage.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExclusionRequest;
