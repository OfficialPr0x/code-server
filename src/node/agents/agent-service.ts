import { logger } from "@coder/logger";
import { AgentConfig, Agent, AgentResponse, AgentRole, LevelUpEvent, AgentExperience, Task, AgentTask, TaskResult, ExperienceAction } from './types';
import { OpenRouterClient } from './open-router-client';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { getDefaultAgents, calculateLevelFromExperience, getLevelProgress } from './default-agents';

/**
 * Service that manages AI agents
 */
export class AgentService extends EventEmitter {
  private agents: Map<string, Agent> = new Map();
  private openRouterClient: OpenRouterClient;
  private configDir: string;
  private tasksInProgress: Map<string, AgentTask> = new Map();
  private experiences: Map<string, AgentExperience> = new Map();
  private tasks: Map<string, Task> = new Map();
  
  constructor(openRouterApiKey: string, configDir: string) {
    super();
    this.openRouterClient = new OpenRouterClient(openRouterApiKey);
    this.configDir = configDir;
    this.initializeAgents();
    this.loadExperienceData();
    
    logger.info("Agent service initialized");
  }
  
  /**
   * Initialize agents from config directory
   */
  private initializeAgents(): void {
    try {
      const agentsDir = path.join(this.configDir, 'agents');
      
      if (!fs.existsSync(agentsDir)) {
        fs.mkdirSync(agentsDir, { recursive: true });
        this.createDefaultAgents();
        return;
      }
      
      const files = fs.readdirSync(agentsDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        try {
          const agentConfigPath = path.join(agentsDir, file);
          const agentConfigJson = fs.readFileSync(agentConfigPath, 'utf8');
          const agentConfig = JSON.parse(agentConfigJson) as AgentConfig;
          
          this.registerAgent(agentConfig);
          logger.debug(`Loaded agent: ${agentConfig.name}`);
        } catch (error) {
          logger.error(`Failed to load agent from file ${file}:`, error);
        }
      }
      
      if (this.agents.size === 0) {
        logger.info('No agents found in config directory, creating defaults');
        this.createDefaultAgents();
      }
    } catch (error) {
      logger.error('Failed to initialize agents:', error);
      this.createDefaultAgents();
    }
  }
  
  /**
   * Create default agents when none exist
   */
  private createDefaultAgents(): void {
    try {
      const defaultAgents = getDefaultAgents();
      
      for (const agentConfig of defaultAgents) {
        this.registerAgent(agentConfig);
        this.saveAgentConfig(agentConfig);
        logger.debug(`Created default agent: ${agentConfig.name}`);
      }
      
      logger.info(`Created ${defaultAgents.length} default agents`);
    } catch (error) {
      logger.error('Failed to create default agents:', error);
    }
  }
  
  /**
   * Load agent experience data
   */
  private loadExperienceData(): void {
    try {
      const experienceDir = path.join(this.configDir, 'experience');
      
      if (!fs.existsSync(experienceDir)) {
        fs.mkdirSync(experienceDir, { recursive: true });
        return;
      }
      
      const files = fs.readdirSync(experienceDir);
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        try {
          const experiencePath = path.join(experienceDir, file);
          const experienceJson = fs.readFileSync(experiencePath, 'utf8');
          const experience = JSON.parse(experienceJson) as AgentExperience;
          
          this.experiences.set(experience.agentId, experience);
          logger.debug(`Loaded experience data for agent: ${experience.agentId}`);
        } catch (error) {
          logger.error(`Failed to load experience data from file ${file}:`, error);
        }
      }
    } catch (error) {
      logger.error('Failed to load experience data:', error);
    }
  }
  
  /**
   * Save agent experience data
   */
  private saveExperienceData(): void {
    try {
      const experienceDir = path.join(this.configDir, 'experience');
      
      if (!fs.existsSync(experienceDir)) {
        fs.mkdirSync(experienceDir, { recursive: true });
      }
      
      for (const [agentId, experience] of this.experiences.entries()) {
        const experiencePath = path.join(experienceDir, `${agentId}.json`);
        fs.writeFileSync(experiencePath, JSON.stringify(experience, null, 2));
        logger.debug(`Saved experience data for agent: ${agentId}`);
      }
    } catch (error) {
      logger.error('Failed to save experience data:', error);
    }
  }
  
  /**
   * Register an agent in the service
   * @param config Agent configuration
   * @returns The registered agent
   */
  public registerAgent(config: AgentConfig): Agent {
    // Create the agent object
    const agent: Agent = {
      id: config.id,
      name: config.name,
      description: config.description,
      systemPrompt: config.systemPrompt,
      model: config.model,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      role: config.role,
      skills: config.skills,
      level: config.level,
      experience: config.experience,
      ownerAddress: config.ownerAddress,
      tokenId: config.tokenId,
      
      // Bind methods to this agent
      query: async (prompt: string, context?: any) => {
        return this.queryAgent(agent.id, prompt, context);
      },
      
      addExperience: async (amount: number) => {
        await this.addAgentExperience(agent.id, 'query', amount);
      }
    };
    
    // Add to the registry
    this.agents.set(agent.id, agent);
    
    // Initialize experience record if not exists
    if (!this.experiences.has(agent.id)) {
      this.experiences.set(agent.id, {
        agentId: agent.id,
        level: agent.level,
        experience: agent.experience,
        actions: []
      });
      this.saveExperienceData();
    }
    
    return agent;
  }
  
  /**
   * Save agent configuration to file
   * @param config Agent configuration to save
   */
  private saveAgentConfig(config: AgentConfig): void {
    try {
      const agentsDir = path.join(this.configDir, 'agents');
      
      if (!fs.existsSync(agentsDir)) {
        fs.mkdirSync(agentsDir, { recursive: true });
      }
      
      const agentPath = path.join(agentsDir, `${config.id}.json`);
      fs.writeFileSync(agentPath, JSON.stringify(config, null, 2));
      logger.debug(`Saved agent config: ${config.name}`);
    } catch (error) {
      logger.error(`Failed to save agent config for ${config.name}:`, error);
    }
  }
  
  /**
   * Get all registered agents
   * @returns Array of all agents
   */
  public getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }
  
  /**
   * Get a specific agent by ID
   * @param id Agent ID to retrieve
   * @returns The agent if found, undefined otherwise
   */
  public getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }
  
  /**
   * Query an agent with a prompt
   * @param agentId ID of the agent to query
   * @param prompt User prompt
   * @param context Optional context to provide
   * @returns Response from the agent
   */
  public async queryAgent(agentId: string, prompt: string, context?: string): Promise<AgentResponse> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    logger.info(`Querying agent ${agent.name} with prompt: ${prompt.substring(0, 50)}...`);
    
    const startTime = Date.now();
    
    try {
      // Prepare the request
      const fullSystemPrompt = context 
        ? `${agent.systemPrompt}\n\nCONTEXT:\n${context}`
        : agent.systemPrompt;
      
      // Make the request
      const response = await this.openRouterClient.completeText(
        agent.model,
        prompt,
        fullSystemPrompt,
        agent.maxTokens,
        agent.temperature
      );
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Record the response
      const agentResponse: AgentResponse = {
        id: crypto.randomUUID(),
        agentId: agent.id,
        prompt,
        response,
        timestamp: new Date(),
        executionTime,
        model: agent.model
      };
      
      // Add experience to the agent
      await this.addAgentExperience(agent.id, 'query', 10);
      
      return agentResponse;
    } catch (error) {
      logger.error(`Error querying agent ${agent.name}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new task for an agent
   * @param title Task title
   * @param description Task description
   * @param agentId Agent to assign the task to
   * @returns The created task
   */
  public async createTask(title: string, description: string, agentId: string): Promise<Task> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    logger.info(`Creating task "${title}" assigned to agent ${agent.name}`);
    
    const now = new Date();
    
    // Create the task
    const task: Task = {
      id: crypto.randomUUID(),
      description: `${title}: ${description}`,
      context: '',
      requiredRoles: [agent.role as AgentRole],
      status: 'created',
      agentTasks: [
        {
          agentId: agent.id,
          status: 'assigned',
          assigned: now
        }
      ],
      results: [],
      created: now,
      updated: now
    };
    
    // Store the task
    this.tasks.set(task.id, task);
    
    // Track the agent task
    this.tasksInProgress.set(`${task.id}-${agent.id}`, task.agentTasks[0]);
    
    return task;
  }
  
  /**
   * Execute a task
   * @param taskId ID of the task to execute
   * @returns Result of the task execution
   */
  public async executeTask(taskId: string): Promise<TaskResult> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    
    if (task.status !== 'created' && task.status !== 'assigned') {
      throw new Error(`Task ${taskId} is already ${task.status}`);
    }
    
    // Get the agent task
    const agentTask = task.agentTasks[0];
    if (!agentTask) {
      throw new Error(`No agent assigned to task ${taskId}`);
    }
    
    // Get the agent
    const agent = this.agents.get(agentTask.agentId);
    if (!agent) {
      throw new Error(`Agent ${agentTask.agentId} not found for task ${taskId}`);
    }
    
    logger.info(`Executing task ${taskId} with agent ${agent.name}`);
    
    // Update task status
    task.status = 'in_progress';
    agentTask.status = 'in_progress';
    task.updated = new Date();
    
    try {
      // Generate a prompt from the task description
      const prompt = `TASK: ${task.description}\n\nPlease complete this task. Provide a detailed solution.`;
      
      // Query the agent
      const response = await this.queryAgent(agent.id, prompt, task.context);
      
      // Record the result
      const result: TaskResult = {
        agentId: agent.id,
        response,
        timestamp: new Date()
      };
      
      // Update task status
      task.status = 'completed';
      agentTask.status = 'completed';
      agentTask.completed = new Date();
      task.updated = new Date();
      task.results.push(result);
      
      // Award experience points for task completion
      await this.addAgentExperience(agent.id, 'task_completion', 25);
      
      return result;
    } catch (error) {
      logger.error(`Error executing task ${taskId} with agent ${agent.name}:`, error);
      
      // Update task status to failed
      task.status = 'failed';
      agentTask.status = 'failed';
      agentTask.error = error instanceof Error ? error.message : String(error);
      task.updated = new Date();
      
      throw error;
    }
  }
  
  /**
   * Add experience points to an agent
   * @param agentId Agent ID to add experience to
   * @param action Type of action that earned the experience
   * @param points Amount of experience points to add
   * @returns The updated experience record
   */
  public async addAgentExperience(agentId: string, action: string, points: number): Promise<AgentExperience> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    // Get or create experience record
    let experience = this.experiences.get(agentId);
    if (!experience) {
      experience = {
        agentId,
        level: agent.level,
        experience: agent.experience,
        actions: []
      };
      this.experiences.set(agentId, experience);
    }
    
    // Record the action
    const expAction: ExperienceAction = {
      type: action as any,
      amount: points,
      timestamp: new Date()
    };
    experience.actions.push(expAction);
    
    // Add experience
    const oldLevel = experience.level;
    experience.experience += points;
    agent.experience = experience.experience;
    
    // Check for level up
    const newLevel = calculateLevelFromExperience(experience.experience);
    if (newLevel > oldLevel) {
      // Level up!
      experience.level = newLevel;
      agent.level = newLevel;
      
      // Emit level up event
      const levelUpEvent: LevelUpEvent = {
        agentId,
        oldLevel,
        newLevel,
        timestamp: new Date()
      };
      this.emit('levelUp', levelUpEvent);
      
      logger.info(`Agent ${agent.name} leveled up from ${oldLevel} to ${newLevel}!`);
    }
    
    // Save the updated experience and agent
    this.saveExperienceData();
    this.saveAgentConfig({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      systemPrompt: agent.systemPrompt,
      model: agent.model,
      maxTokens: agent.maxTokens,
      temperature: agent.temperature,
      role: agent.role,
      skills: agent.skills,
      level: agent.level,
      experience: agent.experience,
      ownerAddress: agent.ownerAddress,
      tokenId: agent.tokenId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    this.emit('agent-updated', experience);
    return experience;
  }
  
  /**
   * Get all tasks
   * @returns Array of all tasks
   */
  public getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }
  
  /**
   * Get a specific task by ID
   * @param taskId Task ID to retrieve
   * @returns The task if found, undefined otherwise
   */
  public getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }
  
  /**
   * Get experience record for an agent
   * @param agentId Agent ID to get experience for
   * @returns The experience record if found, undefined otherwise
   */
  public getAgentExperience(agentId: string): AgentExperience | undefined {
    return this.experiences.get(agentId);
  }
  
  /**
   * Get level progress information for an agent
   * @param agentId Agent ID to get progress for
   * @returns Level progress information
   */
  public getAgentLevelProgress(agentId: string): { 
    currentLevel: number; 
    currentXP: number; 
    nextLevelXP: number; 
    progress: number; 
  } {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    return getLevelProgress(agent.experience);
  }
}