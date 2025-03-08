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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiRouter = createApiRouter;
const express = __importStar(require("express"));
const express_1 = require("express");
const http_1 = require("../http");
const logger_1 = require("../logger");
/**
 * Create an API router for the AI War Room
 */
function createApiRouter(agentService) {
    const router = (0, express_1.Router)();
    // Ensure all API routes require authentication
    router.use(http_1.ensureAuthenticated);
    // Get all agents
    router.get("/agents", (req, res) => {
        if (!agentService) {
            return res.status(503).json({ error: "Agent service is not initialized" });
        }
        const agents = agentService.getAllAgents();
        return res.json({
            agents: agents.map(agent => agent.toJSON())
        });
    });
    // Get a specific agent
    router.get("/agents/:id", (req, res) => {
        if (!agentService) {
            return res.status(503).json({ error: "Agent service is not initialized" });
        }
        const agent = agentService.getAgent(req.params.id);
        if (!agent) {
            return res.status(404).json({ error: "Agent not found" });
        }
        return res.json({ agent: agent.toJSON() });
    });
    // Send a message to an agent
    router.post("/agents/:id/message", express.json(), async (req, res) => {
        if (!agentService) {
            return res.status(503).json({ error: "Agent service is not initialized" });
        }
        const { content, context } = req.body;
        if (!content) {
            return res.status(400).json({ error: "Content is required" });
        }
        const agent = agentService.getAgent(req.params.id);
        if (!agent) {
            return res.status(404).json({ error: "Agent not found" });
        }
        try {
            const response = await agent.handleMessage({
                type: "user-message",
                agentId: agent.id,
                content,
                context
            });
            if (!response) {
                return res.status(500).json({ error: "Failed to get response from agent" });
            }
            return res.json(response);
        }
        catch (error) {
            logger_1.logger.error("Error in agent message:", error);
            return res.status(500).json({ error: "Failed to process message" });
        }
    });
    return router;
}
