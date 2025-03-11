/**
 * Core types for the Agent system
 */

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  permissionLevel: 'low' | 'medium' | 'high';
}

export interface AgentProtocolConfig {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  securityLevel: 'standard' | 'enhanced' | 'maximum';
}

export interface AgentCommunicationProtocol {
  id: string;
  name: string;
  type: 'p2p' | 'client-server' | 'hybrid';
  encryption: boolean;
  verifyMessage: (message: AgentMessage) => Promise<boolean>;
  sendMessage: (message: AgentMessage) => Promise<boolean>;
}

export interface AgentMessage {
  id: string;
  sender: string;
  recipient: string;
  content: any;
  timestamp: number;
  signature?: string;
  encrypted: boolean;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  protocols: string[];
  model: string;
  version: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentRuntime {
  id: string;
  status: 'idle' | 'running' | 'paused' | 'error';
  memory: {
    allocated: number;
    used: number;
  };
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

export interface AgentPerformanceMetrics {
  responseTime: number;
  successRate: number;
  errorRate: number;
  taskCompletionRate: number;
  userSatisfactionScore: number;
}

export interface AgentSecurityPolicy {
  id: string;
  name: string;
  description: string;
  rules: {
    allowedDomains?: string[];
    allowedApis?: string[];
    maxTokensPerRequest?: number;
    requireEncryption: boolean;
    requireAuthentication: boolean;
    requireAuthorization: boolean;
  };
}

export interface AgentLearningConfig {
  enabled: boolean;
  mode: 'supervised' | 'reinforcement' | 'federated';
  learningRate: number;
  feedbackIntegration: boolean;
}

export enum AgentStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  ERROR = 'error'
}

export enum AgentPermissionLevel {
  READ = 'read',
  WRITE = 'write',
  EXECUTE = 'execute',
  ADMIN = 'admin'
}
