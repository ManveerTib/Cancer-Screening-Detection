export interface NodeTrace {
    timestamp: string;
    actionType: string;
    status: string;
    oldFaultCode?: string;
    newFaultCode?: string;
    rtoId?: string;
    rtoUrl?: string;
    gdcoId?: string;
    gdcoUrl?: string;
    reason?: string;
    lifecycleStatus?: string;
    autoSageStatus?: string;
    description?: string;
}

export interface NodeTraceResponse {
    nodeId: string;
    traces: NodeTrace[];
}

export const getNodeTraces = (nodeId: string): NodeTraceResponse => {
    const traceDataMap: Record<string, NodeTrace[]> = {
        'NODE-ABC123': [
            {
                timestamp: '2025-10-19T19:55:00Z',
                actionType: 'FaultCodeFixAttempted',
                oldFaultCode: 'FC-0042',
                newFaultCode: 'FC-0',
                status: 'Success',
                lifecycleStatus: 'Production',
                autoSageStatus: 'Completed',
                description: 'Fault code automatically updated after successful mitigation'
            },
            {
                timestamp: '2025-10-18T16:40:00Z',
                actionType: 'RTOCreated',
                rtoId: 'RTO-9983',
                rtoUrl: 'https://portal.microsoft.com/rto/RTO-9983',
                status: 'Completed',
                description: 'RTO ticket created and completed successfully'
            },
            {
                timestamp: '2025-10-18T14:30:00Z',
                actionType: 'GDCOCreated',
                gdcoId: 'GDCO-4451',
                gdcoUrl: 'https://portal.microsoft.com/gdco/GDCO-4451',
                status: 'Completed',
                description: 'GDCO ticket created for tracking'
            }
        ],
        'NODE-XYZ987': [
            {
                timestamp: '2025-10-18T15:45:00Z',
                actionType: 'AutomationFailed',
                status: 'Failed',
                reason: 'Unable to establish connection to node. Timeout after 3 retry attempts.',
                lifecycleStatus: 'Escalated',
                description: 'Automation could not complete due to connectivity issues'
            },
            {
                timestamp: '2025-10-18T14:30:00Z',
                actionType: 'RetryAttempt',
                status: 'Failed',
                description: 'Retry attempt 3/3 failed'
            },
            {
                timestamp: '2025-10-18T14:15:00Z',
                actionType: 'RetryAttempt',
                status: 'Failed',
                description: 'Retry attempt 2/3 failed'
            },
            {
                timestamp: '2025-10-18T14:00:00Z',
                actionType: 'RetryAttempt',
                status: 'Failed',
                description: 'Retry attempt 1/3 failed'
            },
            {
                timestamp: '2025-10-18T10:12:00Z',
                actionType: 'NodePicked',
                status: 'Picked by AutoSage Automation',
                description: 'Node automatically selected for processing'
            }
        ],
        'NODE-DEF456': [
            {
                timestamp: '2025-10-17T16:20:00Z',
                actionType: 'RTOCreated',
                rtoId: 'RTO-9984',
                rtoUrl: 'https://portal.microsoft.com/rto/RTO-9984',
                status: 'Pending Inputs',
                description: 'RTO ticket created, awaiting manual input for completion'
            },
            {
                timestamp: '2025-10-17T16:00:00Z',
                actionType: 'GDCOCreated',
                gdcoId: 'GDCO-4452',
                gdcoUrl: 'https://portal.microsoft.com/gdco/GDCO-4452',
                status: 'In Progress',
                description: 'GDCO ticket created and currently being processed'
            },
            {
                timestamp: '2025-10-17T15:45:00Z',
                actionType: 'NodePicked',
                status: 'Picked by AutoSage Automation',
                description: 'Node automatically selected for processing'
            }
        ],
        'NODE-GHI789': [
            {
                timestamp: '2025-10-16T10:15:00Z',
                actionType: 'NodeSkipped',
                status: 'Skipped',
                reason: 'Node does not meet automation criteria. Manual intervention required.',
                lifecycleStatus: 'Pending Manual Review',
                description: 'Node skipped due to automation policy constraints'
            },
            {
                timestamp: '2025-10-16T09:30:00Z',
                actionType: 'NodeEvaluated',
                status: 'Evaluation Complete',
                description: 'Node evaluated against automation criteria'
            }
        ],
        'NODE-JKL012': [
            {
                timestamp: '2025-10-15T13:45:00Z',
                actionType: 'FaultCodeFixAttempt',
                oldFaultCode: 'FC-0088',
                newFaultCode: 'FC-0088',
                status: 'Failed',
                reason: 'Fix script execution failed. Error: Permission denied on target resource.',
                lifecycleStatus: 'Failed',
                description: 'Attempted fault code fix but encountered permissions error'
            },
            {
                timestamp: '2025-10-15T12:30:00Z',
                actionType: 'GDCOCreated',
                gdcoId: 'GDCO-4453',
                gdcoUrl: 'https://portal.microsoft.com/gdco/GDCO-4453',
                status: 'Failed',
                description: 'GDCO ticket created but automation failed during execution'
            },
            {
                timestamp: '2025-10-15T11:20:00Z',
                actionType: 'NodePicked',
                status: 'Picked by AutoSage Automation',
                description: 'Node automatically selected for processing'
            }
        ],
        'NODE-MNO345': [
            {
                timestamp: '2025-10-14T17:30:00Z',
                actionType: 'FaultCodeFixAttempt',
                oldFaultCode: 'FC-0101',
                newFaultCode: 'FC-0000',
                status: 'Success',
                lifecycleStatus: 'Resolved',
                description: 'Node fully resolved, fault code cleared'
            },
            {
                timestamp: '2025-10-14T16:45:00Z',
                actionType: 'RTOCreated',
                rtoId: 'RTO-9985',
                rtoUrl: 'https://portal.microsoft.com/rto/RTO-9985',
                status: 'Completed',
                description: 'RTO ticket completed successfully'
            },
            {
                timestamp: '2025-10-14T15:30:00Z',
                actionType: 'GDCOCreated',
                gdcoId: 'GDCO-4454',
                gdcoUrl: 'https://portal.microsoft.com/gdco/GDCO-4454',
                status: 'Completed',
                description: 'GDCO ticket created and resolved'
            },
            {
                timestamp: '2025-10-14T14:15:00Z',
                actionType: 'NodePicked',
                status: 'Picked by AutoSage Automation',
                description: 'Node automatically selected for processing'
            }
        ],
        'NODE-PQR678': [
            {
                timestamp: '2025-10-13T18:00:00Z',
                actionType: 'RTOCreated',
                rtoId: 'RTO-9986',
                rtoUrl: 'https://portal.microsoft.com/rto/RTO-9986',
                status: 'In Progress',
                description: 'RTO ticket created and currently being processed'
            },
            {
                timestamp: '2025-10-13T17:30:00Z',
                actionType: 'GDCOCreated',
                gdcoId: 'GDCO-4455',
                gdcoUrl: 'https://portal.microsoft.com/gdco/GDCO-4455',
                status: 'In Progress',
                description: 'GDCO ticket created and under investigation'
            },
            {
                timestamp: '2025-10-13T16:50:00Z',
                actionType: 'NodePicked',
                status: 'Picked by AutoSage Automation',
                description: 'Node automatically selected for processing'
            }
        ],
        'NODE-STU901': [
            {
                timestamp: '2025-10-12T11:45:00Z',
                actionType: 'FaultCodeFixAttempt',
                oldFaultCode: 'FC-0067',
                newFaultCode: 'FC-0000',
                status: 'Success',
                lifecycleStatus: 'Resolved',
                description: 'Fault successfully resolved'
            },
            {
                timestamp: '2025-10-12T10:30:00Z',
                actionType: 'RTOCreated',
                rtoId: 'RTO-9987',
                rtoUrl: 'https://portal.microsoft.com/rto/RTO-9987',
                status: 'Completed',
                description: 'RTO workflow completed'
            },
            {
                timestamp: '2025-10-12T09:15:00Z',
                actionType: 'GDCOCreated',
                gdcoId: 'GDCO-4456',
                gdcoUrl: 'https://portal.microsoft.com/gdco/GDCO-4456',
                status: 'Completed',
                description: 'GDCO ticket resolved'
            },
            {
                timestamp: '2025-10-12T08:30:00Z',
                actionType: 'NodePicked',
                status: 'Picked by AutoSage Automation',
                description: 'Node automatically selected for processing'
            }
        ],
        'NODE-VWX234': [
            {
                timestamp: '2025-10-11T13:00:00Z',
                actionType: 'NodeSkipped',
                status: 'Skipped',
                reason: 'Insufficient data for automation. Node requires manual analysis.',
                lifecycleStatus: 'Pending Manual Review',
                description: 'Node cannot be processed automatically'
            },
            {
                timestamp: '2025-10-11T12:40:00Z',
                actionType: 'NodeEvaluated',
                status: 'Evaluation Complete',
                description: 'Initial evaluation performed'
            }
        ],
        'NODE-YZA567': [
            {
                timestamp: '2025-10-10T18:20:00Z',
                actionType: 'GDCOCreated',
                gdcoId: 'GDCO-4457',
                gdcoUrl: 'https://portal.microsoft.com/gdco/GDCO-4457',
                status: 'Pending',
                description: 'GDCO ticket created, awaiting processing'
            },
            {
                timestamp: '2025-10-10T17:05:00Z',
                actionType: 'NodePicked',
                status: 'Picked by AutoSage Automation',
                description: 'Node automatically selected for processing'
            }
        ]
    };

    return {
        nodeId,
        traces: traceDataMap[nodeId] || [
            {
                timestamp: new Date().toISOString(),
                actionType: 'NodePicked',
                status: 'Picked by AutoSage Automation',
                description: 'Node automatically selected for processing'
            }
        ]
    };
};
