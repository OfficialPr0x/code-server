export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  algorithm: {
    type: 'neural' | 'decision-tree' | 'ensemble';
    complexity: number;
    trainingDataHash: string;
  };
  securityProtocols: string[];
  ownership: {
    currentOwner: string;
    ownershipHistory: string[];
    nftContractAddress?: string;
  };
  deployment: {
    environments: string[];
    currentEnv: 'dev' | 'staging' | 'prod';
    containerSpec: string;
  };
  performanceMetrics: {
    accuracy: number;
    speed: number;
    reliability: number;
  };
  economicModel: {
    tokenStandard: 'ERC-20' | 'ERC-721' | 'ERC-1155';
    rewardStructure: string;
    stakingRequirements: number;
  };
  governance: {
    votingSystem: 'quadratic' | 'weighted';
    daoAddress?: string;
  };
  training: {
    datasets: string[];
    lastTrained: Date;
    trainingCost: number;
  };
  plugins: {
    approved: string[];
    blacklisted: string[];
  };
  network: {
    peers: string[];
    reputationScore: number;
  };
  versioning: {
    current: string;
    updateHistory: string[];
  };
} 