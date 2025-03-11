import { Router, Request, Response } from "express"
import { logger } from "./logger"
import { AgentService } from "./agent-service"
import { Agent, AgentResponse, AgentExperience, Task, TaskResult } from "../../common/types"

/**
 * Controller that exposes agent functionality via REST API
 */
export class AgentController {
  private router: Router
  private agentService: AgentService

  constructor(agentService: AgentService) {
    this.agentService = agentService
    this.router = Router()
    this.setupRoutes()
  }

  /**
   * Get the Express router
   */
  public getRouter(): Router {
    return this.router
  }

  /**
   * Setup all routes
   */
  private setupRoutes(): void {
    // Agents
    this.router.get("/agents", this.getAllAgents.bind(this))
    this.router.get("/agents/:id", this.getAgentById.bind(this))
    this.router.post("/agents/:id/query", this.queryAgent.bind(this))

    // Tasks
    this.router.post("/tasks", this.createTask.bind(this))
    this.router.get("/tasks/:id", this.getTaskById.bind(this))
    this.router.post("/tasks/:id/execute", this.executeTask.bind(this))

    logger.debug("Agent controller routes initialized")
  }

  /**
   * Get all agents
   */
  private async getAllAgents(req: Request, res: Response): Promise<void> {
    try {
      const agents = this.agentService.getAllAgents()

      // Map to ensure we don't expose methods in JSON
      const agentsData = agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        role: agent.role,
        level: agent.level,
        experience: agent.experience,
        skills: agent.skills,
        model: agent.model,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
      }))

      res.json({
        success: true,
        data: agentsData,
      })
    } catch (error) {
      logger.error("Failed to get all agents", error)
      res.status(500).json({
        success: false,
        error: "Failed to get agents",
      })
    }
  }

  /**
   * Get agent by ID
   */
  private async getAgentById(req: Request, res: Response): Promise<void> {
    try {
      const agentId = req.params.id
      const agent = this.agentService.getAgent(agentId)

      if (!agent) {
        res.status(404).json({
          success: false,
          error: `Agent not found: ${agentId}`,
        })
        return
      }

      // Don't expose methods in JSON
      const agentData = {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        role: agent.role,
        level: agent.level,
        experience: agent.experience,
        skills: agent.skills,
        model: agent.model,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt,
      }

      res.json({
        success: true,
        data: agentData,
      })
    } catch (error) {
      logger.error(`Failed to get agent by ID: ${req.params.id}`, error)
      res.status(500).json({
        success: false,
        error: "Failed to get agent",
      })
    }
  }

  /**
   * Query an agent
   */
  private async queryAgent(req: Request, res: Response): Promise<void> {
    try {
      const agentId = req.params.id
      const { prompt, context } = req.body

      if (!prompt) {
        res.status(400).json({
          success: false,
          error: "Prompt is required",
        })
        return
      }

      const response = await this.agentService.queryAgent(agentId, prompt, context)

      res.json({
        success: true,
        data: response,
      })
    } catch (error) {
      logger.error(`Failed to query agent: ${req.params.id}`, error)
      res.status(500).json({
        success: false,
        error: "Failed to query agent",
      })
    }
  }

  /**
   * Create a task
   */
  private async createTask(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, agentId } = req.body

      if (!title || !description || !agentId) {
        res.status(400).json({
          success: false,
          error: "Title, description, and agentId are required",
        })
        return
      }

      const task = await this.agentService.createTask(title, description, agentId)

      res.status(201).json({
        success: true,
        data: task,
      })
    } catch (error) {
      logger.error("Failed to create task", error)
      res.status(500).json({
        success: false,
        error: "Failed to create task",
      })
    }
  }

  /**
   * Get task by ID
   */
  private async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const taskId = req.params.id
      // For simplicity, we don't have a separate method to get a task by ID
      // In a real implementation, you would add this method to the agent service

      res.json({
        success: true,
        data: {
          id: taskId,
          message: "Task retrieval not implemented",
        },
      })
    } catch (error) {
      logger.error(`Failed to get task by ID: ${req.params.id}`, error)
      res.status(500).json({
        success: false,
        error: "Failed to get task",
      })
    }
  }

  /**
   * Execute a task
   */
  private async executeTask(req: Request, res: Response): Promise<void> {
    try {
      const taskId = req.params.id

      const result = await this.agentService.executeTask(taskId)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      logger.error(`Failed to execute task: ${req.params.id}`, error)
      res.status(500).json({
        success: false,
        error: "Failed to execute task",
      })
    }
  }
}
