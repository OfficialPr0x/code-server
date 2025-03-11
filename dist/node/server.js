"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpServer = void 0;
const agent_service_1 = require("./agents/agent-service");
const agent_controller_1 = require("./agents/agent-controller");
const http = __importStar(require("http"));
const express_1 = __importDefault(require("express"));
const logger_1 = require("./logger");
const server_extension_1 = require("./server-extension");
class HttpServer {
    constructor(options) {
        this.options = options;
        this.rootPath = options.rootPath;
        this.port = options.port || 3000; // Default port if not provided
        this.app = (0, express_1.default)();
        this.server = http.createServer(this.app);
        // Explicitly add server to the app for extension compatibility
        this.app.server = this.server;
        this.initialize().catch((err) => logger_1.logger.error("Initialization failed:", err));
    }
    async initialize() {
        try {
            logger_1.logger.info("Initializing AI agent service");
            const openRouterApiKey = process.env.OPENROUTER_API_KEY || "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";
            if (openRouterApiKey) {
                this.agentService = new agent_service_1.AgentService(openRouterApiKey, this.rootPath);
                const agentController = new agent_controller_1.AgentController(this.agentService);
                this.app.use("/api", agentController.getRouter());
            }
            else {
                logger_1.logger.warn("OpenRouter API key not provided. AI agents will not be available.");
            }
            // Log the rootPath to help with debugging
            logger_1.logger.info(`Server root path: ${this.rootPath}`);
            // Initialize the War Room extension
            (0, server_extension_1.initializeWarRoomExtension)(this.app, this.rootPath);
            logger_1.logger.info("AI War Room extension initialized");
        }
        catch (error) {
            logger_1.logger.error("Initialization failed", error);
            throw error;
        }
    }
    start() {
        this.server.listen(this.port, () => {
            logger_1.logger.info(`AI War Room server running on port ${this.port}`);
            logger_1.logger.info(`Server root path: ${this.rootPath}`);
        });
    }
}
exports.HttpServer = HttpServer;
// Start the server
const Application = new HttpServer({
    rootPath: __dirname,
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000
});
Application.start();
