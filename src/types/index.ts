export interface IncidentNode {
  id: string;
  incidentId: string;
  nodeId: string;
  nodeStatus: string;
  autoSageStatus: string;
  fcTeamName: string;
  tenant?: string;
  recommendedAction: 'Auto Sage' | 'DRI Input' | 'Hold';
  solution: string;
  selected: boolean;
  actionSelected?: string;
}

export interface ProbationNode {
  id: string;
  nodeId: string;
  tenant: string;
  isQualified: 'Yes' | 'No';
  sourceType: string;
  model: string;
  gen: number;
  deviceType: string;
  crcWorkload?: 'Select All' | 'CoreMark' | 'Prime95';
  sku: string;
  region: string;
  fallBackCountInProbation: number;
  ageInProbation: number;
  nodeStatus: 'Probation' | 'Production' | 'OFR';
  selected: boolean;
  rtoCreatedDate?: string;
  rtoTrackingUrl?: string;
  crcStatus?: 'Pass' | 'Failed';
  burninStatus?: 'Pass' | 'Failed';
  actionTaken?: string;
  nodeState?: string;
  processedInBurninDate?: string;
  crcExperimentStartDate?: string;
  crcExperimentEndDate?: string;
  crcExperimentName?: string;
  crcExperimentId?: string;
  containerCount?: number;
  tipNodeSessionId?: string;
  nodeAvailabilityState?: string;
  probationAgentStarted?: string;
  sentForBurninAt?: string;
  sentForCRCAt?: string;
  crcExecutionTime?: string;
  burninExecutionTime?: string;
  crcRunStatus?: 'Pass' | 'Failed' | 'Pending';
  burninRunStatus?: 'Pass' | 'Failed' | 'Pending';
  nodeStatusAfterBurninCRC?: string;
  rtoIdForBurnin?: string;
  rtoIdForCRC?: string;
  probationAgentEnded?: string;
  probationAIAgentStatus?: 'In Progress' | 'Completed' | 'Failed';
}

export interface IncidentRecord {
  id: string;
  incidentNumber: string;
  nodeId: string;
  nodeStatus: string;
  autoSageStatus: string;
  source: string;
  submitted: string;
  tenant: string;
  probationAgentStarted?: string;
  sentForBurninAt?: string;
  sentForCRCAt?: string;
  crcExecutionTime?: string;
  burninExecutionTime?: string;
  crcRunStatus?: 'Pass' | 'Failed' | 'Pending';
  burninRunStatus?: 'Pass' | 'Failed' | 'Pending';
  nodeStatusAfterBurninCRC?: string;
  rtoIdForBurnin?: string;
  rtoIdForCRC?: string;
  crcExperimentId?: string;
  crcExperimentName?: string;
  probationAgentEnded?: string;
  sourceType?: string;
  model?: string;
  gen?: number;
  deviceType?: string;
  sku?: string;
  region?: string;
  probationAIAgentStatus?: 'In Progress' | 'Completed' | 'Failed';
}

export interface NodeTrace {
  Timestamp: string;
  ActionType: 'NodePicked' | 'GDCOCreated' | 'RTOCreated' | 'FaultCodeFixAttempt' | 'FaultCodeFixAttempted' | 'NodeResolved' | 'NodeEscalated';
  OldFaultCode?: string;
  NewFaultCode?: string;
  Status: string;
  Reason?: string;
  LifecycleStatus?: string;
  AutoSageStatus?: string;
  RTOId?: string;
  RTOUrl?: string;
  GDCOId?: string;
  GDCOUrl?: string;
}

export interface NodeTraceResponse {
  NodeId: string;
  Traces: NodeTrace[];
}

export interface BurninRun {
  nodeId: string;
  burninStartDate: string;
  burninEndDate: string;
  burninStatus: 'Pass' | 'Failed' | 'Pending';
  burninErrorDescription?: string;
}

export interface CRCExperimentRun {
  experimentId: string;
  experimentName: string;
  experimentStatus: 'Succeeded' | 'Failed' | 'Pending';
  nodeId: string;
  workloadName: string;
  status: 'Succeeded' | 'Failed' | 'Pending';
  duration: string;
  environment: string;
  tipSessionId: string;
}
