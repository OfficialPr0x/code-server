/**
 * Agent Management System
 * Handles agent registration, initialization, and communication
 */

class AIAgent {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.role = config.role;
    this.capabilities = config.capabilities || [];
    this.level = config.level || 1;
    this.experience = config.experience || 0;
    this.active = false;
  }

  activate() {
    this.active = true;
    console.log(`Agent ${this.name} activated`);
    return this;
  }

  deactivate() {
    this.active = false;
    console.log(`Agent ${this.name} deactivated`);
    return this;
  }

  async process(input, context = {}) {
    console.log(`Agent ${this.name} processing: ${input}`);
    // This would connect to the backend API in a real implementation
    return {
      content: `Response from ${this.name}: I processed your request "${input.substring(0, 30)}..."`,
      timestamp: new Date().toISOString()
    };
  }
}

class AIAgentManager {
  constructor() {
    this.agents = new Map();
    this.activeAgent = null;
  }

  registerAgent(config) {
    const agent = new AIAgent(config);
    this.agents.set(agent.id, agent);
    console.log(`Agent ${agent.name} registered`);
    return agent;
  }

  getAgent(id) {
    return this.agents.get(id);
  }

  getAllAgents() {
    return Array.from(this.agents.values());
  }

  setActiveAgent(id) {
    if (this.activeAgent) {
      this.activeAgent.deactivate();
    }
    
    const agent = this.getAgent(id);
    if (agent) {
      this.activeAgent = agent.activate();
    }
    
    return this.activeAgent;
  }

  async processWithActiveAgent(input, context = {}) {
    if (!this.activeAgent) {
      throw new Error('No active agent available');
    }
    
    return this.activeAgent.process(input, context);
  }
}

// Initialize the agent manager
const agentManager = new AIAgentManager();

// Register default agents
agentManager.registerAgent({
  id: 'code-completion',
  name: 'Code Wizard',
  role: 'Code Completion Specialist',
  capabilities: ['code-completion'],
  level: 3
});

agentManager.registerAgent({
  id: 'debugging',
  name: 'Bug Hunter',
  role: 'Debugging Expert',
  capabilities: ['debugging'],
  level: 2
});

agentManager.registerAgent({
  id: 'code-explanation',
  name: 'Code Sage',
  role: 'Code Explanation Expert',
  capabilities: ['code-explanation'],
  level: 3
});

agentManager.registerAgent({
  id: 'refactoring',
  name: 'Code Architect',
  role: 'Refactoring Specialist',
  capabilities: ['refactoring'],
  level: 2
});

agentManager.registerAgent({
  id: 'documentation',
  name: 'Doc Master',
  role: 'Documentation Expert',
  capabilities: ['documentation'],
  level: 1
});

agentManager.registerAgent({
  id: 'error-analysis',
  name: 'Error Analyst',
  role: 'Error Diagnostics Specialist',
  capabilities: ['error-analysis'],
  level: 2
});

agentManager.registerAgent({
  id: 'performance-optimization',
  name: 'Speed Demon',
  role: 'Performance Optimizer',
  capabilities: ['performance-optimization'],
  level: 1
});

// Export for global use
window.AIAgentManager = agentManager; 