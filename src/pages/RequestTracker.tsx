import React, { useState, useEffect } from 'react';
import { Search, Filter, HelpCircle, ChevronUp, ChevronDown, FileText, Plus, Minus, X } from 'lucide-react';
import TestResultsModal from '../components/TestResultsModal';
import { IncidentRecord } from '../types';
import TableHeader, { SortDirection } from '../components/TableHeader';
import TablePagination from '../components/TablePagination';
import ColumnSelector from '../components/ColumnSelector';
import NodeTraceSummaryModal from '../components/NodeTraceSummaryModal';
import NodeSummaryModal from '../components/NodeSummaryModal';
import { useTableData } from '../hooks/useTableData';
import { useColumnVisibility } from '../hooks/useColumnVisibility';

interface FilterClause {
  id: string;
  logicOperator: 'AND' | 'OR';
  field: string;
  operator: string;
  value: string;
}

const RequestTracker: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
    const [filteredIncidents, setFilteredIncidents] = useState<IncidentRecord[]>([]);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [filterClauses, setFilterClauses] = useState<FilterClause[]>([
        { id: '1', logicOperator: 'AND', field: '', operator: '==', value: '' }
    ]);
    const [selectedIncident, setSelectedIncident] = useState<IncidentRecord | null>(null);
    const [isTraceModalOpen, setIsTraceModalOpen] = useState(false);
    const [selectedNodeForResults, setSelectedNodeForResults] = useState<any>(null);
    const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
    const [selectedNodeForSummary, setSelectedNodeForSummary] = useState<any>(null);
    const [isNodeSummaryModalOpen, setIsNodeSummaryModalOpen] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [expandedSubRows, setExpandedSubRows] = useState<Set<string>>(new Set());

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
    } = useTableData({ data: isSearchActive ? filteredIncidents : incidents, itemsPerPage: 10 });

    // Column visibility management
    const { columns, toggleColumn, isColumnVisible } = useColumnVisibility({
        initialColumns: [
            { key: 'nodeId', label: 'Node ID', visible: true },
            { key: 'tenant', label: 'Tenant', visible: true },
            { key: 'sourceType', label: 'Source Type', visible: true },
            { key: 'model', label: 'Model', visible: true },
            { key: 'gen', label: 'Gen', visible: true },
            { key: 'deviceType', label: 'Device Type', visible: true },
            { key: 'sku', label: 'SKU', visible: true },
            { key: 'region', label: 'Region', visible: true },
            { key: 'nodeStatus', label: 'Node Status', visible: true },
            { key: 'probationAIAgentStatus', label: 'AGENT Status', visible: true },
        ],
        storageKey: 'requestTracker-columns'
    });

    useEffect(() => {
        // Mock data - in real app this would come from API
        const mockIncidents: IncidentRecord[] = [
            {
                id: '1',
                incidentNumber: 'INC001',
                nodeId: 'NODE001',
                nodeStatus: 'Production',
                autoSageStatus: 'Active',
                source: 'AutoSage',
                submitted: '2025-01-21 10:30:00',
                tenant: 'STR123Prd01',
                probationAgentStarted: '2025-01-21 08:00:00',
                sentForBurninAt: '2025-01-21 09:15:00',
                sentForCRCAt: '2025-01-21 11:30:00',
                crcExecutionTime: '45 mins',
                burninExecutionTime: '2 hours',
                crcRunStatus: 'Pass',
                burninRunStatus: 'Pass',
                nodeStatusAfterBurninCRC: 'Production',
                rtoIdForBurnin: 'RTO-BR-001',
                rtoIdForCRC: 'RTO-CR-001',
                crcExperimentId: 'EXP-CRC-2025-001',
                crcExperimentName: 'CRC_Production_Test_Jan2025',
                probationAgentEnded: '2025-01-21 14:00:00',
                sourceType: 'Compute',
                model: 'Lenovo-Azure-Compute-GP-MM-Intel-WCS',
                gen: 10,
                deviceType: 'Blade',
                sku: 'ERASSY-AZURE-COMPUTE-GP-MM-GEN10.2-INT',
                region: 'EastUS2',
                probationAIAgentStatus: 'Completed'
            },
            {
                id: '2',
                incidentNumber: 'INC002',
                nodeId: 'NODE002',
                nodeStatus: 'Probation',
                autoSageStatus: 'Processing',
                source: 'Manual',
                submitted: '2025-01-21 09:15:00',
                tenant: 'STR456Prd02',
                probationAgentStarted: '2025-01-21 09:30:00',
                sentForBurninAt: '2025-01-21 10:00:00',
                sentForCRCAt: '2025-01-21 12:15:00',
                crcExecutionTime: '30 mins',
                burninExecutionTime: '1.5 hours',
                crcRunStatus: 'Pending',
                burninRunStatus: 'Pass',
                nodeStatusAfterBurninCRC: 'Probation',
                rtoIdForBurnin: 'RTO-BR-002',
                rtoIdForCRC: 'RTO-CR-002',
                crcExperimentId: 'EXP-CRC-2025-002',
                crcExperimentName: 'CRC_Probation_Test_Jan2025',
                probationAgentEnded: '',
                sourceType: 'M-Series',
                model: 'Lenovo-Azure-Compute-GP-MM-Intel-WCS',
                gen: 7,
                deviceType: 'SoC',
                sku: 'ERASSY-AZURE-COMPUTE-GP-MM-GEN10.2-INT',
                region: 'EastUS',
                probationAIAgentStatus: 'In Progress'
            },
            {
                id: '3',
                incidentNumber: 'INC003',
                nodeId: 'NODE003',
                nodeStatus: 'OFR',
                autoSageStatus: 'Completed',
                source: 'AutoSage',
                submitted: '2025-01-21 08:45:00',
                tenant: 'STR789Prd03',
                probationAgentStarted: '2025-01-21 07:00:00',
                sentForBurninAt: '2025-01-21 08:00:00',
                sentForCRCAt: '2025-01-21 09:30:00',
                crcExecutionTime: '1 hour',
                burninExecutionTime: '3 hours',
                crcRunStatus: 'Failed',
                burninRunStatus: 'Failed',
                nodeStatusAfterBurninCRC: 'OFR',
                rtoIdForBurnin: 'RTO-BR-003',
                rtoIdForCRC: 'RTO-CR-003',
                crcExperimentId: 'EXP-CRC-2025-003',
                crcExperimentName: 'CRC_Burnin_Test_Jan2025',
                probationAgentEnded: '2025-01-21 12:30:00',
                sourceType: 'Compute',
                model: 'Lenovo-Azure-Compute-GP-MM-Intel-WCS',
                gen: 9,
                deviceType: 'Chassis',
                sku: 'ERASSY-AZURE-COMPUTE-GP-MM-GEN10.2-INT',
                region: 'CENTRALUS',
                probationAIAgentStatus: 'Failed'
            },
        ];

        // Check if there are submitted requests from localStorage
        const submittedRequests = localStorage.getItem('submittedRequests');
        if (submittedRequests) {
            const parsedRequests = JSON.parse(submittedRequests);
            const newIncidents = parsedRequests.map((req: any, index: number) => ({
                id: `new-${index}`,
                incidentNumber: `INC00${mockIncidents.length + index + 1}`,
                nodeId: req.nodeId,
                nodeStatus: req.nodeStatus,
                autoSageStatus: 'Active',
                source: 'Manual',
                submitted: new Date().toLocaleString(),
                tenant: 'Current User',
            }));

            setIncidents([...mockIncidents, ...newIncidents]);
            // Clear the submitted requests
            localStorage.removeItem('submittedRequests');
        } else {
            setIncidents(mockIncidents);
        }
    }, []);

    // Enhanced search function with wildcard support
    const performSearch = async () => {
        setIsSearchLoading(true);

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!searchTerm.trim()) {
            setFilteredIncidents([]);
            setIsSearchActive(false);
            setIsSearchLoading(false);
            return;
        }

        const searchTerms = searchTerm.split(',').map(term => term.trim()).filter(term => term);

        const results = incidents.filter(incident => {
            return searchTerms.some(term => {
                // Convert search term to lowercase for case-insensitive search
                const lowerTerm = term.toLowerCase();

                // Wildcard search support using * as wildcard
                const createRegexFromWildcard = (pattern: string) => {
                    const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regexPattern = escapedPattern.replace(/\\\*/g, '.*');
                    return new RegExp(`^${regexPattern}$`, 'i');
                };

                // Check if term contains wildcard
                if (lowerTerm.includes('*')) {
                    const regex = createRegexFromWildcard(lowerTerm);
                    return (
                        regex.test(incident.incidentNumber) ||
                        regex.test(incident.nodeId) ||
                        regex.test(incident.tenant) ||
                        regex.test(incident.source) // Using source as fault code equivalent
                    );
                }

                // Regular search (exact match or contains)
                return (
                    incident.incidentNumber.toLowerCase().includes(lowerTerm) ||
                    incident.nodeId.toLowerCase().includes(lowerTerm) ||
                    incident.tenant.toLowerCase().includes(lowerTerm) ||
                    incident.source.toLowerCase().includes(lowerTerm)
                );
            });
        });

        setFilteredIncidents(results);
        setIsSearchActive(true);
        setIsSearchLoading(false);
    };

    const clearSearch = () => {
        setSearchTerm('');
        setFilteredIncidents([]);
        setIsSearchActive(false);
    };

    const handleSearchInputChange = (value: string) => {
        setSearchTerm(value);
        // Auto-clear search results when input is empty
        if (!value.trim()) {
            setFilteredIncidents([]);
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
            setFilteredIncidents([]);
            setIsSearchActive(false);
            return;
        }

        const results = incidents.filter(incident => {
            let result = true;
            let currentLogic: 'AND' | 'OR' = 'AND';

            for (let i = 0; i < validClauses.length; i++) {
                const clause = validClauses[i];
                const fieldValue = (incident as any)[clause.field]?.toString().toLowerCase() || '';
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

        setFilteredIncidents(results);
        setIsSearchActive(true);
    };

    const clearAdvancedFilter = () => {
        setFilterClauses([{ id: '1', logicOperator: 'AND', field: '', operator: '==', value: '' }]);
        setFilteredIncidents([]);
        setIsSearchActive(false);
    };

    // Handle global search
    const displayData = paginatedData;

    const showNoResults = isSearchActive && filteredIncidents.length === 0;
    const totalDisplayItems = isSearchActive ? filteredIncidents.length : incidents.length;

    const handleNodeClick = (incident: IncidentRecord) => {
        setSelectedIncident(incident);
        setIsTraceModalOpen(true);
    };

    const handleCloseTraceModal = () => {
        setIsTraceModalOpen(false);
        setSelectedIncident(null);
    };

    const handleSummaryClick = (incident: IncidentRecord) => {
        setSelectedNodeForSummary(incident);
        setIsNodeSummaryModalOpen(true);
    };

    const toggleRowExpansion = (incidentId: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(incidentId)) {
                newSet.delete(incidentId);
            } else {
                newSet.add(incidentId);
            }
            return newSet;
        });
    };

    const toggleSubRowExpansion = (subRowId: string) => {
        setExpandedSubRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(subRowId)) {
                newSet.delete(subRowId);
            } else {
                newSet.add(subRowId);
            }
            return newSet;
        });
    };

    const truncateText = (text: string | undefined, maxLength: number = 13) => {
        if (!text) return 'N/A';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Request to Review</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Track and monitor submitted Node Test requests In Probation
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
                            Find requests by Node ID, Tenant, or Fault Code
                        </p>
                    </div>
                </div>

            {!isAdvancedOpen && (
                <>
                    <div className="flex items-center space-x-3">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search By Node Id, Tenant, Fault Code (Comma-Separated).."
                                value={searchTerm}
                                onChange={(e) => handleSearchInputChange(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={performSearch}
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
                                    onClick={clearSearch}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    <Filter className="w-4 h-4" />
                                    <span>Clear</span>
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Advanced Filter Link and Section */}
            <div className="space-y-2">
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
                                        <option value="sourceType">Source Type</option>
                                        <option value="nodeStatus">Node Status</option>
                                        <option value="probationAIAgentStatus">Agent Status</option>
                                        <option value="autoSageStatus">AutoSage Status</option>
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
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mt-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>Search Results:</strong> Found {filteredIncidents.length} record{filteredIncidents.length !== 1 ? 's' : ''}
                        {searchTerm && ` for "${searchTerm}"`}
                    </p>
                </div>
            )}
            </div>

            {/* Node Submission Summary */}
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
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{incidents.length}</p>
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
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{incidents.filter(n => n.probationAIAgentStatus).length}</p>
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
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{incidents.filter(n => n.probationAIAgentStatus === 'Completed').length}</p>
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
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{incidents.filter(n => n.probationAIAgentStatus === 'Failed').length}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0">
                    <ColumnSelector columns={columns} onColumnToggle={toggleColumn} />
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                        <div className="overflow-x-auto overflow-visible relative z-10 min-h-[500px]" style={{ isolation: 'isolate' }}>
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-[90]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                                            Expand
                                        </th>
                                        {isColumnVisible('nodeId') && (
                                            <TableHeader
                                                title="Node ID"
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
                                                title="Source Type"
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
                                        {isColumnVisible('model') && (
                                            <TableHeader
                                                title="Model"
                                                sortable
                                                filterable
                                                sortDirection={sortConfig.key === 'model' ? sortConfig.direction : null}
                                                filterValue={filters.model || ''}
                                                onSort={() => handleSort('model')}
                                                onSortAsc={() => handleSortAsc('model')}
                                                onSortDesc={() => handleSortDesc('model')}
                                                onClearSort={handleClearSort}
                                                onFilterChange={(value) => handleFilter('model', value)}
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
                                                title="Device Type"
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
                                        {isColumnVisible('sku') && (
                                            <TableHeader
                                                title="SKU"
                                                sortable
                                                filterable
                                                sortDirection={sortConfig.key === 'sku' ? sortConfig.direction : null}
                                                filterValue={filters.sku || ''}
                                                onSort={() => handleSort('sku')}
                                                onSortAsc={() => handleSortAsc('sku')}
                                                onSortDesc={() => handleSortDesc('sku')}
                                                onClearSort={handleClearSort}
                                                onFilterChange={(value) => handleFilter('sku', value)}
                                            />
                                        )}
                                        {isColumnVisible('region') && (
                                            <TableHeader
                                                title="Region"
                                                sortable
                                                filterable
                                                sortDirection={sortConfig.key === 'region' ? sortConfig.direction : null}
                                                filterValue={filters.region || ''}
                                                onSort={() => handleSort('region')}
                                                onSortAsc={() => handleSortAsc('region')}
                                                onSortDesc={() => handleSortDesc('region')}
                                                onClearSort={handleClearSort}
                                                onFilterChange={(value) => handleFilter('region', value)}
                                            />
                                        )}
                                        {isColumnVisible('nodeStatus') && (
                                            <TableHeader
                                                title="Node Status"
                                                sortable
                                                filterable
                                                sortDirection={sortConfig.key === 'nodeStatus' ? sortConfig.direction : null}
                                                filterValue={filters.nodeStatus || ''}
                                                onSort={() => handleSort('nodeStatus')}
                                                onSortAsc={() => handleSortAsc('nodeStatus')}
                                                onSortDesc={() => handleSortDesc('nodeStatus')}
                                                onClearSort={handleClearSort}
                                                onFilterChange={(value) => handleFilter('nodeStatus', value)}
                                            />
                                        )}
                                        {isColumnVisible('probationAIAgentStatus') && (
                                            <TableHeader
                                                title="AGENT Status"
                                                sortable
                                                filterable
                                                sortDirection={sortConfig.key === 'probationAIAgentStatus' ? sortConfig.direction : null}
                                                filterValue={filters.probationAIAgentStatus || ''}
                                                onSort={() => handleSort('probationAIAgentStatus')}
                                                onSortAsc={() => handleSortAsc('probationAIAgentStatus')}
                                                onSortDesc={() => handleSortDesc('probationAIAgentStatus')}
                                                onClearSort={handleClearSort}
                                                onFilterChange={(value) => handleFilter('probationAIAgentStatus', value)}
                                            />
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 relative">
                                    {displayData.length === 0 ? (
                                        <tr>
                                            <td colSpan={Object.keys(columns).filter(key => isColumnVisible(key)).length + 1} className="px-6 py-20 text-center">
                                                <p className="text-gray-500 dark:text-gray-400">No records found.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        displayData.map((incident) => (
                                        <React.Fragment key={incident.id}>
                                            <tr className="relative hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => toggleRowExpansion(incident.id)}
                                                            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors text-blue-600 dark:text-blue-400"
                                                            title="Expand Details"
                                                        >
                                                            {expandedRows.has(incident.id) ? (
                                                                <Minus className="w-5 h-5" />
                                                            ) : (
                                                                <Plus className="w-5 h-5" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleSummaryClick(incident)}
                                                            className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors text-green-600 dark:text-green-400"
                                                            title="View Node Summary"
                                                        >
                                                            <FileText className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                                {isColumnVisible('nodeId') && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleNodeClick(incident);
                                                        }}
                                                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                                                    >
                                                        {incident.nodeId}
                                                    </button>
                                                </td>
                                            )}
                                            {isColumnVisible('tenant') && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {incident.tenant}
                                                </td>
                                            )}
                                            {isColumnVisible('sourceType') && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {incident.sourceType || 'N/A'}
                                                </td>
                                            )}
                                            {isColumnVisible('model') && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    <div className="max-w-xs truncate" title={incident.model}>
                                                        {incident.model || 'N/A'}
                                                    </div>
                                                </td>
                                            )}
                                            {isColumnVisible('gen') && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {incident.gen || 'N/A'}
                                                </td>
                                            )}
                                            {isColumnVisible('deviceType') && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {incident.deviceType || 'N/A'}
                                                </td>
                                            )}
                                            {isColumnVisible('sku') && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    <div className="max-w-xs truncate" title={incident.sku}>
                                                        {incident.sku || 'N/A'}
                                                    </div>
                                                </td>
                                            )}
                                            {isColumnVisible('region') && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {incident.region || 'N/A'}
                                                </td>
                                            )}
                                            {isColumnVisible('nodeStatus') && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        incident.nodeStatus === 'Production'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : incident.nodeStatus === 'OFR'
                                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                    }`}>
                                                        {incident.nodeStatus}
                                                    </span>
                                                </td>
                                            )}
                                            {isColumnVisible('probationAIAgentStatus') && (
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {incident.probationAIAgentStatus === 'Completed' ? (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedNodeForResults(incident);
                                                                setIsResultsModalOpen(true);
                                                            }}
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                                                            title="View Test Results"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                            Results
                                                        </button>
                                                    ) : (
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            incident.probationAIAgentStatus === 'Failed'
                                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                        }`}>
                                                            {incident.probationAIAgentStatus || 'In Progress'}
                                                        </span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>

                                        {/* Expanded Sub-Rows - Node Details */}
                                        {expandedRows.has(incident.id) && (
                                            <>
                                                {/* Burnin Section */}
                                                <tr className="bg-white dark:bg-gray-800">
                                                    <td className="px-6 py-3 relative">
                                                        <div className="flex items-center gap-2 ml-8">
                                                            <button
                                                                onClick={() => toggleSubRowExpansion(`${incident.id}-burnin`)}
                                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                                            >
                                                                {expandedSubRows.has(`${incident.id}-burnin`) ? (
                                                                    <Minus className="w-4 h-4" />
                                                                ) : (
                                                                    <Plus className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td colSpan={Object.keys(columns).filter(key => isColumnVisible(key)).length + 1} className="px-6 py-3">
                                                        <div className="inline-block bg-blue-100 dark:bg-blue-900/30 px-4 py-1.5 rounded-md">
                                                            <span className="font-semibold text-sm text-blue-900 dark:text-blue-200">
                                                                Burnin Details
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedSubRows.has(`${incident.id}-burnin`) && (
                                                    <>
                                                        <tr className="bg-gray-50 dark:bg-gray-900/40 animate-slide-down">
                                                            <td className="px-6 py-4 relative" style={{width: '60px'}}>
                                                                <div className="absolute left-[42px] top-0 bottom-0 w-[2px] bg-gray-900 dark:bg-gray-300"></div>
                                                                <div className="absolute left-[42px] top-1/2 right-0 h-[2px] bg-gray-900 dark:bg-gray-300"></div>
                                                            </td>
                                                            <td colSpan={Object.keys(columns).filter(key => isColumnVisible(key)).length + 1} className="px-0 py-2 relative">
                                                                <table className="w-full text-xs rounded-lg overflow-hidden shadow-lg" style={{border: '1px solid #BFDBFE', marginLeft: '0px'}}>
                                                                    <thead style={{backgroundColor: '#DBEAFE'}}>
                                                                        <tr>
                                                                            <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-black border-b border-gray-200 dark:border-gray-700">Burnin Status</th>
                                                                            <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-black border-b border-gray-200 dark:border-gray-700">Burnin Processed Date</th>
                                                                            <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-black border-b border-gray-200 dark:border-gray-700">Burnin Fail Description</th>
                                                                            <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-black border-b border-gray-200 dark:border-gray-700">Burnin RTO URL</th>
                                                                            <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-black border-b border-gray-200 dark:border-gray-700">Burnin Processed By</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="bg-white dark:bg-gray-800">
                                                                        <tr>
                                                                            <td className="py-2 px-3">
                                                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                                                    incident.burninRunStatus === 'Pass'
                                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                                        : incident.burninRunStatus === 'Failed'
                                                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                                }`}>
                                                                                    {incident.burninRunStatus || 'N/A'}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-2 px-3 text-gray-900 dark:text-white">{incident.sentForBurninAt || 'N/A'}</td>
                                                                            <td className="py-2 px-3 text-gray-900 dark:text-white" title={incident.burninRunStatus === 'Failed' ? 'Burnin test failed' : undefined}>
                                                                                {incident.burninRunStatus === 'Failed' ? truncateText('Burnin test failed') : 'N/A'}
                                                                            </td>
                                                                            <td className="py-2 px-3">
                                                                                {incident.rtoIdForBurnin ? (
                                                                                    <a href={`https://rto.example.com/${incident.rtoIdForBurnin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                                                                                        {incident.rtoIdForBurnin}
                                                                                    </a>
                                                                                ) : (
                                                                                    <span className="text-gray-900 dark:text-white">N/A</span>
                                                                                )}
                                                                            </td>
                                                                            <td className="py-2 px-3 text-gray-900 dark:text-white">AutoSage</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </>
                                                )}

                                                {/* CRC Section */}
                                                <tr className="bg-white dark:bg-gray-800">
                                                    <td className="px-6 py-3 relative">
                                                        <div className="flex items-center gap-2 ml-8">
                                                            <button
                                                                onClick={() => toggleSubRowExpansion(`${incident.id}-crc`)}
                                                                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                                                            >
                                                                {expandedSubRows.has(`${incident.id}-crc`) ? (
                                                                    <Minus className="w-4 h-4" />
                                                                ) : (
                                                                    <Plus className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td colSpan={Object.keys(columns).filter(key => isColumnVisible(key)).length + 1} className="px-6 py-3">
                                                        <div className="inline-block bg-green-100 dark:bg-green-900/30 px-4 py-1.5 rounded-md">
                                                            <span className="font-semibold text-sm text-green-900 dark:text-green-200">
                                                                CRC Details
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedSubRows.has(`${incident.id}-crc`) && (
                                                    <>
                                                        <tr className="bg-gray-50 dark:bg-gray-900/40 animate-slide-down">
                                                            <td className="px-6 py-4 relative" style={{width: '60px'}}>
                                                                <div className="absolute left-[42px] top-0 bottom-0 w-[2px] bg-gray-900 dark:bg-gray-300"></div>
                                                                <div className="absolute left-[42px] top-1/2 right-0 h-[2px] bg-gray-900 dark:bg-gray-300"></div>
                                                            </td>
                                                            <td colSpan={Object.keys(columns).filter(key => isColumnVisible(key)).length + 1} className="px-0 py-2 relative">
                                                                <table className="w-full text-xs rounded-lg overflow-hidden shadow-lg" style={{border: '1px solid #BFDBFE', marginLeft: '0px'}}>
                                                                    <thead style={{backgroundColor: '#DBEAFE'}}>
                                                                        <tr>
                                                                            <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-black border-b border-gray-200 dark:border-gray-700">CRC Status</th>
                                                                            <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-black border-b border-gray-200 dark:border-gray-700">CRC Processed Date</th>
                                                                            <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-black border-b border-gray-200 dark:border-gray-700">CRC Experiment Name</th>
                                                                            <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-black border-b border-gray-200 dark:border-gray-700">CRC Experiment ID</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="bg-white dark:bg-gray-800">
                                                                        <tr>
                                                                            <td className="py-2 px-3">
                                                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                                                    incident.crcRunStatus === 'Pass'
                                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                                        : incident.crcRunStatus === 'Failed'
                                                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                                }`}>
                                                                                    {incident.crcRunStatus || 'N/A'}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-2 px-3 text-gray-900 dark:text-white">{incident.sentForCRCAt || 'N/A'}</td>
                                                                            <td className="py-2 px-3 text-gray-900 dark:text-white font-mono">{truncateText(incident.crcExperimentName)}</td>
                                                                            <td className="py-2 px-3 text-gray-900 dark:text-white font-mono">{truncateText(incident.crcExperimentId)}</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </>
                                                )}

                                                {/* Production Section */}
                                                <tr className="bg-white dark:bg-gray-800">
                                                    <td className="px-6 py-3 relative">
                                                        <div className="flex items-center gap-2 ml-8">
                                                            <button
                                                                onClick={() => toggleSubRowExpansion(`${incident.id}-production`)}
                                                                className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                                                            >
                                                                {expandedSubRows.has(`${incident.id}-production`) ? (
                                                                    <Minus className="w-4 h-4" />
                                                                ) : (
                                                                    <Plus className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td colSpan={Object.keys(columns).filter(key => isColumnVisible(key)).length + 1} className="px-6 py-3">
                                                        <div className="inline-block bg-amber-100 dark:bg-amber-900/30 px-4 py-1.5 rounded-md">
                                                            <span className="font-semibold text-sm text-amber-900 dark:text-amber-200">
                                                                Production Details
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedSubRows.has(`${incident.id}-production`) && (
                                                    <>
                                                        <tr className="bg-gray-50 dark:bg-gray-900/40 animate-slide-down">
                                                            <td className="px-6 py-4 relative" style={{width: '60px'}}>
                                                                <div className="absolute left-[42px] top-0 bottom-0 w-[2px] bg-gray-900 dark:bg-gray-300"></div>
                                                                <div className="absolute left-[42px] top-1/2 right-0 h-[2px] bg-gray-900 dark:bg-gray-300"></div>
                                                            </td>
                                                            <td colSpan={Object.keys(columns).filter(key => isColumnVisible(key)).length + 1} className="px-0 py-2 relative">
                                                                <table className="w-full text-xs rounded-lg overflow-hidden shadow-lg" style={{border: '1px solid #BFDBFE', marginLeft: '0px'}}>
                                                                    <thead style={{backgroundColor: '#DBEAFE'}}>
                                                                        <tr>
                                                                            <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-black border-b border-gray-200 dark:border-gray-700">Production Status</th>
                                                                            <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-black border-b border-gray-200 dark:border-gray-700">Production Processed Date</th>
                                                                            <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-black border-b border-gray-200 dark:border-gray-700">Production RTO URL</th>
                                                                            <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-black border-b border-gray-200 dark:border-gray-700">Production Processed By</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="bg-white dark:bg-gray-800">
                                                                        <tr>
                                                                            <td className="py-2 px-3">
                                                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                                                    incident.nodeStatus === 'Production'
                                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                                                                }`}>
                                                                                    {incident.nodeStatus === 'Production' ? 'Pass' : 'N/A'}
                                                                                </span>
                                                                            </td>
                                                                            <td className="py-2 px-3 text-gray-900 dark:text-white">{incident.probationAgentEnded || 'N/A'}</td>
                                                                            <td className="py-2 px-3">
                                                                                {incident.rtoIdForCRC || incident.rtoIdForBurnin ? (
                                                                                    <a href={`https://rto.example.com/${incident.rtoIdForCRC || incident.rtoIdForBurnin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                                                                                        {incident.rtoIdForCRC || incident.rtoIdForBurnin}
                                                                                    </a>
                                                                                ) : (
                                                                                    <span className="text-gray-900 dark:text-white">N/A</span>
                                                                                )}
                                                                            </td>
                                                                            <td className="py-2 px-3 text-gray-900 dark:text-white">AutoSage</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        </React.Fragment>
                                    )))}
                                </tbody>
                            </table>
                        </div>
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>

            {/* Probation Timeline Modal */}
            <NodeTraceSummaryModal
                isOpen={isTraceModalOpen}
                onClose={handleCloseTraceModal}
                incident={selectedIncident}
            />

            {/* Test Results Modal */}
            <TestResultsModal
                isOpen={isResultsModalOpen}
                onClose={() => setIsResultsModalOpen(false)}
                node={selectedNodeForResults}
            />

            {/* Node Summary Modal */}
            <NodeSummaryModal
                isOpen={isNodeSummaryModalOpen}
                onClose={() => setIsNodeSummaryModalOpen(false)}
                node={selectedNodeForSummary}
            />
        </div>

    );
};

export default RequestTracker;