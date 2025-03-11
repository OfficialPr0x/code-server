"use strict";
/**
 * AI War Room Integration for code-server
 * This file handles the integration of AI War Room features into code-server
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
exports.AIWarRoomIntegration = void 0;
exports.createAIWarRoomIntegration = createAIWarRoomIntegration;
const express = __importStar(require("express"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const logger_1 = require("./logger");
const agent_service_1 = require("./agents/agent-service");
const express_1 = require("express");
const http_1 = require("./http");
// Default configuration
const defaultConfig = {
    enabled: true,
    theme: {
        primaryColor: '#d4af37', // Gold
        backgroundColor: '#0a0b14', // Dark blue
        applyToEntireIDE: true,
    }
};
// Class to handle AI War Room integration
class AIWarRoomIntegration {
    constructor(configPath) {
        this.agentService = null;
        this.rootPath = process.cwd();
        this.config = { ...defaultConfig };
        // Load configuration from file if provided
        if (configPath && fs.existsSync(configPath)) {
            try {
                const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                this.config = { ...defaultConfig, ...configData };
                logger_1.logger.info('Loaded AI War Room configuration from file');
            }
            catch (error) {
                logger_1.logger.error(`Failed to load AI War Room configuration from ${configPath}:`, error);
            }
        }
    }
    /**
     * Initialize the AI War Room integration
     */
    async initialize() {
        if (!this.config.enabled) {
            logger_1.logger.info('AI War Room is disabled in configuration');
            return false;
        }
        try {
            // Initialize agent service
            this.agentService = new agent_service_1.AgentService(this.config.agentsConfigPath);
            await this.agentService.initialize();
            logger_1.logger.info('AI War Room integration initialized successfully');
            return true;
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize AI War Room integration:', error);
            return false;
        }
    }
    /**
     * Create and return the router for AI War Room routes
     */
    createRouter() {
        const router = (0, express_1.Router)();
        // Main AI War Room page
        router.get('/ai-warroom', http_1.ensureAuthenticated, async (req, res) => {
            const filePath = path.join(this.rootPath, 'src/browser/pages/ai-warroom.html');
            res.sendFile(filePath);
        });
        // AI assets
        router.use('/ai/static', http_1.ensureAuthenticated, express.static(path.join(this.rootPath, 'src/browser/ai')));
        // Custom API routes for AI functionality
        router.get('/ai/agents', http_1.ensureAuthenticated, (req, res) => {
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
    setupWebSocket(server) {
        if (!this.agentService) {
            logger_1.logger.warn('Cannot setup WebSocket server: Agent service not initialized');
            return;
        }
        this.agentService.setupWebSocket(server, '/ai-agents');
    }
    /**
     * Apply AI theme modifications to the VSCode workbench
     */
    applyThemeModifications(app) {
        if (!this.config.enabled || !this.config.theme?.applyToEntireIDE) {
            return;
        }
        // Register a middleware to inject CSS into VS Code's workbench.html
        app.use((req, res, next) => {
            // Store the original send function
            const originalSend = res.send;
            // Override the send function
            res.send = function (body) {
                // Only modify HTML responses
                if (typeof body === 'string' &&
                    res.get('Content-Type')?.includes('text/html') &&
                    body.includes('<html')) {
                    // Inject our AI theme CSS link
                    body = body.replace('</head>', `<link rel="stylesheet" href="/ai/static/ai-warroom.css">
             <script src="/ai/static/ai-agent-system.js" defer></script>
             </head>`);
                    // Modify body class to enable our theme
                    body = body.replace('<body', '<body class="ai-theme"');
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
    async dispose() {
        if (this.agentService) {
            await this.agentService.dispose();
            this.agentService = null;
        }
        logger_1.logger.info('AI War Room integration disposed');
    }
}
exports.AIWarRoomIntegration = AIWarRoomIntegration;
// Export a factory function to create the integration
function createAIWarRoomIntegration(configPath) {
    return new AIWarRoomIntegration(configPath);
}
