"use strict";
/**
 * AI Agent Service for code-server
 * This file manages AI agents on the server-side and provides
 * communication between agents and the frontend
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
exports.AgentService = exports.AgentInstance = void 0;
const WebSocket = __importStar(require("ws"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const logger_1 = require("../logger");
const events_1 = require("events");
class AgentInstance {
    constructor(config) {
        this.active = false;
        this.config = config;
        this.events = new events_1.EventEmitter();
    }
    get id() {
        return this.config.id;
    }
    get name() {
        return this.config.name;
    }
    get role() {
        return this.config.role;
    }
    get capabilities() {
        return this.config.capabilities;
    }
    get avatar() {
        return this.config.avatar || { icon: 'robot', color: '#007acc' };
    }
    get level() {
        return this.config.level || 1;
    }
    get progress() {
        return this.config.progress || 0;
    }
    get isActive() {
        return this.active;
    }
    get description() {
        return this.config.description || '';
    }
    get systemPrompt() {
        return this.config.systemPrompt || '';
    }
    get model() {
        return this.config.model || 'default';
    }
    get maxTokens() {
        return this.config.maxTokens || 2048;
    }
    get temperature() {
        return this.config.temperature || 0.7;
    }
    get skills() {
        return this.config.skills || [];
    }
    get experience() {
        return this.config.experience || 0;
    }
    get ownerAddress() {
        return this.config.ownerAddress || '';
    }
    get tokenId() {
        return this.config.tokenId || '';
    }
    set isActive(value) {
        this.active = value;
    }
    /**
     * Handle a message from the client
     */
    async handleMessage(message) {
        logger_1.logger.debug(`Agent ${this.name} handling message: ${message.type}`);
        switch (message.type) {
            case 'user-message':
                return await this.handleUserMessage(message.content || '', message.context);
            default:
                logger_1.logger.warn(`Unknown message type for agent ${this.name}: ${message.type}`);
                return null;
        }
    }
    /**
     * Handle a user message
     */
    async handleUserMessage(content, context) {
        // In a real implementation, this would connect to an AI API like OpenAI
        // For demo purposes, we'll just echo back the message
        // Simple timeout to simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Simple response for demonstration
        const response = `I received your message: "${content}".\n\nAs a ${this.role}, I can help with: ${this.capabilities.join(', ')}.\n\nThis is a simulated response since this is a demo implementation.`;
        // Update agent status (simulate progress)
        this.config.progress = Math.min(100, (this.config.progress || 0) + 5);
        if (this.config.progress >= 100) {
            this.config.level = (this.config.level || 1) + 1;
            this.config.progress = 0;
        }
        return {
            type: 'agent-response',
            agentId: this.id,
            content: response,
            status: {
                level: this.config.level,
                progress: this.config.progress,
            }
        };
    }
    /**
     * Get the agent configuration as a JSON object
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            role: this.role,
            avatar: this.avatar,
            capabilities: this.capabilities,
            level: this.level,
            progress: this.progress,
            description: this.description,
            systemPrompt: this.systemPrompt,
            model: this.model,
            maxTokens: this.maxTokens,
            temperature: this.temperature,
            skills: this.skills,
            experience: this.experience,
            ownerAddress: this.ownerAddress,
            tokenId: this.tokenId,
        };
    }
}
exports.AgentInstance = AgentInstance;
class AgentService {
    constructor(apiKey, rootPath) {
        this.agents = new Map();
        this.connections = new Map();
        this.wsServer = null;
        // Default configuration
        const agentConfigDir = process.env.AGENT_CONFIG_DIR || 'data/agents';
        this.config = {
            agentsPath: rootPath ? path.join(rootPath, agentConfigDir) : path.join(process.cwd(), agentConfigDir),
            apiKey: apiKey
        };
        // Create agents directory if it doesn't exist
        if (!fs.existsSync(this.config.agentsPath)) {
            try {
                fs.mkdirSync(this.config.agentsPath, { recursive: true });
            }
            catch (error) {
                logger_1.logger.error(`Failed to create agents directory:`, error);
            }
        }
    }
    /**
     * Initialize the agent service and load all agents
     */
    async initialize() {
        // Load default agents if no agents exist
        await this.loadAgents();
        if (this.agents.size === 0) {
            await this.createDefaultAgents();
        }
        logger_1.logger.info(`Agent service initialized with ${this.agents.size} agents`);
    }
    /**
     * Setup the WebSocket server for agent communication
     */
    setupWebSocket(server, path = '/ai-agents') {
        this.wsServer = new WebSocket.Server({
            server,
            path,
        });
        this.wsServer.on('connection', (socket) => {
            logger_1.logger.debug('New agent client connected');
            // Initialize connection map
            this.connections.set(socket, new Set());
            socket.on('message', async (message) => {
                try {
                    const parsedMessage = JSON.parse(message.toString());
                    await this.handleClientMessage(socket, parsedMessage);
                }
                catch (error) {
                    logger_1.logger.error('Failed to handle client message:', error);
                    try {
                        socket.send(JSON.stringify({
                            type: 'error',
                            content: 'Failed to process message',
                        }));
                    }
                    catch (sendError) {
                        logger_1.logger.error('Failed to send error response:', sendError);
                    }
                }
            });
            socket.on('close', () => {
                logger_1.logger.debug('Agent client disconnected');
                this.connections.delete(socket);
            });
            // Send initial list of available agents
            this.sendAgentList(socket);
        });
        logger_1.logger.info(`Agent WebSocket server started on ${path}`);
    }
    /**
     * Handle a message from a client
     */
    async handleClientMessage(socket, message) {
        const { type, agentId } = message;
        logger_1.logger.debug(`Received agent message: ${type} for agent ${agentId}`);
        const agent = this.agents.get(agentId);
        if (!agent) {
            logger_1.logger.warn(`Agent ${agentId} not found`);
            socket.send(JSON.stringify({
                type: 'error',
                content: `Agent ${agentId} not found`,
            }));
            return;
        }
        // Track which agents the client is interacting with
        const agentSet = this.connections.get(socket);
        if (agentSet) {
            agentSet.add(agentId);
        }
        // Handle the message
        try {
            const response = await agent.handleMessage(message);
            if (response) {
                socket.send(JSON.stringify(response));
            }
        }
        catch (error) {
            logger_1.logger.error(`Error handling message for agent ${agentId}:`, error);
            socket.send(JSON.stringify({
                type: 'error',
                agentId,
                content: 'Failed to process message',
            }));
        }
    }
    /**
     * Send the list of available agents to a client
     */
    sendAgentList(socket) {
        const agentList = Array.from(this.agents.values()).map(agent => agent.toJSON());
        socket.send(JSON.stringify({
            type: 'agent-list',
            agents: agentList,
        }));
    }
    /**
     * Load all agents from the agents directory
     */
    async loadAgents() {
        try {
            if (!fs.existsSync(this.config.agentsPath)) {
                return;
            }
            const files = fs.readdirSync(this.config.agentsPath);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    try {
                        const filePath = path.join(this.config.agentsPath, file);
                        const agentConfig = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                        this.registerAgent(new AgentInstance(agentConfig));
                        logger_1.logger.debug(`Loaded agent ${agentConfig.name} from ${filePath}`);
                    }
                    catch (error) {
                        logger_1.logger.error(`Failed to load agent from ${file}:`, error);
                    }
                }
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to load agents:', error);
        }
    }
    /**
     * Create default agents if none exist
     */
    async createDefaultAgents() {
        const defaultAgents = [
            {
                id: 'code-assistant',
                name: 'Code Assistant',
                role: 'Code Assistant',
                avatar: { icon: 'bx-code-alt', color: '#3b82f6' },
                capabilities: [
                    'code-completion',
                    'refactoring',
                    'documentation',
                ],
                level: 3,
                progress: 70,
            },
            {
                id: 'debug-wizard',
                name: 'Debug Wizard',
                role: 'Debugger',
                avatar: { icon: 'bx-bug', color: '#ef4444' },
                capabilities: [
                    'debugging',
                    'error-analysis',
                    'performance-optimization',
                ],
                level: 2,
                progress: 45,
            },
        ];
        for (const config of defaultAgents) {
            const agent = new AgentInstance(config);
            this.registerAgent(agent);
            // Save the agent configuration
            await this.saveAgentConfig(agent);
        }
        logger_1.logger.info(`Created ${defaultAgents.length} default agents`);
    }
    /**
     * Register a new agent
     */
    registerAgent(agent) {
        this.agents.set(agent.id, agent);
    }
    /**
     * Get an agent by ID
     */
    getAgent(id) {
        return this.agents.get(id);
    }
    /**
     * Get all registered agents
     */
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    /**
     * Save an agent's configuration to disk
     */
    async saveAgentConfig(agent) {
        try {
            const filePath = path.join(this.config.agentsPath, `${agent.id}.json`);
            fs.writeFileSync(filePath, JSON.stringify(agent.toJSON(), null, 2));
            logger_1.logger.debug(`Saved agent ${agent.name} to ${filePath}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to save agent ${agent.id}:`, error);
        }
    }
    /**
     * Close the WebSocket server and cleanup
     */
    async dispose() {
        if (this.wsServer) {
            this.wsServer.close();
        }
        this.connections.clear();
        logger_1.logger.info('Agent service disposed');
    }
    // New methods required by the controller
    async queryAgent(agentId, prompt, context = {}) {
        logger_1.logger.info(`Querying agent ${agentId} with prompt: ${prompt.substring(0, 50)}...`);
        const agent = this.getAgent(agentId);
        if (!agent) {
            throw new Error(`Agent with ID ${agentId} not found`);
        }
        // This is a placeholder implementation - in a real application, 
        // this would call an LLM API with the appropriate model
        return {
            agentId,
            content: `Response from agent ${agent.name} to prompt: ${prompt.substring(0, 30)}...`,
            timestamp: new Date().toISOString()
        };
    }
    async createTask(title, description, agentId) {
        logger_1.logger.info(`Creating task "${title}" for agent ${agentId}`);
        const agent = this.getAgent(agentId);
        if (!agent) {
            throw new Error(`Agent with ID ${agentId} not found`);
        }
        // Generate a unique task ID
        const taskId = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        // This is a placeholder implementation
        return {
            id: taskId,
            title,
            description,
            agentId,
            status: 'created',
            createdAt: new Date().toISOString()
        };
    }
    async executeTask(taskId) {
        logger_1.logger.info(`Executing task ${taskId}`);
        // This is a placeholder implementation
        return {
            id: taskId,
            status: 'completed',
            result: 'Task executed successfully',
            completedAt: new Date().toISOString()
        };
    }
}
exports.AgentService = AgentService;
