/**
 * Code-server extension for AI War Room IDE
 * This file integrates the agent system with the code-server
 */

import * as express from "express"
import * as path from "path"
import { AgentService } from "./agents/agent-service"
import { createApiRouter } from "./routes/api"
import { logger } from "./agents/logger"
import * as dotenv from "dotenv"
import { WebSocketServer } from "ws"
import { FileSystemProvider } from "./filesystem"
import { ExtensionManager } from "./extensions"

/**
 * Initialize the War Room extension
 * @param app Express application instance
 * @param serverRoot Server root directory
 */
export function initializeWarRoomExtension(app: express.Application, serverRoot: string): void {
  try {
    // Load environment variables
    dotenv.config()

    // Check for required environment variables
    const openRouterApiKey = process.env.OPENROUTER_API_KEY
    if (!openRouterApiKey) {
      logger.warn(
        "OPENROUTER_API_KEY not found in environment variables. Agent functionality will be limited to demo mode.",
      )
    }

    // Initialize agent config directory
    const agentConfigDir = process.env.AGENT_CONFIG_DIR || path.join(serverRoot, "agent-config")

    // Initialize agent service
    const agentService = new AgentService(openRouterApiKey || "demo-mode", agentConfigDir)

    // Enhanced WebSocket integration
    const wss = new WebSocketServer({ noServer: true })

    wss.on("connection", (ws) => {
      ws.on("message", (data) => {
        const message = JSON.parse(data.toString())
        if (message.type === "agent-status") {
          const agents = agentService.getAllAgents()
          ws.send(JSON.stringify({ type: "agent-status", agents }))
        }
      })
    })

    // Integrate WebSocket with HTTP server
    app.server.on("upgrade", (request, socket, head) => {
      if (request.url?.startsWith("/ai-warroom")) {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request)
        })
      }
    })

    // Enhanced API routes with CORS
    const apiRouter = createApiRouter(agentService)
    app.use("/api/agents", apiRouter)

    // Add caching middleware
    app.use("/api/agents", (req, res, next) => {
      res.set("Cache-Control", "public, max-age=30")
      next()
    })

    // Serve War Room static assets
    app.use("/ai-warroom", express.static(path.join(serverRoot, "src/browser/pages")))

    // Unified proxy handler
    app.get("/server-proxy/ai-warroom*", (req, res) => {
      res.sendFile(path.join(serverRoot, "src/browser/pages/ai-warroom.html"))
    })

    // Add these services
    const fsProvider = new FileSystemProvider({
      workspaceRoot: path.join(serverRoot, "workspace"),
    })

    const extensionManager = new ExtensionManager({
      vscodeExtensionsDir: path.join(serverRoot, "extensions"),
    })

    // Add new routes
    app.use("/api/fs", createFSRouter(fsProvider))
    app.use("/api/extensions", createExtensionRouter(extensionManager))

    // Add WebSocket endpoints
    const extensionWss = new WebSocketServer({ noServer: true })
    extensionManager.attachWebSocket(extensionWss)

    app.server.on("upgrade", (request, socket, head) => {
      if (request.url?.startsWith("/extensions")) {
        extensionWss.handleUpgrade(request, socket, head, (ws) => {
          extensionWss.emit("connection", ws, request)
        })
      }
    })

    logger.info("AI War Room extension initialized with full integration")
  } catch (error) {
    logger.error("Failed to initialize AI War Room extension:", error instanceof Error ? error.message : String(error))
    logger.error("War Room will run in limited functionality mode")
  }
}

/**
 * Export route handler for direct integration
 */
export function getWarRoomRouteHandler(serverRoot: string): express.RequestHandler {
  return (req, res) => {
    res.sendFile(path.join(serverRoot, "src/browser/pages/ai-warroom.html"))
  }
}
