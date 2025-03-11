import { AgentService } from "./agents/agent-service";
import { AgentController } from "./agents/agent-controller";
import { Application } from "express";
import * as http from "http";
import express from "express";
import { logger } from "./logger";
import { initializeWarRoomExtension } from "./server-extension";

// Extend the Express Application interface to include server property
interface ExtendedApplication extends express.Express {
  server: http.Server;
}

interface ServerOptions {
  rootPath: string;
  port?: number;
}

export class HttpServer {
  public rootPath: string;
  public app: ExtendedApplication;
  public server: http.Server;
  private agentService?: AgentService;
  private port: number;

  constructor(private readonly options: ServerOptions) {
    this.rootPath = options.rootPath;
    this.port = options.port || 3000; // Default port if not provided
    this.app = express() as ExtendedApplication;
    this.server = http.createServer(this.app);
    
    // Explicitly add server to the app for extension compatibility
    this.app.server = this.server;
    
    this.initialize().catch((err) => logger.error("Initialization failed:", err));
  }

  private async initialize(): Promise<void> {
    try {
      logger.info("Initializing AI agent service");
      const openRouterApiKey = process.env.OPENROUTER_API_KEY || "";
      
      if (openRouterApiKey) {
        this.agentService = new AgentService(openRouterApiKey, this.rootPath);
        const agentController = new AgentController(this.agentService);
        this.app.use("/api", agentController.getRouter());
      } else {
        logger.warn("OpenRouter API key not provided. AI agents will not be available.");
      }
      
      // Log the rootPath to help with debugging
      logger.info(`Server root path: ${this.rootPath}`);
      
      // Initialize the War Room extension
      initializeWarRoomExtension(this.app, this.rootPath);
      logger.info("AI War Room extension initialized");
    } catch (error) {
      logger.error("Initialization failed", error as Error);
      throw error;
    }
  }

  public start(): void {
    this.server.listen(this.port, () => {
      logger.info(`AI War Room server running on port ${this.port}`);
      logger.info(`Server root path: ${this.rootPath}`);
    });
  }
} 

// Start the server
const Application = new HttpServer({ 
  rootPath: __dirname,
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000
});
Application.start();
