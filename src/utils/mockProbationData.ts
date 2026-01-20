import { ProbationNode } from '../types';

const generateRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateGuid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const generateTipNodeSessionId = (hasSession: boolean): string => {
  return hasSession ? generateGuid() : '00000000-0000-0000-0000-000000000000';
};

const regions = ['EastUS', 'EastUS2', 'WestUS', 'CentralUS'];
const sourceTypes = ['Compute', 'M-Series'];
const deviceTypes = ['Blade', 'Soc', 'Chassis'];
const nodeStatuses: ('Probation' | 'Production' | 'OFR')[] = ['Probation', 'Production', 'OFR'];
const statuses: ('Pass' | 'Failed')[] = ['Pass', 'Failed'];
const agentStatuses: ('In Progress' | 'Completed' | 'Failed')[] = ['In Progress', 'Completed', 'Failed'];

const generateDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const generateMockProbationNodes = (count: number = 50): ProbationNode[] => {
  const nodes: ProbationNode[] = [];

  for (let i = 1; i <= count; i++) {
    const gen = generateRandomInt(5, 10);
    const satNumber = generateRandomInt(1, 5);
    const appNumber = generateRandomInt(1, 20);
    const containerCount = generateRandomInt(0, 10);
    const hasSession = Math.random() > 0.3;
    const nodeStatus = nodeStatuses[Math.floor(Math.random() * nodeStatuses.length)];
    const ageInProbation = generateRandomInt(1, 100);

    nodes.push({
      id: i.toString(),
      nodeId: `NODE${String(i).padStart(6, '0')}`,
      tenant: `SAT${satNumber}PrdApp${appNumber}`,
      isQualified: Math.random() > 0.3 ? 'Yes' : 'No',
      sourceType: sourceTypes[Math.floor(Math.random() * sourceTypes.length)],
      model: 'Lenovo-Azure-Compute-GP-MM-Intel-WCS-C21A0_RevA',
      gen,
      deviceType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
      sku: `ERASSY-AZURE-COMPUTE-GP-MM-GEN${gen}.2-INTEL-104-Lenovo-M1262541-001-MSF-065759`,
      region: regions[Math.floor(Math.random() * regions.length)],
      fallBackCountInProbation: generateRandomInt(1, 100),
      ageInProbation,
      nodeStatus,
      selected: false,
      rtoCreatedDate: generateDate(generateRandomInt(1, 30)),
      rtoTrackingUrl: `https://rto.example.com/${generateGuid()}`,
      crcStatus: statuses[Math.floor(Math.random() * statuses.length)],
      burninStatus: statuses[Math.floor(Math.random() * statuses.length)],
      actionTaken: Math.random() > 0.5 ? 'Sent to Burnin' : 'Sent to Production',
      nodeState: 'Ready',
      processedInBurninDate: generateDate(generateRandomInt(1, 20)),
      crcExperimentStartDate: generateDate(generateRandomInt(5, 15)),
      crcExperimentEndDate: generateDate(generateRandomInt(1, 5)),
      crcExperimentName: `Probation_Flight_Gen${generateRandomInt(5, 11)}_CRC_v${generateRandomInt(1, 10)}`,
      crcExperimentId: generateGuid(),
      containerCount,
      tipNodeSessionId: generateTipNodeSessionId(hasSession),
      nodeAvailabilityState: 'Probation',
      probationAgentStarted: generateDate(generateRandomInt(5, 30)) + ' 08:00:00',
      sentForBurninAt: generateDate(generateRandomInt(4, 29)) + ' 09:15:00',
      sentForCRCAt: generateDate(generateRandomInt(3, 28)) + ' 11:30:00',
      crcExecutionTime: `${generateRandomInt(20, 90)} mins`,
      burninExecutionTime: `${generateRandomInt(1, 4)} hours`,
      crcRunStatus: statuses[Math.floor(Math.random() * statuses.length)],
      burninRunStatus: statuses[Math.floor(Math.random() * statuses.length)],
      nodeStatusAfterBurninCRC: nodeStatus,
      rtoIdForBurnin: `RTO-BR-${String(i).padStart(3, '0')}`,
      rtoIdForCRC: `RTO-CR-${String(i).padStart(3, '0')}`,
      probationAgentEnded: Math.random() > 0.3 ? generateDate(generateRandomInt(1, 20)) + ' 14:00:00' : '',
      probationAIAgentStatus: agentStatuses[Math.floor(Math.random() * agentStatuses.length)],
    });
  }

  return nodes;
};

export const mockProbationNodes = generateMockProbationNodes(50);
