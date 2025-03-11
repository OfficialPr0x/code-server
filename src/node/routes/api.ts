import * as express from "express"
import { Router } from "express"
import { ensureAuthenticated } from "../http"
import { AgentService } from "../agents/agent-service"
import { logger } from "../logger"

/**
 * Create an API router for the AI War Room
 */
export function createApiRouter(agentService?: AgentService): Router {
  const router = Router()

  // Ensure all API routes require authentication
  router.use(ensureAuthenticated)

  // Get all agents
  router.get("/agents", (req, res) => {
    if (!agentService) {
      return res.status(503).json({ error: "Agent service is not initialized" })
    }

    const agents = agentService.getAllAgents()
    return res.json({
      agents: agents.map(agent => agent.toJSON())
    })
  })

  // Get a specific agent
  router.get("/agents/:id", (req, res) => {
    if (!agentService) {
      return res.status(503).json({ error: "Agent service is not initialized" })
    }

    const agent = agentService.getAgent(req.params.id)
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" })
    }

    return res.json({ agent: agent.toJSON() })
  })

  // Send a message to an agent
  router.post("/agents/:id/message", express.json(), async (req, res) => {
    if (!agentService) {
      return res.status(503).json({ error: "Agent service is not initialized" })
    }

    const { content, context } = req.body
    if (!content) {
      return res.status(400).json({ error: "Content is required" })
    }

    const agent = agentService.getAgent(req.params.id)
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" })
    }

    try {
      const response = await agent.handleMessage({
        type: "user-message",
        agentId: agent.id,
        content,
        context
      })

      if (!response) {
        return res.status(500).json({ error: "Failed to get response from agent" })
      }

      return res.json(response)
    } catch (error) {
      logger.error("Error in agent message:", error)
      return res.status(500).json({ error: "Failed to process message" })
    }
  })

  return router
} 