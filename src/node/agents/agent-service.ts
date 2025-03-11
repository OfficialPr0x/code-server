/**
 * AI Agent Service for code-server
 * This file manages AI agents on the server-side and provides
 * communication between agents and the frontend
 */

import * as WebSocket from 'ws';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import { logger } from '../logger';
import { EventEmitter } from 'events';

// Agent capability types
type AgentCapability = 
  | 'code-completion'
  | 'debugging'
  | 'code-explanation'
  | 'refactoring'
  | 'documentation'
  | 'error-analysis'
  | 'performance-optimization';

// Agent configuration interface
interface AgentConfig {
  id: string;
  name: string;
  role: string;
  avatar?: string | { icon: string; color: string };
  capabilities: AgentCapability[];
  model?: string;
  contextWindow?: number;
  level?: number;
  progress?: number;
  description?: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  skills?: string[];
  experience?: number;
  ownerAddress?: string;
  tokenId?: string;
}

// Message types for communication with the client
interface ClientMessage {
  type: string;
  agentId: string;
  content?: string;
  context?: any;
}

interface ServerMessage {
  type: string;
  agentId: string;
  content?: string;
  suggestion?: {
    range: {
      startLineNumber: number;
      startColumn: number;
      endLineNumber: number;
      endColumn: number;
    };
    text: string;
  };
  status?: {
    level?: number;
    progress?: number;
  };
}

export class AgentInstance {
  private config: AgentConfig;
  private events: EventEmitter;
  private active: boolean = false;

  constructor(config: AgentConfig) {
    this.config = config;
    this.events = new EventEmitter();
  }

  get id(): string {
    return this.config.id;
  }

  get name(): string {
    return this.config.name;
  }

  get role(): string {
    return this.config.role;
  }

  get capabilities(): AgentCapability[] {
    return this.config.capabilities;
  }

  get avatar(): string | { icon: string; color: string } {
    return this.config.avatar || { icon: 'robot', color: '#007acc' };
  }

  get level(): number {
    return this.config.level || 1;
  }

  get progress(): number {
    return this.config.progress || 0;
  }

  get isActive(): boolean {
    return this.active;
  }

  get description(): string {
    return this.config.description || '';
  }

  get systemPrompt(): string {
    return this.config.systemPrompt || '';
  }

  get model(): string {
    return this.config.model || 'default';
  }

  get maxTokens(): number {
    return this.config.maxTokens || 2048;
  }

  get temperature(): number {
    return this.config.temperature || 0.7;
  }

  get skills(): string[] {
    return this.config.skills || [];
  }

  get experience(): number {
    return this.config.experience || 0;
  }

  get ownerAddress(): string {
    return this.config.ownerAddress || '';
  }

  get tokenId(): string {
    return this.config.tokenId || '';
  }

  set isActive(value: boolean) {
    this.active = value;
  }

  /**
   * Handle a message from the client
   */
  async handleMessage(message: ClientMessage): Promise<ServerMessage | null> {
    logger.debug(`Agent ${this.name} handling message: ${message.type}`);

    switch (message.type) {
      case 'user-message':
        return await this.handleUserMessage(message.content || '', message.context);
      default:
        logger.warn(`Unknown message type for agent ${this.name}: ${message.type}`);
        return null;
    }
  }

  /**
   * Handle a user message
   */
  async handleUserMessage(content: string, context: any): Promise<ServerMessage> {
    // In a real implementation, this would connect to an AI API like OpenAI
    // For demo purposes, we'll just echo back the message

    // Simple timeout to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple response for demonstration
    const response = `I received your message: "${content}".\n\nAs a ${this.role}, I can help with: ${this.capabilities.join(', ')}.\n\nThis is a simulated response since this is a demo implementation.`;

    // Update agent status (simulate progress)
    this.config.progress = Math.min(100, (this.config.progress || 0) + 5);
    if (this.config.progress >= 100) {
      this.config.level = (this.config.level || 1) + 1;
      this.config.progress = 0;
    }

    return {
      type: 'agent-response',
      agentId: this.id,
      content: response,
      status: {
        level: this.config.level,
        progress: this.config.progress,
      }
    };
  }

  /**
   * Get the agent configuration as a JSON object
   */
  toJSON(): AgentConfig {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      avatar: this.avatar,
      capabilities: this.capabilities,
      level: this.level,
      progress: this.progress,
      description: this.description,
      systemPrompt: this.systemPrompt,
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature,
      skills: this.skills,
      experience: this.experience,
      ownerAddress: this.ownerAddress,
      tokenId: this.tokenId,
    };
  }
}

export class AgentService {
  private agents: Map<string, AgentInstance> = new Map();
  private connections: Map<WebSocket, Set<string>> = new Map();
  private wsServer: WebSocket.Server | null = null;
  private config: {
    agentsPath: string;
    apiKey?: string;
  };

  constructor(apiKey?: string, rootPath?: string) {
    // Default configuration
    const agentConfigDir = process.env.AGENT_CONFIG_DIR || 'data/agents';
    this.config = {
      agentsPath: rootPath ? path.join(rootPath, agentConfigDir) : path.join(process.cwd(), agentConfigDir),
      apiKey: apiKey
    };

    // Create agents directory if it doesn't exist
    if (!fs.existsSync(this.config.agentsPath)) {
      try {
        fs.mkdirSync(this.config.agentsPath, { recursive: true });
      } catch (error) {
        logger.error(`Failed to create agents directory:`, error);
      }
    }
  }

  /**
   * Initialize the agent service and load all agents
   */
  async initialize(): Promise<void> {
    // Load default agents if no agents exist
    await this.loadAgents();

    if (this.agents.size === 0) {
      await this.createDefaultAgents();
    }

    logger.info(`Agent service initialized with ${this.agents.size} agents`);
  }

  /**
   * Setup the WebSocket server for agent communication
   */
  setupWebSocket(server: http.Server, path: string = '/ai-agents'): void {
    this.wsServer = new WebSocket.Server({
      server,
      path,
    });

    this.wsServer.on('connection', (socket: WebSocket) => {
      logger.debug('New agent client connected');
      
      // Initialize connection map
      this.connections.set(socket, new Set());

      socket.on('message', async (message) => {
        try {
          const parsedMessage = JSON.parse(message.toString()) as ClientMessage;
          await this.handleClientMessage(socket, parsedMessage);
        } catch (error) {
          logger.error('Failed to handle client message:', error);
          
          try {
            socket.send(JSON.stringify({
              type: 'error',
              content: 'Failed to process message',
            }));
          } catch (sendError) {
            logger.error('Failed to send error response:', sendError);
          }
        }
      });

      socket.on('close', () => {
        logger.debug('Agent client disconnected');
        this.connections.delete(socket);
      });

      // Send initial list of available agents
      this.sendAgentList(socket);
    });

    logger.info(`Agent WebSocket server started on ${path}`);
  }

  /**
   * Handle a message from a client
   */
  private async handleClientMessage(socket: WebSocket, message: ClientMessage): Promise<void> {
    const { type, agentId } = message;

    logger.debug(`Received agent message: ${type} for agent ${agentId}`);

    const agent = this.agents.get(agentId);
    if (!agent) {
      logger.warn(`Agent ${agentId} not found`);
      socket.send(JSON.stringify({
        type: 'error',
        content: `Agent ${agentId} not found`,
      }));
      return;
    }

    // Track which agents the client is interacting with
    const agentSet = this.connections.get(socket);
    if (agentSet) {
      agentSet.add(agentId);
    }

    // Handle the message
    try {
      const response = await agent.handleMessage(message);
      if (response) {
        socket.send(JSON.stringify(response));
      }
    } catch (error) {
      logger.error(`Error handling message for agent ${agentId}:`, error);
      socket.send(JSON.stringify({
        type: 'error',
        agentId,
        content: 'Failed to process message',
      }));
    }
  }

  /**
   * Send the list of available agents to a client
   */
  private sendAgentList(socket: WebSocket): void {
    const agentList = Array.from(this.agents.values()).map(agent => agent.toJSON());
    
    socket.send(JSON.stringify({
      type: 'agent-list',
      agents: agentList,
    }));
  }

  /**
   * Load all agents from the agents directory
   */
  private async loadAgents(): Promise<void> {
    try {
      if (!fs.existsSync(this.config.agentsPath)) {
        return;
      }

      const files = fs.readdirSync(this.config.agentsPath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(this.config.agentsPath, file);
            const agentConfig = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as AgentConfig;
            
            this.registerAgent(new AgentInstance(agentConfig));
            logger.debug(`Loaded agent ${agentConfig.name} from ${filePath}`);
          } catch (error) {
            logger.error(`Failed to load agent from ${file}:`, error);
          }
        }
      }
    } catch (error) {
      logger.error('Failed to load agents:', error);
    }
  }

  /**
   * Create default agents if none exist
   */
  private async createDefaultAgents(): Promise<void> {
    const defaultAgents: AgentConfig[] = [
      {
        id: 'code-assistant',
        name: 'Code Assistant',
        role: 'Code Assistant',
        avatar: { icon: 'bx-code-alt', color: '#3b82f6' },
        capabilities: [
          'code-completion',
          'refactoring',
          'documentation',
        ],
        level: 3,
        progress: 70,
      },
      {
        id: 'debug-wizard',
        name: 'Debug Wizard',
        role: 'Debugger',
        avatar: { icon: 'bx-bug', color: '#ef4444' },
        capabilities: [
          'debugging',
          'error-analysis',
          'performance-optimization',
        ],
        level: 2,
        progress: 45,
      },
    ];

    for (const config of defaultAgents) {
      const agent = new AgentInstance(config);
      this.registerAgent(agent);

      // Save the agent configuration
      await this.saveAgentConfig(agent);
    }

    logger.info(`Created ${defaultAgents.length} default agents`);
  }

  /**
   * Register a new agent
   */
  registerAgent(agent: AgentInstance): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Get an agent by ID
   */
  getAgent(id: string): AgentInstance | undefined {
    return this.agents.get(id);
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): AgentInstance[] {
    return Array.from(this.agents.values());
  }

  /**
   * Save an agent's configuration to disk
   */
  async saveAgentConfig(agent: AgentInstance): Promise<void> {
    try {
      const filePath = path.join(this.config.agentsPath, `${agent.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(agent.toJSON(), null, 2));
      logger.debug(`Saved agent ${agent.name} to ${filePath}`);
    } catch (error) {
      logger.error(`Failed to save agent ${agent.id}:`, error);
    }
  }

  /**
   * Close the WebSocket server and cleanup
   */
  async dispose(): Promise<void> {
    if (this.wsServer) {
      this.wsServer.close();
    }

    this.connections.clear();
    logger.info('Agent service disposed');
  }

  // New methods required by the controller
  async queryAgent(agentId: string, prompt: string, context: any = {}): Promise<any> {
    logger.info(`Querying agent ${agentId} with prompt: ${prompt.substring(0, 50)}...`);
    const agent = this.getAgent(agentId);
    
    if (!agent) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }

    // This is a placeholder implementation - in a real application, 
    // this would call an LLM API with the appropriate model
    return {
      agentId,
      content: `Response from agent ${agent.name} to prompt: ${prompt.substring(0, 30)}...`,
      timestamp: new Date().toISOString()
    };
  }

  async createTask(title: string, description: string, agentId: string): Promise<any> {
    logger.info(`Creating task "${title}" for agent ${agentId}`);
    const agent = this.getAgent(agentId);
    
    if (!agent) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }

    // Generate a unique task ID
    const taskId = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // This is a placeholder implementation
    return {
      id: taskId,
      title,
      description,
      agentId,
      status: 'created',
      createdAt: new Date().toISOString()
    };
  }

  async executeTask(taskId: string): Promise<any> {
    logger.info(`Executing task ${taskId}`);
    
    // This is a placeholder implementation
    return {
      id: taskId,
      status: 'completed',
      result: 'Task executed successfully',
      completedAt: new Date().toISOString()
    };
  }
}