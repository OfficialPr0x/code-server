/**
 * Agent Service
 * Manages AI agents in the system
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../logger';

export interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  capabilities: string[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  
  // Method to convert to JSON for API responses
  toJSON(): any;
}

export class AgentService {
  private agents: Agent[] = [];
  private apiKey: string;
  private rootPath: string;
  private configDir: string;

  constructor(apiKey: string, rootPath: string) {
    this.apiKey = apiKey;
    this.rootPath = rootPath;
    this.configDir = path.join(rootPath, 'agent-config');
    
    logger.info(`Agent Service initialized with root path: ${rootPath}`);
  }

  /**
   * Initialize the agent service
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Agent Service');
      
      // Ensure config directory exists
      if (!fs.existsSync(this.configDir)) {
        logger.info(`Creating agent config directory: ${this.configDir}`);
        fs.mkdirSync(this.configDir, { recursive: true });
      }
      
      // Load agent configurations
      await this.loadAgents();
      
      logger.info(`Loaded ${this.agents.length} agents`);
    } catch (error) {
      logger.error('Failed to initialize Agent Service:', error);
      throw error;
    }
  }

  /**
   * Load agents from configuration files
   */
  private async loadAgents(): Promise<void> {
    try {
      const files = fs.readdirSync(this.configDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.configDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const config = JSON.parse(content);
          
          this.agents.push(this.createAgentFromConfig(config));
        }
      }
    } catch (error) {
      logger.error('Error loading agents:', error);
      throw error;
    }
  }

  /**
   * Create an agent from configuration
   */
  private createAgentFromConfig(config: any): Agent {
    return {
      id: config.id || `agent-${Date.now()}`,
      name: config.name || 'Unnamed Agent',
      description: config.description || '',
      model: config.model || 'default',
      capabilities: config.capabilities || [],
      createdAt: config.createdAt ? new Date(config.createdAt) : new Date(),
      updatedAt: config.updatedAt ? new Date(config.updatedAt) : new Date(),
      status: config.status || 'inactive',
      config: config,
      
      toJSON() {
        return {
          id: this.id,
          name: this.name,
          description: this.description,
          model: this.model,
          capabilities: this.capabilities,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
          status: this.status
        };
      }
    };
  }

  /**
   * Get all agents
   */
  getAllAgents(): Agent[] {
    return this.agents;
  }

  /**
   * Get agent by ID
   */
  getAgent(id: string): Agent | undefined {
    return this.agents.find(agent => agent.id === id);
  }

  /**
   * Create a new agent
   */
  async createAgent(config: any): Promise<Agent> {
    const agent = this.createAgentFromConfig({
      ...config,
      id: `agent-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'inactive'
    });
    
    this.agents.push(agent);
    
    // Save agent configuration
    await this.saveAgentConfig(agent);
    
    return agent;
  }

  /**
   * Update an agent
   */
  async updateAgent(id: string, updates: any): Promise<Agent | null> {
    const index = this.agents.findIndex(agent => agent.id === id);
    if (index === -1) {
      return null;
    }
    
    const agent = this.agents[index];
    const updatedAgent = {
      ...agent,
      ...updates,
      updatedAt: new Date(),
      config: {
        ...agent.config,
        ...updates
      }
    };
    
    this.agents[index] = updatedAgent;
    
    // Save updated configuration
    await this.saveAgentConfig(updatedAgent);
    
    return updatedAgent;
  }

  /**
   * Delete an agent
   */
  async deleteAgent(id: string): Promise<boolean> {
    const index = this.agents.findIndex(agent => agent.id === id);
    if (index === -1) {
      return false;
    }
    
    this.agents.splice(index, 1);
    
    // Delete configuration file
    const configPath = path.join(this.configDir, `${id}.json`);
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
    
    return true;
  }

  /**
   * Save agent configuration to file
   */
  private async saveAgentConfig(agent: Agent): Promise<void> {
    const configPath = path.join(this.configDir, `${agent.id}.json`);
    const configData = JSON.stringify(agent.config, null, 2);
    
    fs.writeFileSync(configPath, configData, 'utf8');
  }
}
