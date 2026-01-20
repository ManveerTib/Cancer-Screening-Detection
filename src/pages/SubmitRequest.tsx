import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown, HelpCircle, CheckSquare, Square, Plus, X, Minus, FileText } from 'lucide-react';
import { ProbationNode } from '../types';
import TableHeader from '../components/TableHeader';
import TablePagination from '../components/TablePagination';
import ColumnSelector from '../components/ColumnSelector';
import NodeTraceSummaryModal from '../components/NodeTraceSummaryModal';
import IsQualifiedModal from '../components/IsQualifiedModal';
import NodeSummaryModal from '../components/NodeSummaryModal';
import { useTableData } from '../hooks/useTableData';
import { useColumnVisibility } from '../hooks/useColumnVisibility';
import { mockProbationNodes } from '../utils/mockProbationData';

interface FilterClause {
  id: string;
  logicOperator: 'AND' | 'OR';
  field: string;
  operator: string;
  value: string;
}

const SubmitRequest: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [nodes, setNodes] = useState<ProbationNode[]>(mockProbationNodes);
  const [filteredNodes, setFilteredNodes] = useState<ProbationNode[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedNodeForTrace, setSelectedNodeForTrace] = useState<ProbationNode | null>(null);
  const [selectedNodeForQualified, setSelectedNodeForQualified] = useState<ProbationNode | null>(null);
  const [selectedNodeForSummary, setSelectedNodeForSummary] = useState<ProbationNode | null>(null);
  const [isTraceSummaryModalOpen, setIsTraceSummaryModalOpen] = useState(false);
  const [isQualifiedModalOpen, setIsQualifiedModalOpen] = useState(false);
  const [isNodeSummaryModalOpen, setIsNodeSummaryModalOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [filterClauses, setFilterClauses] = useState<FilterClause[]>([
    { id: '1', logicOperator: 'AND', field: '', operator: '==', value: '' }
  ]);
  const [alertMessage, setAlertMessage] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);
  const [isBulkSearch, setIsBulkSearch] = useState(false);
  const [bulkSearchText, setBulkSearchText] = useState('');

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    sortConfig,
    filters,
    handleSort,
    handleSortAsc,
    handleSortDesc,
    handleClearSort,
    handleFilter,
    handlePageChange,
  } = useTableData({ data: isSearchActive ? filteredNodes : nodes, itemsPerPage: 10 });

  const { columns, toggleColumn, isColumnVisible } = useColumnVisibility({
    initialColumns: [
      { key: 'expand', label: 'Expand', visible: true },
      { key: 'select', label: 'Select', visible: true },
      { key: 'nodeId', label: 'NodeId', visible: true },
      { key: 'tenant', label: 'Tenant', visible: true },
      { key: 'sourceType', label: 'SourceType', visible: true },
      { key: 'gen', label: 'Gen', visible: true },
      { key: 'deviceType', label: 'DeviceType', visible: true },
      { key: 'crcWorkload', label: 'CRC Workload', visible: true },
      { key: 'nodeStatus', label: 'Node Status', visible: true },
      { key: 'probationAIAgentStatus', label: 'Agent Status', visible: true },
      { key: 'testInProbation', label: 'Test Run', visible: true },
    ],
    storageKey: 'submitRequest-columns'
  });

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setAlertMessage({ type, message });
    setTimeout(() => setAlertMessage(null), 5000);
  };

  const toggleRowExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedRows(newExpanded);
  };

  const performSearch = async () => {
    setIsSearchLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (isBulkSearch) {
      if (!bulkSearchText.trim()) {
        setFilteredNodes([]);
        setIsSearchActive(false);
        setIsSearchLoading(false);
        return;
      }

      const nodeIds = bulkSearchText
        .split(/[\n,]+/)
        .map(id => id.trim())
        .filter(id => id.length > 0);

      if (nodeIds.length === 0) {
        setFilteredNodes([]);
        setIsSearchActive(false);
        setIsSearchLoading(false);
        showAlert('warning', 'Please enter at least one Node ID');
        return;
      }

      const results = nodes.filter(node => {
        return nodeIds.some(id =>
          node.nodeId.toLowerCase().includes(id.toLowerCase())
        );
      });

      setFilteredNodes(results);
      setIsSearchActive(true);
      setIsSearchLoading(false);

      if (results.length === 0) {
        showAlert('info', `No nodes found matching ${nodeIds.length} search term${nodeIds.length !== 1 ? 's' : ''}`);
      } else {
        showAlert('success', `Found ${results.length} node${results.length !== 1 ? 's' : ''} matching your bulk search`);
      }
    } else {
      if (!searchTerm.trim()) {
        setFilteredNodes([]);
        setIsSearchActive(false);
        setIsSearchLoading(false);
        return;
      }

      const results = nodes.filter(node => {
        const lowerTerm = searchTerm.toLowerCase();
        return node.nodeId.toLowerCase().includes(lowerTerm);
      });

      setFilteredNodes(results);
      setIsSearchActive(true);
      setIsSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setBulkSearchText('');
    setFilteredNodes([]);
    setIsSearchActive(false);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredNodes([]);
      setIsSearchActive(false);
    }
  };

  const addFilterClause = () => {
    const newClause: FilterClause = {
      id: Date.now().toString(),
      logicOperator: 'AND',
      field: '',
      operator: '==',
      value: ''
    };
    setFilterClauses([...filterClauses, newClause]);
  };

  const removeFilterClause = (id: string) => {
    if (filterClauses.length > 1) {
      setFilterClauses(filterClauses.filter(clause => clause.id !== id));
    }
  };

  const updateFilterClause = (id: string, field: keyof FilterClause, value: string) => {
    setFilterClauses(filterClauses.map(clause =>
      clause.id === id ? { ...clause, [field]: value } : clause
    ));
  };

  const applyAdvancedFilter = () => {
    const validClauses = filterClauses.filter(c => c.field && c.value);

    if (validClauses.length === 0) {
      setFilteredNodes([]);
      setIsSearchActive(false);
      return;
    }

    const results = nodes.filter(node => {
      let result = true;
      let currentLogic: 'AND' | 'OR' = 'AND';

      for (let i = 0; i < validClauses.length; i++) {
        const clause = validClauses[i];
        const fieldValue = (node as any)[clause.field]?.toString().toLowerCase() || '';
        const filterValue = clause.value.toLowerCase();

        let clauseResult = false;

        switch (clause.operator) {
          case '==':
            clauseResult = fieldValue === filterValue;
            break;
          case '!=':
            clauseResult = fieldValue !== filterValue;
            break;
          case 'In':
            const inValues = filterValue.split(',').map(v => v.trim().replace(/['"]/g, ''));
            clauseResult = inValues.some(v => fieldValue === v);
            break;
          case '!In':
            const notInValues = filterValue.split(',').map(v => v.trim().replace(/['"]/g, ''));
            clauseResult = !notInValues.some(v => fieldValue === v);
            break;
          case 'Contains':
            clauseResult = fieldValue.includes(filterValue);
            break;
          case '!Contains':
            clauseResult = !fieldValue.includes(filterValue);
            break;
          case 'Prefix':
            clauseResult = fieldValue.startsWith(filterValue);
            break;
          case 'Suffix':
            clauseResult = fieldValue.endsWith(filterValue);
            break;
        }

        if (i === 0) {
          result = clauseResult;
        } else {
          if (currentLogic === 'AND') {
            result = result && clauseResult;
          } else {
            result = result || clauseResult;
          }
        }

        currentLogic = clause.logicOperator;
      }

      return result;
    });

    setFilteredNodes(results);
    setIsSearchActive(true);
  };

  const clearAdvancedFilter = () => {
    setFilterClauses([{ id: '1', logicOperator: 'AND', field: '', operator: '==', value: '' }]);
    setFilteredNodes([]);
    setIsSearchActive(false);
  };

  const toggleNodeSelection = (nodeId: string) => {
    const updateNodes = (nodesList: ProbationNode[]) =>
      nodesList.map(node =>
        node.id === nodeId ? { ...node, selected: !node.selected } : node
      );

    setNodes(updateNodes);
    if (isSearchActive) {
      setFilteredNodes(updateNodes);
    }
  };

  const toggleSelectAll = () => {
    const dataSource = isSearchActive ? filteredNodes : nodes;
    const eligibleNodes = dataSource.filter(node =>
      node.isQualified === 'Yes' && node.probationAIAgentStatus !== 'In Progress'
    );
    const allEligibleSelected = eligibleNodes.every(node => node.selected);

    const updateNodes = (nodesList: ProbationNode[]) =>
      nodesList.map(node => {
        const isEligible = node.isQualified === 'Yes' && node.probationAIAgentStatus !== 'In Progress';
        if (isEligible) {
          return { ...node, selected: !allEligibleSelected };
        }
        return node;
      });

    setNodes(updateNodes);
    if (isSearchActive) {
      setFilteredNodes(updateNodes);
    }
  };

  const handleNodeClick = (node: ProbationNode) => {
    setSelectedNodeForTrace(node);
    setIsTraceSummaryModalOpen(true);
  };

  const handleQualifiedClick = (node: ProbationNode) => {
    setSelectedNodeForQualified(node);
    setIsQualifiedModalOpen(true);
  };

  const handleSummaryClick = (node: ProbationNode) => {
    setSelectedNodeForSummary(node);
    setIsNodeSummaryModalOpen(true);
  };

  const handleTestInProbation = (nodeId: string) => {
    showAlert('success', `Successful completions.`);
  };

  const handleCRCWorkloadChange = (nodeId: string, workload: 'Select All' | 'CoreMark' | 'Prime95') => {
    const updateNodes = (nodesList: ProbationNode[]) =>
      nodesList.map(node =>
        node.id === nodeId ? { ...node, crcWorkload: workload } : node
      );

    setNodes(updateNodes);
    if (isSearchActive) {
      setFilteredNodes(updateNodes);
    }
  };

  const displayData = paginatedData;
  const showNoResults = isSearchActive && filteredNodes.length === 0;
  const totalDisplayItems = isSearchActive ? filteredNodes.length : nodes.length;

  const dataSource = isSearchActive ? filteredNodes : nodes;
  const eligibleNodesAll = dataSource.filter(node =>
    node.isQualified === 'Yes' && node.probationAIAgentStatus !== 'In Progress'
  );
  const allSelected = eligibleNodesAll.length > 0 && eligibleNodesAll.every(node => node.selected);
  const someSelected = eligibleNodesAll.some(node => node.selected) && !allSelected;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Submit for Testing</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select nodes and submit for Probation Test runs
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Search</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {isBulkSearch ? 'Paste multiple Node IDs (comma or newline separated)' : 'Find nodes by Node ID, Tenant, or Fault Code'}
            </p>
          </div>
        </div>

        {!isAdvancedOpen && (
        <>
          <div className="mb-4">
            <button
              onClick={() => {
                setIsBulkSearch(!isBulkSearch);
                clearSearch();
              }}
              className="text-sm text-[#0078D4] dark:text-[#479EF5] hover:text-[#106EBE] dark:hover:text-[#70B7FF] font-medium flex items-center gap-2 transition-colors"
            >
              <div className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                isBulkSearch ? 'bg-[#0078D4]' : 'bg-gray-300 dark:bg-gray-600'
              }`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                  isBulkSearch ? 'translate-x-5' : 'translate-x-0'
                }`}></div>
              </div>
              <span>Bulk Search Mode</span>
            </button>
          </div>

          {isBulkSearch ? (
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  placeholder="Paste Node IDs here (comma or newline separated)&#10;Example:&#10;NODE-001&#10;NODE-002, NODE-003&#10;NODE-004"
                  value={bulkSearchText}
                  onChange={(e) => setBulkSearchText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono resize-y min-h-[120px]"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={performSearch}
                  disabled={!bulkSearchText.trim() || isSearchLoading}
                  className="btn-primary-enhanced disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
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
                    onClick={clearSearch}
                    className="btn-secondary"
                  >
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search By Node Id, Tenant, Fault Code (Comma-Separated).."
                  value={searchTerm}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                  className="input-enhanced pl-10"
                />
              </div>
              <div className="flex space-x-3">
              <button
                onClick={performSearch}
                disabled={!searchTerm.trim() || isSearchLoading}
                className="btn-primary-enhanced disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
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
                  onClick={clearSearch}
                  className="btn-secondary"
                >
                  <span>Clear</span>
                </button>
              )}
              </div>
            </div>
          )}
        </>
      )}

      <div className="space-y-2 mt-4">
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="text-[#0078D4] dark:text-[#479EF5] hover:text-[#106EBE] dark:hover:text-[#70B7FF] text-sm font-medium flex items-center gap-1 transition-colors"
        >
          {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Advanced
        </button>

        {isAdvancedOpen && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Advanced Filter</h3>
              <div className="flex gap-2">
                <button
                  onClick={applyAdvancedFilter}
                  className="px-3 py-1.5 bg-gradient-to-r from-[#0078D4] to-[#106EBE] hover:from-[#106EBE] hover:to-[#005A9E] text-white text-sm rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1"
                >
                  <Search className="w-3.5 h-3.5" />
                  Apply Filter
                </button>
                <button
                  onClick={clearAdvancedFilter}
                  className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg font-medium transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {filterClauses.map((clause, index) => (
                <div key={clause.id} className="flex items-center gap-2">
                  {index > 0 && (
                    <select
                      value={clause.logicOperator}
                      onChange={(e) => updateFilterClause(clause.id, 'logicOperator', e.target.value)}
                      className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="AND">And</option>
                      <option value="OR">Or</option>
                    </select>
                  )}
                  {index === 0 && <div className="w-16"></div>}

                  <select
                    value={clause.field}
                    onChange={(e) => updateFilterClause(clause.id, 'field', e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Field</option>
                    <option value="nodeId">Node Id</option>
                    <option value="tenant">Tenant</option>
                    <option value="faultCode">Fault Code</option>
                    <option value="nodeStatus">Node Status</option>
                    <option value="sourceType">Source Type</option>
                    <option value="isQualified">Is Qualified</option>
                    <option value="probationAIAgentStatus">Agent Status</option>
                  </select>

                  <select
                    value={clause.operator}
                    onChange={(e) => updateFilterClause(clause.id, 'operator', e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="==">==(Equals)</option>
                    <option value="!=">!=(Not Equals)</option>
                    <option value="In">In</option>
                    <option value="!In">!In(Not In)</option>
                    <option value="Contains">Contains</option>
                    <option value="!Contains">!Contains</option>
                    <option value="Prefix">Prefix</option>
                    <option value="Suffix">Suffix</option>
                  </select>

                  <input
                    type="text"
                    value={clause.value}
                    onChange={(e) => updateFilterClause(clause.id, 'value', e.target.value)}
                    placeholder="Enter value..."
                    className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  <button
                    onClick={() => removeFilterClause(clause.id)}
                    disabled={filterClauses.length === 1}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Remove clause"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addFilterClause}
              className="text-[#0078D4] dark:text-[#479EF5] hover:text-[#106EBE] dark:hover:text-[#70B7FF] text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add new clause
            </button>
          </div>
        )}
      </div>

      {isSearchActive && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4 animate-slide-up">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong className="font-semibold">Search Results:</strong> Found {filteredNodes.length} record{filteredNodes.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>
      )}
      </div>

      <div className="flex items-start gap-4">
        <div className="card-enhanced overflow-hidden flex-1">
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="w-full flex items-center justify-between px-6 py-4 text-left bg-gradient-to-r from-[#0078D4] to-[#106EBE] dark:from-[#005A9E] dark:to-[#004578] hover:from-[#106EBE] hover:to-[#005A9E] dark:hover:from-[#004578] dark:hover:to-[#003655] transition-all duration-200"
          >
            <span className="text-lg font-semibold text-white">Node Submission Summary (Click to expand)</span>
            {showSummary ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
          </button>
          {showSummary && (
            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted for Probation Run</h3>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{dataSource.filter(n => n.selected).length}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                        <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Processed By Agent</h3>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{dataSource.filter(n => n.probationAIAgentStatus).length}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Success By Agent</h3>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{dataSource.filter(n => n.probationAIAgentStatus === 'Completed').length}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed By Agent</h3>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{dataSource.filter(n => n.probationAIAgentStatus === 'Failed').length}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          <ColumnSelector columns={columns} onColumnToggle={toggleColumn} />
        </div>
      </div>

      <div className="table-enhanced">
        {totalDisplayItems === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No records found.</p>
          </div>
        ) : showNoResults ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No Record Found!</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto min-h-[500px] relative">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-[90]">
                  <tr>
                    {isColumnVisible('expand') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                      </th>
                    )}
                    {isColumnVisible('select') && (
                      <th className="px-6 py-3 text-left w-12">
                        <button
                          onClick={toggleSelectAll}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        >
                          {allSelected ? (
                            <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          ) : someSelected ? (
                            <div className="w-5 h-5 border-2 border-blue-600 dark:border-blue-400 rounded bg-blue-100 dark:bg-blue-900" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </th>
                    )}
                    {isColumnVisible('nodeId') && (
                      <TableHeader
                        title="NodeId"
                        sortable
                        filterable
                        sortDirection={sortConfig.key === 'nodeId' ? sortConfig.direction : null}
                        filterValue={filters.nodeId || ''}
                        onSort={() => handleSort('nodeId')}
                        onSortAsc={() => handleSortAsc('nodeId')}
                        onSortDesc={() => handleSortDesc('nodeId')}
                        onClearSort={handleClearSort}
                        onFilterChange={(value) => handleFilter('nodeId', value)}
                      />
                    )}
                    {isColumnVisible('tenant') && (
                      <TableHeader
                        title="Tenant"
                        sortable
                        filterable
                        sortDirection={sortConfig.key === 'tenant' ? sortConfig.direction : null}
                        filterValue={filters.tenant || ''}
                        onSort={() => handleSort('tenant')}
                        onSortAsc={() => handleSortAsc('tenant')}
                        onSortDesc={() => handleSortDesc('tenant')}
                        onClearSort={handleClearSort}
                        onFilterChange={(value) => handleFilter('tenant', value)}
                      />
                    )}
                    {isColumnVisible('sourceType') && (
                      <TableHeader
                        title="SourceType"
                        sortable
                        filterable
                        sortDirection={sortConfig.key === 'sourceType' ? sortConfig.direction : null}
                        filterValue={filters.sourceType || ''}
                        onSort={() => handleSort('sourceType')}
                        onSortAsc={() => handleSortAsc('sourceType')}
                        onSortDesc={() => handleSortDesc('sourceType')}
                        onClearSort={handleClearSort}
                        onFilterChange={(value) => handleFilter('sourceType', value)}
                      />
                    )}
                    {isColumnVisible('gen') && (
                      <TableHeader
                        title="Gen"
                        sortable
                        filterable
                        sortDirection={sortConfig.key === 'gen' ? sortConfig.direction : null}
                        filterValue={filters.gen || ''}
                        onSort={() => handleSort('gen')}
                        onSortAsc={() => handleSortAsc('gen')}
                        onSortDesc={() => handleSortDesc('gen')}
                        onClearSort={handleClearSort}
                        onFilterChange={(value) => handleFilter('gen', value)}
                      />
                    )}
                    {isColumnVisible('deviceType') && (
                      <TableHeader
                        title="DeviceType"
                        sortable
                        filterable
                        sortDirection={sortConfig.key === 'deviceType' ? sortConfig.direction : null}
                        filterValue={filters.deviceType || ''}
                        onSort={() => handleSort('deviceType')}
                        onSortAsc={() => handleSortAsc('deviceType')}
                        onSortDesc={() => handleSortDesc('deviceType')}
                        onClearSort={handleClearSort}
                        onFilterChange={(value) => handleFilter('deviceType', value)}
                      />
                    )}
                    {isColumnVisible('crcWorkload') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        CRC Workload
                      </th>
                    )}
                    {isColumnVisible('nodeStatus') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Node Status
                      </th>
                    )}
                    {isColumnVisible('probationAIAgentStatus') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Agent Status
                      </th>
                    )}
                    {isColumnVisible('testInProbation') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Test Run
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {displayData.length === 0 ? (
                    <tr>
                      <td colSpan={Object.keys(columns).filter(key => isColumnVisible(key)).length} className="px-6 py-20 text-center">
                        <p className="text-gray-500 dark:text-gray-400">No records found.</p>
                      </td>
                    </tr>
                  ) : (
                    displayData.map((node) => (
                    <React.Fragment key={node.id}>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-200 dark:border-slate-700">
                        {isColumnVisible('expand') && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleRowExpansion(node.id)}
                                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors text-blue-600 dark:text-blue-400"
                                title="Expand Details"
                              >
                                {expandedRows.has(node.id) ? (
                                  <Minus className="w-5 h-5" />
                                ) : (
                                  <Plus className="w-5 h-5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleSummaryClick(node)}
                                className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors text-green-600 dark:text-green-400"
                                title="View Node Summary"
                              >
                                <FileText className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        )}
                        {isColumnVisible('select') && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleNodeSelection(node.id)}
                              disabled={node.isQualified === 'No'}
                              className={`p-1 rounded transition-colors ${
                                node.isQualified === 'No'
                                  ? 'cursor-not-allowed opacity-40'
                                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                              title={node.isQualified === 'No' ? 'Node is not qualified for selection' : ''}
                            >
                              {node.selected ? (
                                <CheckSquare className={`w-5 h-5 ${
                                  node.isQualified === 'No'
                                    ? 'text-gray-400 dark:text-gray-600'
                                    : 'text-blue-600 dark:text-blue-400'
                                }`} />
                              ) : (
                                <Square className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                          </td>
                        )}
                        {isColumnVisible('nodeId') && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleNodeClick(node)}
                              className="link-enhanced text-base font-semibold"
                            >
                              {node.nodeId}
                            </button>
                          </td>
                        )}
                        {isColumnVisible('tenant') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {node.tenant}
                          </td>
                        )}
                        {isColumnVisible('sourceType') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {node.sourceType}
                          </td>
                        )}
                        {isColumnVisible('gen') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {node.gen}
                          </td>
                        )}
                        {isColumnVisible('deviceType') && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {node.deviceType}
                          </td>
                        )}
                        {isColumnVisible('crcWorkload') && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={node.crcWorkload || 'Select All'}
                              onChange={(e) => handleCRCWorkloadChange(node.id, e.target.value as 'Select All' | 'CoreMark' | 'Prime95')}
                              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="Select All">Select All</option>
                              <option value="CoreMark">CoreMark</option>
                              <option value="Prime95">Prime95</option>
                            </select>
                          </td>
                        )}
                        {isColumnVisible('nodeStatus') && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              node.nodeStatus === 'Production'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : node.nodeStatus === 'OFR'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {node.nodeStatus}
                            </span>
                          </td>
                        )}
                        {isColumnVisible('probationAIAgentStatus') && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              node.probationAIAgentStatus === 'Completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : node.probationAIAgentStatus === 'Failed'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {node.probationAIAgentStatus || 'In Progress'}
                            </span>
                          </td>
                        )}
                        {isColumnVisible('testInProbation') && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleTestInProbation(node.nodeId)}
                              disabled={node.isQualified === 'No' || node.probationAIAgentStatus === 'In Progress'}
                              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                                (node.isQualified === 'No' || node.probationAIAgentStatus === 'In Progress')
                                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-500 cursor-not-allowed opacity-50'
                                  : 'bg-gradient-to-r from-[#0078D4] to-[#106EBE] hover:from-[#106EBE] hover:to-[#005A9E] text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                              }`}
                              title={
                                node.isQualified === 'No'
                                  ? 'Node is not qualified for testing'
                                  : node.probationAIAgentStatus === 'In Progress'
                                    ? 'Test disabled while Agent is in progress'
                                    : 'Run Test'
                              }
                            >
                              Run Test
                            </button>
                          </td>
                        )}
                      </tr>

                      {expandedRows.has(node.id) && (
                        <tr className="relative animate-slide-down">
                          <td colSpan={100} className="px-0 py-4 relative bg-blue-50 dark:bg-blue-950/40">
                            <div className="absolute left-[42px] top-0 bottom-0 w-[2px] bg-blue-400 dark:bg-blue-500"></div>
                            <div className="absolute left-[42px] top-1/2 w-[70px] h-[2px] bg-blue-400 dark:bg-blue-500"></div>
                            <div className="ml-28 mr-6">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                  </svg>
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Node Details</h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Node Id: {node.nodeId}</p>
                                </div>
                              </div>

                              <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800 overflow-hidden shadow-lg">
                                <table className="w-full">
                                  <thead className="bg-blue-100 dark:bg-blue-900/30">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Node ID</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">IsQualified</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Model</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">SKU</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Region</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">ProbationFallBack</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">AgeInProbation</th>
                                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Node Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-t border-blue-200 dark:border-blue-800">
                                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">{node.nodeId}</td>
                                      <td className="px-4 py-3 text-sm">
                                        <button
                                          onClick={() => handleQualifiedClick(node)}
                                          className="link-enhanced font-semibold"
                                        >
                                          {node.isQualified}
                                        </button>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        <div className="max-w-xs truncate" title={node.model}>
                                          {node.model}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        <div className="max-w-xs truncate" title={node.sku}>
                                          {node.sku}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{node.region}</td>
                                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{node.fallBackCountInProbation}</td>
                                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{node.ageInProbation} days</td>
                                      <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                          node.nodeStatus === 'Production'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : node.nodeStatus === 'OFR'
                                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                        }`}>
                                          {node.nodeStatus}
                                        </span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4 px-4">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
              {(() => {
                const selectedCount = (isSearchActive ? filteredNodes : nodes).filter(node => node.selected).length;
                return selectedCount > 0 ? (
                  <button
                    onClick={() => {
                      const selectedNodeIds = (isSearchActive ? filteredNodes : nodes)
                        .filter(node =>
                          node.selected &&
                          node.isQualified === 'Yes' &&
                          node.probationAIAgentStatus !== 'In Progress'
                        )
                        .map(node => node.nodeId);
                      if (selectedNodeIds.length > 0) {
                        showAlert('success', `Successful completions.`);
                      } else {
                        showAlert('warning', 'No eligible nodes selected. Only qualified nodes (not in progress) can be submitted for testing.');
                      }
                    }}
                    className="btn-primary-enhanced flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Bulk Submit {selectedCount} Requests for Testing
                  </button>
                ) : null;
              })()}
            </div>
          </>
        )}
      </div>

      <NodeTraceSummaryModal
        isOpen={isTraceSummaryModalOpen}
        onClose={() => setIsTraceSummaryModalOpen(false)}
        node={selectedNodeForTrace}
      />

      <IsQualifiedModal
        isOpen={isQualifiedModalOpen}
        onClose={() => setIsQualifiedModalOpen(false)}
        node={selectedNodeForQualified}
      />

      <NodeSummaryModal
        isOpen={isNodeSummaryModalOpen}
        onClose={() => setIsNodeSummaryModalOpen(false)}
        node={selectedNodeForSummary}
      />

      {/* Alert Notification */}
      {alertMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none animate-fade-in">
          <div
            className={`rounded-lg p-6 shadow-2xl flex items-center gap-3 pointer-events-auto ${
              alertMessage.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
                : alertMessage.type === 'error'
                ? 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700'
                : alertMessage.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700'
                : 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
            }`}
          >
            {alertMessage.type === 'success' && (
              <CheckSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
            )}
            {alertMessage.type === 'error' && (
              <X className="w-6 h-6 text-red-600 dark:text-red-400" />
            )}
            {alertMessage.type === 'warning' && (
              <HelpCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            )}
            {alertMessage.type === 'info' && (
              <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            )}
            <p
              className={`text-base font-medium ${
                alertMessage.type === 'success'
                  ? 'text-green-700 dark:text-green-300'
                  : alertMessage.type === 'error'
                  ? 'text-red-700 dark:text-red-300'
                  : alertMessage.type === 'warning'
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-blue-700 dark:text-blue-300'
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

export default SubmitRequest;
