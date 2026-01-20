import { NodeTraceResponse } from '../types';

export const mockNodeTraces: Record<string, NodeTraceResponse> = {
  'NODE001': {
    NodeId: 'NODE001',
    Traces: [
      {
        Timestamp: '2025-10-19T19:55:00Z',
        ActionType: 'FaultCodeFixAttempted',
        OldFaultCode: 'FC-0042',
        NewFaultCode: 'FC-0',
        Status: 'Success',
        LifecycleStatus: 'Production',
        AutoSageStatus: 'Completed'
      },
      {
        Timestamp: '2025-10-18T16:40:00Z',
        ActionType: 'RTOCreated',
        RTOId: 'RTO-9983',
        RTOUrl: 'https://portal.microsoft.com/rto/RTO-9983',
        Status: 'Completed'
      },
      {
        Timestamp: '2025-10-18T14:30:00Z',
        ActionType: 'GDCOCreated',
        GDCOId: 'GDCO-4451',
        GDCOUrl: 'https://portal.microsoft.com/gdco/GDCO-4451',
        Status: 'Completed'
      }
    ]
  },
  'NODE002': {
    NodeId: 'NODE002',
    Traces: [
      {
        Timestamp: '2025-10-20T16:45:00Z',
        ActionType: 'NodeEscalated',
        Status: 'Escalated',
        Reason: 'Unable to resolve automatically - requires manual intervention',
        LifecycleStatus: 'Escalated'
      },
      {
        Timestamp: '2025-10-20T14:30:00Z',
        ActionType: 'FaultCodeFixAttempt',
        OldFaultCode: 'FC-0051',
        NewFaultCode: 'FC-0051',
        Status: 'Failed',
        Reason: 'Fix attempt unsuccessful - node still in unhealthy state'
      },
      {
        Timestamp: '2025-10-20T10:15:00Z',
        ActionType: 'RTOCreated',
        RTOId: 'RTO-9984',
        RTOUrl: 'https://portal.microsoft.com/rto/RTO-9984',
        Status: 'Pending Inputs'
      },
      {
        Timestamp: '2025-10-20T09:00:00Z',
        ActionType: 'GDCOCreated',
        GDCOId: 'GDCO-4452',
        GDCOUrl: 'https://portal.microsoft.com/gdco/GDCO-4452',
        Status: 'Paused'
      },
      {
        Timestamp: '2025-10-20T08:00:00Z',
        ActionType: 'NodePicked',
        Status: 'Picked by AutoSage Automation'
      }
    ]
  },
  'NODE003': {
    NodeId: 'NODE003',
    Traces: [
      {
        Timestamp: '2025-10-21T19:55:00Z',
        ActionType: 'FaultCodeFixAttempted',
        OldFaultCode: 'FC-0042',
        NewFaultCode: 'FC-0',
        Status: 'Success',
        LifecycleStatus: 'Production',
        AutoSageStatus: 'Completed'
      },
      {
        Timestamp: '2025-10-21T16:40:00Z',
        ActionType: 'RTOCreated',
        RTOId: 'RTO-9985',
        RTOUrl: 'https://portal.microsoft.com/rto/RTO-9985',
        Status: 'Completed'
      },
      {
        Timestamp: '2025-10-21T14:30:00Z',
        ActionType: 'GDCOCreated',
        GDCOId: 'GDCO-4458',
        GDCOUrl: 'https://portal.microsoft.com/gdco/GDCO-4458',
        Status: 'Completed'
      }
    ]
  },
  'NODE004': {
    NodeId: 'NODE004',
    Traces: [
      {
        Timestamp: '2025-10-22T09:15:00Z',
        ActionType: 'GDCOCreated',
        GDCOId: 'GDCO-4453',
        GDCOUrl: 'https://portal.microsoft.com/gdco/GDCO-4453',
        Status: 'In Progress'
      },
      {
        Timestamp: '2025-10-22T09:00:00Z',
        ActionType: 'NodePicked',
        Status: 'Picked by AutoSage Automation'
      }
    ]
  }
};

export const getNodeTraces = (nodeId: string): NodeTraceResponse => {
  return mockNodeTraces[nodeId] || {
    NodeId: nodeId,
    Traces: []
  };
};
