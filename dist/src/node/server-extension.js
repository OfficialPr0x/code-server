"use strict";
/**
 * Code-server extension for AI War Room IDE
 * This file integrates the agent system with the code-server
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWarRoomExtension = initializeWarRoomExtension;
exports.getWarRoomRouteHandler = getWarRoomRouteHandler;
exports.createFSRouter = createFSRouter;
exports.createExtensionRouter = createExtensionRouter;
const express = __importStar(require("express"));
const express_1 = require("express");
const path = __importStar(require("path"));
const ws_1 = require("ws");
const dotenv = require('dotenv');
const agent_service_1 = require("./agents/agent-service");
const api_1 = require("./routes/api");
const logger_1 = require("./logger");
/**
 * Initialize the War Room extension
 * @param app Express application instance
 * @param serverRoot Server root directory
 */
function initializeWarRoomExtension(app, serverRoot) {
    try {
        console.log('Starting AI War Room Extension initialization...');
        // Load environment variables
        dotenv.config();
        // Check for required environment variables
        const openRouterApiKey = process.env.OPENROUTER_API_KEY;
        if (!openRouterApiKey) {
            logger_1.logger.warn('OPENROUTER_API_KEY not found in environment variables. Agent functionality will be limited to demo mode.');
        }
        // Initialize agent config directory
        const agentConfigDir = process.env.AGENT_CONFIG_DIR || path.join(serverRoot, 'agent-config');
        console.log(`Agent config directory: ${agentConfigDir}`);
        // Initialize agent service
        const agentService = new agent_service_1.AgentService(openRouterApiKey || 'demo-mode', serverRoot);
        // Initialize the agent service
        agentService.initialize().catch(err => {
            logger_1.logger.error('Failed to initialize agent service:', err);
        });
        console.log('Agent service initialized successfully');
        // Enhanced WebSocket integration
        const wss = new ws_1.WebSocketServer({ noServer: true });
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
                }
                catch (error) {
                    console.error('Error processing WebSocket message:', error);
                }
            });
            ws.on('close', () => {
                console.log('WebSocket connection closed');
            });
        });
        // Setup WebSocket handling for upgrade requests
        app.server.on('upgrade', (request, socket, head) => {
            console.log(`WebSocket upgrade request for: ${request.url}`);
            if (request.url?.startsWith('/ai-warroom')) {
                wss.handleUpgrade(request, socket, head, (ws) => {
                    console.log('WebSocket connection upgraded successfully');
                    wss.emit('connection', ws, request);
                });
            }
        });
        // Enhanced API routes with CORS
        const apiRouter = (0, api_1.createApiRouter)(agentService);
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
                logger_1.logger.error(`Static path does not exist: ${staticPath}`);
            }
        }
        catch (err) {
            logger_1.logger.error(`Error checking static path: ${err instanceof Error ? err.message : String(err)}`);
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
        const fsProvider = {
            workspaceRoot: path.join(serverRoot, 'workspace')
        };
        // Extension management support
        const extensionManager = {
            vscodeExtensionsDir: path.join(serverRoot, 'extensions'),
            attachWebSocket(wss) {
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
                        }
                        catch (error) {
                            console.error('Error processing extension WebSocket message:', error);
                        }
                    });
                });
            }
        };
        console.log('AI War Room extension initialized successfully');
    }
    catch (error) {
        logger_1.logger.error('AI War Room extension initialization failed:', error);
        console.error('AI War Room extension initialization failed:', error);
    }
}
/**
 * Get a route handler for the War Room page
 */
function getWarRoomRouteHandler(serverRoot) {
    return (req, res) => {
        res.sendFile(path.join(serverRoot, 'src/browser/pages/ai-warroom.html'));
    };
}
/**
 * Create a filesystem router
 */
function createFSRouter(fsProvider) {
    const router = (0, express_1.Router)();
    // Implement filesystem operations here
    return router;
}
/**
 * Create an extension router
 */
function createExtensionRouter(extensionManager) {
    const router = (0, express_1.Router)();
    // Implement extension operations here
    return router;
}
