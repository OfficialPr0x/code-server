"use strict";
/**
 * Agent Service
 * Manages AI agents in the system
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
exports.AgentService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("../logger");
class AgentService {
    constructor(apiKey, rootPath) {
        this.agents = [];
        this.apiKey = apiKey;
        this.rootPath = rootPath;
        this.configDir = path.join(rootPath, 'agent-config');
        logger_1.logger.info(`Agent Service initialized with root path: ${rootPath}`);
    }
    /**
     * Initialize the agent service
     */
    async initialize() {
        try {
            logger_1.logger.info('Initializing Agent Service');
            // Ensure config directory exists
            if (!fs.existsSync(this.configDir)) {
                logger_1.logger.info(`Creating agent config directory: ${this.configDir}`);
                fs.mkdirSync(this.configDir, { recursive: true });
            }
            // Load agent configurations
            await this.loadAgents();
            logger_1.logger.info(`Loaded ${this.agents.length} agents`);
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize Agent Service:', error);
            throw error;
        }
    }
    /**
     * Load agents from configuration files
     */
    async loadAgents() {
        try {
            const files = fs.readdirSync(this.configDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(this.configDir, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    const config = JSON.parse(content);
                    this.agents.push(this.createAgentFromConfig(config));
                }
            }
        }
        catch (error) {
            logger_1.logger.error('Error loading agents:', error);
            throw error;
        }
    }
    /**
     * Create an agent from configuration
     */
    createAgentFromConfig(config) {
        return {
            id: config.id || `agent-${Date.now()}`,
            name: config.name || 'Unnamed Agent',
            description: config.description || '',
            model: config.model || 'default',
            capabilities: config.capabilities || [],
            createdAt: config.createdAt ? new Date(config.createdAt) : new Date(),
            updatedAt: config.updatedAt ? new Date(config.updatedAt) : new Date(),
            status: config.status || 'inactive',
            config: config,
            toJSON() {
                return {
                    id: this.id,
                    name: this.name,
                    description: this.description,
                    model: this.model,
                    capabilities: this.capabilities,
                    createdAt: this.createdAt,
                    updatedAt: this.updatedAt,
                    status: this.status
                };
            }
        };
    }
    /**
     * Get all agents
     */
    getAllAgents() {
        return this.agents;
    }
    /**
     * Get agent by ID
     */
    getAgent(id) {
        return this.agents.find(agent => agent.id === id);
    }
    /**
     * Create a new agent
     */
    async createAgent(config) {
        const agent = this.createAgentFromConfig({
            ...config,
            id: `agent-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'inactive'
        });
        this.agents.push(agent);
        // Save agent configuration
        await this.saveAgentConfig(agent);
        return agent;
    }
    /**
     * Update an agent
     */
    async updateAgent(id, updates) {
        const index = this.agents.findIndex(agent => agent.id === id);
        if (index === -1) {
            return null;
        }
        const agent = this.agents[index];
        const updatedAgent = {
            ...agent,
            ...updates,
            updatedAt: new Date(),
            config: {
                ...agent.config,
                ...updates
            }
        };
        this.agents[index] = updatedAgent;
        // Save updated configuration
        await this.saveAgentConfig(updatedAgent);
        return updatedAgent;
    }
    /**
     * Delete an agent
     */
    async deleteAgent(id) {
        const index = this.agents.findIndex(agent => agent.id === id);
        if (index === -1) {
            return false;
        }
        this.agents.splice(index, 1);
        // Delete configuration file
        const configPath = path.join(this.configDir, `${id}.json`);
        if (fs.existsSync(configPath)) {
            fs.unlinkSync(configPath);
        }
        return true;
    }
    /**
     * Save agent configuration to file
     */
    async saveAgentConfig(agent) {
        const configPath = path.join(this.configDir, `${agent.id}.json`);
        const configData = JSON.stringify(agent.config, null, 2);
        fs.writeFileSync(configPath, configData, 'utf8');
    }
}
exports.AgentService = AgentService;
