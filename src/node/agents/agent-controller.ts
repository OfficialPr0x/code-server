import { Router, Request, Response } from "express";
import { logger } from "../logger";
import { AgentService } from "./agent-service";
import { Agent, AgentResponse, Task, TaskResult } from "./types";

/**
 * Controller that exposes agent functionality via REST API
 */
export class AgentController {
  private router: Router;
  private agentService: AgentService;
  
  constructor(agentService: AgentService) {
    this.agentService = agentService;
    this.router = Router();
    this.setupRoutes();
  }
  
  /**
   * Get the Express router
   */
  public getRouter(): Router {
    return this.router;
  }
  
  /**
   * Set up API routes
   */
  private setupRoutes(): void {
    this.router.get('/', this.getAllAgents.bind(this));
    this.router.get('/:id', this.getAgentById.bind(this));
    this.router.post('/:id/query', this.queryAgent.bind(this));
    this.router.post('/:id/tasks', this.createTask.bind(this));
    this.router.get('/tasks/:taskId', this.getTaskById.bind(this));
    this.router.post('/tasks/:taskId/execute', this.executeTask.bind(this));
  }
  
  /**
   * Get all available agents
   */
  private async getAllAgents(req: Request, res: Response): Promise<void> {
    try {
      const agents = this.agentService.getAllAgents();
      
      // Map to ensure we don't expose methods in JSON
      const agentsData = agents.map(agent => {
        // Create a plain object without methods
        const plainAgent = {
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
          // Use default values for timestamp fields if not present
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return plainAgent;
      });
      
      res.json({
        success: true,
        data: agentsData
      });
    } catch (error) {
      logger.error('Error getting agents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get agents'
      });
    }
  }
  
  /**
   * Get a single agent by ID
   */
  private async getAgentById(req: Request, res: Response): Promise<void> {
    try {
      const agentId = req.params.id;
      const agent = this.agentService.getAgent(agentId);
      
      if (!agent) {
        res.status(404).json({
          success: false,
          error: `Agent not found: ${agentId}`
        });
        return;
      }
      
      // Don't expose methods in JSON
      const agentData = {
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        data: agentData
      });
    } catch (error) {
      logger.error(`Error getting agent ${req.params.id}:`, error);
      res.status(500).json({
        success: false,
        error: 'Failed to get agent'
      });
    }
  }
  
  /**
   * Query an agent
   */
  private async queryAgent(req: Request, res: Response): Promise<void> {
    try {
      const agentId = req.params.id;
      const { prompt, context } = req.body;
      
      if (!prompt) {
        res.status(400).json({
          success: false,
          error: "Prompt is required"
        });
        return;
      }
      
      const response = await this.agentService.queryAgent(agentId, prompt, context);
      
      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      logger.error(`Failed to query agent: ${req.params.id}`, error);
      res.status(500).json({
        success: false,
        error: "Failed to query agent"
      });
    }
  }
  
  /**
   * Create a task
   */
  private async createTask(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, agentId } = req.body;
      
      if (!title || !description || !agentId) {
        res.status(400).json({
          success: false,
          error: "Title, description, and agentId are required"
        });
        return;
      }
      
      const task = await this.agentService.createTask(title, description, agentId);
      
      res.status(201).json({
        success: true,
        data: task
      });
    } catch (error) {
      logger.error("Failed to create task", error);
      res.status(500).json({
        success: false,
        error: "Failed to create task"
      });
    }
  }
  
  /**
   * Get task by ID
   */
  private async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const taskId = req.params.taskId;
      // For simplicity, we don't have a separate method to get a task by ID
      // In a real implementation, you would add this method to the agent service
      
      res.json({
        success: true,
        data: {
          id: taskId,
          message: "Task retrieval not implemented"
        }
      });
    } catch (error) {
      logger.error(`Failed to get task by ID: ${req.params.taskId}`, error);
      res.status(500).json({
        success: false,
        error: "Failed to get task"
      });
    }
  }
  
  /**
   * Execute a task
   */
  private async executeTask(req: Request, res: Response): Promise<void> {
    try {
      const taskId = req.params.taskId;
      
      const result = await this.agentService.executeTask(taskId);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error(`Failed to execute task: ${req.params.taskId}`, error);
      res.status(500).json({
        success: false,
        error: "Failed to execute task"
      });
    }
  }
} 