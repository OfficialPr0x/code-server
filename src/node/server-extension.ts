/**
 * Code-server extension for AI War Room IDE
 * This file integrates the agent system with the code-server
 */

import * as express from 'express';
import { Router } from 'express';
import * as path from 'path';
import { Server } from 'http';
import { WebSocketServer } from 'ws';
const dotenv = require('dotenv');
import { AgentService } from './agents/agent-service';
import { createApiRouter } from './routes/api';
import { logger } from './logger';
import type { Request } from 'express';
import type { Socket } from 'net';

// Define interfaces that will be implemented later
export interface FileSystemProvider {
  workspaceRoot: string;
}

export interface ExtensionManager {
  vscodeExtensionsDir: string;
  attachWebSocket(wss: WebSocketServer): void;
}

// Extend Express Application to include server
declare module "express" {
  interface Application {
    server: Server;
  }
}

/**
 * Initialize the War Room extension
 * @param app Express application instance
 * @param serverRoot Server root directory
 */
export function initializeWarRoomExtension(app: express.Application, serverRoot: string): void {
  try {
    console.log('Starting AI War Room Extension initialization...');
    
    // Load environment variables
    dotenv.config();
    
    // Check for required environment variables
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      logger.warn('OPENROUTER_API_KEY not found in environment variables. Agent functionality will be limited to demo mode.');
    }
    
    // Initialize agent config directory
    const agentConfigDir = process.env.AGENT_CONFIG_DIR || path.join(serverRoot, 'agent-config');
    console.log(`Agent config directory: ${agentConfigDir}`);
    
    // Initialize agent service
    const agentService = new AgentService(
      openRouterApiKey || 'demo-mode',
      serverRoot
    );
    
    // Initialize the agent service
    agentService.initialize().catch(err => {
      logger.error('Failed to initialize agent service:', err);
    });
    
    console.log('Agent service initialized successfully');
    
    // Enhanced WebSocket integration
    const wss = new WebSocketServer({ noServer: true });
    
    wss.on('connection', (ws) => {
      console.log('New WebSocket connection established');
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('Received message via WebSocket:', message);
          
          if (message.type === 'agent-status') {
            const agents = agentService.getAllAgents();
            console.log(`Sending status for ${agents.length} agents`);
            ws.send(JSON.stringify({ type: 'agent-status', agents }));
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });
      
      ws.on('close', () => {
        console.log('WebSocket connection closed');
      });
    });
    
    // Setup WebSocket handling for upgrade requests
    app.server.on('upgrade', (request: Request, socket: Socket, head: Buffer) => {
      console.log(`WebSocket upgrade request for: ${request.url}`);
      
      if (request.url?.startsWith('/ai-warroom')) {
        wss.handleUpgrade(request, socket, head, (ws) => {
          console.log('WebSocket connection upgraded successfully');
          wss.emit('connection', ws, request);
        });
      }
    });

    // Enhanced API routes with CORS
    const apiRouter = createApiRouter(agentService);
    
    // Mount the API router at the correct path
    app.use('/api/ai', apiRouter);
    console.log('API router mounted at /api/ai');
    
    // Add caching middleware for API routes
    app.use('/api/ai', (req, res, next) => {
      res.set('Cache-Control', 'public, max-age=30');
      next();
    });

    // Serve War Room static assets
    const staticPath = path.join(serverRoot, 'src/browser/pages');
    console.log(`Serving static files from: ${staticPath}`);
    
    // Check if the directory exists
    try {
      const fs = require('fs');
      if (!fs.existsSync(staticPath)) {
        logger.error(`Static path does not exist: ${staticPath}`);
      }
    } catch (err) {
      logger.error(`Error checking static path: ${err instanceof Error ? err.message : String(err)}`);
    }
    
    app.use('/ai-warroom', express.static(staticPath));
    
    // Add a specific route for the main HTML file with no authentication
    app.get('/ai-warroom', (req, res) => {
      const htmlPath = path.join(staticPath, 'ai-warroom.html');
      console.log(`Serving AI War Room HTML from: ${htmlPath}`);
      
      // Set header to bypass authentication
      req.headers['x-authenticated'] = 'true';
      
      res.sendFile(htmlPath);
    });
    
    // Add a public route to access the AI War Room without authentication
    app.get('/public/ai-warroom', (req, res) => {
      const htmlPath = path.join(staticPath, 'ai-warroom.html');
      console.log(`Serving AI War Room HTML (public route) from: ${htmlPath}`);
      res.sendFile(htmlPath);
    });
    
    // Unified proxy handler
    app.get('/server-proxy/ai-warroom*', (req, res) => {
      const htmlPath = path.join(serverRoot, 'src/browser/pages/ai-warroom.html');
      console.log(`Serving AI War Room HTML (proxy route) from: ${htmlPath}`);
      res.sendFile(htmlPath);
    });

    // Add these services
    const fsProvider: FileSystemProvider = {
      workspaceRoot: path.join(serverRoot, 'workspace')
    };

    // Extension management support
    const extensionManager: ExtensionManager = {
      vscodeExtensionsDir: path.join(serverRoot, 'extensions'),
      attachWebSocket(wss: WebSocketServer) {
        wss.on('connection', (ws) => {
          ws.on('message', (data) => {
            try {
              const message = JSON.parse(data.toString());
              console.log('Extension WebSocket message:', message);
              
              if (message.type === 'search') {
                // Handle extension search
                ws.send(JSON.stringify({
                  type: 'search-results',
                  results: []
                }));
              }
            } catch (error) {
              console.error('Error processing extension WebSocket message:', error);
            }
          });
        });
      }
    };
    
    console.log('AI War Room extension initialized successfully');
    
  } catch (error) {
    logger.error('AI War Room extension initialization failed:', error);
    console.error('AI War Room extension initialization failed:', error);
  }
}

/**
 * Get a route handler for the War Room page
 */
export function getWarRoomRouteHandler(serverRoot: string): express.RequestHandler {
  return (req, res) => {
    res.sendFile(path.join(serverRoot, 'src/browser/pages/ai-warroom.html'));
  };
}

/**
 * Create a filesystem router
 */
export function createFSRouter(fsProvider: FileSystemProvider): Router {
  const router = Router();
  // Implement filesystem operations here
  return router;
}

/**
 * Create an extension router
 */
export function createExtensionRouter(extensionManager: ExtensionManager): Router {
  const router = Router();
  // Implement extension operations here
  return router;
} 