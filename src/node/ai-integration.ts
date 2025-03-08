/**
 * AI War Room Integration for code-server
 * This file handles the integration of AI War Room features into code-server
 */

import * as http from 'http';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { logger } from './logger';
import { AgentService } from './agents/agent-service';
import { Router } from 'express';
import { ensureAuthenticated } from './http';

// AI War Room configuration
export interface AIWarRoomConfig {
  // Whether AI War Room is enabled
  enabled: boolean;
  
  // Path to the AI agents configuration directory
  agentsConfigPath?: string;
  
  // Custom theme configuration
  theme?: {
    // Primary color (gold by default)
    primaryColor?: string;
    
    // Background color
    backgroundColor?: string;
    
    // Whether to apply the theme to the entire IDE
    applyToEntireIDE?: boolean;
  };
}

// Default configuration
const defaultConfig: AIWarRoomConfig = {
  enabled: true,
  theme: {
    primaryColor: '#d4af37', // Gold
    backgroundColor: '#0a0b14', // Dark blue
    applyToEntireIDE: true,
  }
};

// Class to handle AI War Room integration
export class AIWarRoomIntegration {
  private config: AIWarRoomConfig;
  private agentService: AgentService | null = null;
  private rootPath: string;
  
  constructor(configPath?: string) {
    this.rootPath = process.cwd();
    this.config = { ...defaultConfig };
    
    // Load configuration from file if provided
    if (configPath && fs.existsSync(configPath)) {
      try {
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        this.config = { ...defaultConfig, ...configData };
        logger.info('Loaded AI War Room configuration from file');
      } catch (error) {
        logger.error(`Failed to load AI War Room configuration from ${configPath}:`, error);
      }
    }
  }
  
  /**
   * Initialize the AI War Room integration
   */
  async initialize(): Promise<boolean> {
    if (!this.config.enabled) {
      logger.info('AI War Room is disabled in configuration');
      return false;
    }
    
    try {
      // Initialize agent service
      this.agentService = new AgentService(this.config.agentsConfigPath);
      await this.agentService.initialize();
      
      logger.info('AI War Room integration initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize AI War Room integration:', error);
      return false;
    }
  }
  
  /**
   * Create and return the router for AI War Room routes
   */
  createRouter(): express.Router {
    const router = Router();
    
    // Main AI War Room page
    router.get('/ai-warroom', ensureAuthenticated, async (req, res) => {
      const filePath = path.join(this.rootPath, 'src/browser/pages/ai-warroom.html');
      res.sendFile(filePath);
    });
    
    // AI assets
    router.use('/ai/static', ensureAuthenticated, express.static(
      path.join(this.rootPath, 'src/browser/ai')
    ));
    
    // Custom API routes for AI functionality
    router.get('/ai/agents', ensureAuthenticated, (req, res) => {
      if (!this.agentService) {
        return res.status(503).json({ error: 'Agent service not initialized' });
      }
      
      const agents = this.agentService.getAllAgents();
      res.json({ 
        agents: agents.map(agent => agent.toJSON()) 
      });
    });
    
    // Additional API routes can be added here
    
    return router;
  }
  
  /**
   * Setup WebSocket server for agent communication
   */
  setupWebSocket(server: http.Server): void {
    if (!this.agentService) {
      logger.warn('Cannot setup WebSocket server: Agent service not initialized');
      return;
    }
    
    this.agentService.setupWebSocket(server, '/ai-agents');
  }
  
  /**
   * Apply AI theme modifications to the VSCode workbench
   */
  applyThemeModifications(app: express.Express): void {
    if (!this.config.enabled || !this.config.theme?.applyToEntireIDE) {
      return;
    }
    
    // Register a middleware to inject CSS into VS Code's workbench.html
    app.use((req, res, next) => {
      // Store the original send function
      const originalSend = res.send;
      
      // Override the send function
      res.send = function(body): express.Response {
        // Only modify HTML responses
        if (typeof body === 'string' && 
            res.get('Content-Type')?.includes('text/html') && 
            body.includes('<html')) {
          
          // Inject our AI theme CSS link
          body = body.replace(
            '</head>',
            `<link rel="stylesheet" href="/ai/static/ai-warroom.css">
             <script src="/ai/static/ai-agent-system.js" defer></script>
             </head>`
          );
          
          // Modify body class to enable our theme
          body = body.replace(
            '<body',
            '<body class="ai-theme"'
          );
        }
        
        // Call the original send function with the modified body
        return originalSend.call(this, body);
      };
      
      next();
    });
  }
  
  /**
   * Close and clean up AI War Room integration
   */
  async dispose(): Promise<void> {
    if (this.agentService) {
      await this.agentService.dispose();
      this.agentService = null;
    }
    
    logger.info('AI War Room integration disposed');
  }
}

// Export a factory function to create the integration
export function createAIWarRoomIntegration(configPath?: string): AIWarRoomIntegration {
  return new AIWarRoomIntegration(configPath);
} 