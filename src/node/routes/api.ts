/**
 * API Routes for AI War Room IDE
 * Handles HTTP endpoints for agent management and interaction
 */

import * as express from 'express';
import { AgentService } from '../agents/agent-service';
import { randomUUID } from 'crypto';

export function createApiRouter(agentService: AgentService): express.Router {
  const router = express.Router();

  /**
   * Get all available agents
   */
  router.get('/code-server/src/node/agents', (req, res) => {
    try {
      const agents = agentService.getAllAgents().map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        role: agent.role,
        skills: agent.skills,
        level: agent.level,
        experience: agent.experience
      }));
      
      res.json({ agents });
    } catch (error) {
      console.error('Error fetching agents:', error);
      res.status(500).json({ error: 'Failed to fetch agents' });
    }
  });

  /**
   * Get a specific agent by ID
   */
  router.get('/agents/:id', (req, res) => {
    try {
      const agent = agentService.getAgent(req.params.id);
      
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      
      res.json({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        role: agent.role,
        skills: agent.skills,
        level: agent.level,
        experience: agent.experience
      });
    } catch (error) {
      console.error(`Error fetching agent ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to fetch agent' });
    }
  });

  /**
   * Query an agent with a prompt
   */
  router.post('/agents/:id/query', async (req, res) => {
    try {
      const { prompt, context } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }
      
      const response = await agentService.queryAgent(req.params.id, prompt, context);
      
      res.json(response);
    } catch (error) {
      console.error(`Error querying agent ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to query agent' });
    }
  });

  /**
   * Get agent experience and level information
   */
  router.get('/agents/:id/experience', (req, res) => {
    try {
      const experience = agentService.getAgentExperience(req.params.id);
      
      if (!experience) {
        return res.status(404).json({ error: 'Agent experience not found' });
      }
      
      const progress = agentService.getAgentLevelProgress(req.params.id);
      
      res.json({
        ...experience,
        progress
      });
    } catch (error) {
      console.error(`Error fetching agent experience ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to fetch agent experience' });
    }
  });

  /**
   * Create a new task
   */
  router.post('/tasks', async (req, res) => {
    try {
      const { title, description, agentId } = req.body;
      
      if (!title || !description || !agentId) {
        return res.status(400).json({ error: 'Title, description, and agentId are required' });
      }
      
      const task = await agentService.createTask(title, description, agentId);
      
      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  /**
   * Get all tasks
   */
  router.get('/tasks', (req, res) => {
    try {
      const tasks = agentService.getAllTasks();
      res.json({ tasks });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  /**
   * Get a specific task by ID
   */
  router.get('/tasks/:id', (req, res) => {
    try {
      const task = agentService.getTask(req.params.id);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json(task);
    } catch (error) {
      console.error(`Error fetching task ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  });

  /**
   * Execute a task
   */
  router.post('/tasks/:id/execute', async (req, res) => {
    try {
      const result = await agentService.executeTask(req.params.id);
      res.json(result);
    } catch (error) {
      console.error(`Error executing task ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to execute task' });
    }
  });

  /**
   * Webhook endpoint for blockchain agent NFT verification
   * This is a placeholder for integration with blockchain-based agent ownership
   */
  router.post('/blockchain/verify', (req, res) => {
    try {
      const { tokenId, ownerAddress, signature } = req.body;
      
      // In a real implementation, this would verify the signature and token ownership
      // For now, we'll just acknowledge the request
      
      res.json({
        verified: true,
        tokenId,
        ownerAddress,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error verifying blockchain token:', error);
      res.status(500).json({ error: 'Failed to verify token' });
    }
  });

  /**
   * Simple health check endpoint
   */
  router.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      serviceId: randomUUID()
    });
  });

  return router;
} 