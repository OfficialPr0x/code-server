import { AgentService } from "./agents/agent-service";
import { AgentController } from "./agents/agent-controller";

export class HttpServer {
  private agentService?: AgentService;

  private async initialize(): Promise<void> {
    // Initialize agent service
    const openRouterApiKey = process.env.OPENROUTER_API_KEY || "";
    if (openRouterApiKey) {
      logger.info("Initializing AI agent service");
      this.agentService = new AgentService(openRouterApiKey, this.rootPath);
      
      // Add agent API routes
      const agentController = new AgentController(this.agentService);
      this.app.use("/api", agentController.getRouter());
    } else {
      logger.warn("OpenRouter API key not provided. AI agents will not be available.");
    }
  }
} 