import { BurninRun, CRCExperimentRun } from '../types';

export const mockBurninRuns: Record<string, BurninRun[]> = {
  'NODE001': [
    {
      nodeId: 'NODE001',
      burninStartDate: '2024-01-15 08:00:00',
      burninEndDate: '2024-01-16 08:00:00',
      burninStatus: 'Pass',
      burninErrorDescription: '-'
    },
    {
      nodeId: 'NODE001',
      burninStartDate: '2024-01-10 08:00:00',
      burninEndDate: '2024-01-11 08:00:00',
      burninStatus: 'Failed',
      burninErrorDescription: 'Memory test failed at address 0x8000000'
    }
  ],
  'NODE002': [
    {
      nodeId: 'NODE002',
      burninStartDate: '2024-01-14 10:00:00',
      burninEndDate: '2024-01-15 10:00:00',
      burninStatus: 'Pass',
      burninErrorDescription: '-'
    }
  ],
  'NODE003': [
    {
      nodeId: 'NODE003',
      burninStartDate: '2024-01-20 14:30:00',
      burninEndDate: '2024-01-21 14:30:00',
      burninStatus: 'Pass',
      burninErrorDescription: '-'
    }
  ]
};

export const mockCRCExperimentRuns: Record<string, CRCExperimentRun[]> = {
  'NODE001': [
    {
      experimentId: 'EXP-2024-001',
      experimentName: 'CoreMark Performance Test',
      experimentStatus: 'Failed',
      nodeId: 'NODE001',
      workloadName: 'PERF-CPU-COREMARK',
      status: 'Failed',
      duration: '45m 30s',
      environment: 'juno-prod01',
      tipSessionId: '7999e653-85ef-4e68-96d2-92df0585f795'
    },
    {
      experimentId: 'EXP-2024-002',
      experimentName: 'CoreMark Performance Test Retry',
      experimentStatus: 'Succeeded',
      nodeId: 'NODE001',
      workloadName: 'PERF-CPU-COREMARK',
      status: 'Succeeded',
      duration: '42m 15s',
      environment: 'juno-prod01',
      tipSessionId: 'a59a5b1e-4eb7-485b-a0b1-092b20240534'
    },
    {
      experimentId: 'EXP-2024-003',
      experimentName: 'CoreMark Validation',
      experimentStatus: 'Succeeded',
      nodeId: 'NODE001',
      workloadName: 'PERF-CPU-COREMARK',
      status: 'Succeeded',
      duration: '43m 05s',
      environment: 'juno-prod01',
      tipSessionId: 'a64e6747-0047-4bc8-80bb-681193e4466d'
    }
  ],
  'NODE002': [
    {
      experimentId: 'EXP-2024-004',
      experimentName: 'Prime95 Stress Test',
      experimentStatus: 'Succeeded',
      nodeId: 'NODE002',
      workloadName: 'PERF-CPU-PRIME95',
      status: 'Succeeded',
      duration: '1h 15m 20s',
      environment: 'juno-prod01',
      tipSessionId: 'c12e4567-89ab-4cde-f012-3456789abcde'
    }
  ],
  'NODE003': [
    {
      experimentId: 'EXP-2024-005',
      experimentName: 'All Workloads Test',
      experimentStatus: 'Succeeded',
      nodeId: 'NODE003',
      workloadName: 'PERF-CPU-COREMARK',
      status: 'Succeeded',
      duration: '44m 50s',
      environment: 'juno-prod01',
      tipSessionId: 'd23f5678-90bc-5def-0123-456789abcdef'
    },
    {
      experimentId: 'EXP-2024-006',
      experimentName: 'Prime95 Validation',
      experimentStatus: 'Succeeded',
      nodeId: 'NODE003',
      workloadName: 'PERF-CPU-PRIME95',
      status: 'Succeeded',
      duration: '1h 20m 10s',
      environment: 'juno-prod01',
      tipSessionId: 'e34g6789-01cd-6efg-1234-56789abcdefg'
    }
  ]
};

export const getBurninRunsForNode = (nodeId: string): BurninRun[] => {
  return mockBurninRuns[nodeId] || [];
};

export const getCRCExperimentRunsForNode = (nodeId: string): CRCExperimentRun[] => {
  return mockCRCExperimentRuns[nodeId] || [];
};
