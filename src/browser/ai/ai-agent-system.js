/**
 * AI Agent System for code-server
 * This file provides the integration between AI agents and the VS Code editor interface
 */

class AIAgent {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.role = config.role;
    this.level = config.level || 1;
    this.progress = config.progress || 0;
    this.avatar = config.avatar || { icon: 'bx-bot', color: '#3b82f6' };
    this.capabilities = config.capabilities || [];
    this.isActive = false;
  }

  getAvatarHTML() {
    if (typeof this.avatar === 'string') {
      return `<img src="${this.avatar}" alt="${this.name}" />`;
    } else {
      return `<i class="bx ${this.avatar.icon}"></i>`;
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      level: this.level,
      progress: this.progress,
      avatar: this.avatar,
      capabilities: this.capabilities,
      isActive: this.isActive
    };
  }
}

class AIAgentSystem {
  constructor() {
    this.agents = [];
    this.activeAgent = null;
    this.events = {
      onAgentAdded: [],
      onAgentRemoved: [],
      onAgentActivated: [],
      onAgentDeactivated: [],
      onChatMessage: []
    };
    
    // Initialize agent DOM elements
    this.agentPanelContainer = null;
    this.chatDialogContainer = null;
    
    // Communication with the editor
    this.editor = null;
    this.monaco = null;
    
    // Communication with the server
    this.socket = null;
    
    this.initialized = false;
  }
  
  async initialize() {
    if (this.initialized) return;
    
    // Wait for the editor to be available
    await this._waitForEditor();
    
    // Create agent UI container
    this._createAgentPanel();
    
    // Create chat dialog
    this._createChatDialog();
    
    // Connect to server
    this._setupServerConnection();
    
    // Load default agents
    await this._loadDefaultAgents();
    
    // Setup editor integration
    this._setupEditorIntegration();
    
    this.initialized = true;
    console.log('AI Agent System initialized');
  }
  
  async _waitForEditor() {
    return new Promise((resolve) => {
      const checkEditor = () => {
        if (window.monaco) {
          this.monaco = window.monaco;
          resolve();
        } else {
          setTimeout(checkEditor, 100);
        }
      };
      checkEditor();
    });
  }
  
  _createAgentPanel() {
    // Create the agent panel container
    const workbench = document.querySelector('.monaco-workbench');
    if (!workbench) {
      console.error('Workbench not found');
      return;
    }
    
    // Add AI theme class to workbench
    workbench.classList.add('ai-theme');
    document.body.classList.add('ai-theme');
    
    // Check if we already have a panel
    let panel = document.querySelector('.ai-agent-panel-container');
    if (panel) {
      this.agentPanelContainer = panel;
      return;
    }
    
    // Create the panel
    this.agentPanelContainer = document.createElement('div');
    this.agentPanelContainer.className = 'ai-agent-panel-container';
    this.agentPanelContainer.style.display = 'none';
    
    // Create the header
    const header = document.createElement('div');
    header.className = 'ai-agent-panel-header';
    header.innerHTML = `
      <div class="ai-agent-panel-title">AI Agents</div>
      <div class="ai-agent-panel-actions">
        <button class="ai-agent-panel-action" data-action="add-agent">
          <i class="bx bx-plus"></i>
        </button>
        <button class="ai-agent-panel-action" data-action="settings">
          <i class="bx bx-cog"></i>
        </button>
      </div>
    `;
    
    // Create the content
    const content = document.createElement('div');
    content.className = 'ai-agent-panel';
    this.agentPanelContainer.appendChild(header);
    this.agentPanelContainer.appendChild(content);
    
    // Add to the workbench
    workbench.appendChild(this.agentPanelContainer);
    
    // Add click handlers
    header.querySelector('[data-action="add-agent"]').addEventListener('click', () => {
      this._showAgentMarketplace();
    });
    
    header.querySelector('[data-action="settings"]').addEventListener('click', () => {
      this._showAgentSettings();
    });
  }
  
  _createChatDialog() {
    // Create the chat dialog container
    const workbench = document.querySelector('.monaco-workbench');
    if (!workbench) {
      console.error('Workbench not found');
      return;
    }
    
    // Check if we already have a chat dialog
    let chatDialog = document.querySelector('.ai-chat-dialog');
    if (chatDialog) {
      this.chatDialogContainer = chatDialog;
      return;
    }
    
    // Create the chat dialog
    this.chatDialogContainer = document.createElement('div');
    this.chatDialogContainer.className = 'ai-chat-dialog glass-panel';
    this.chatDialogContainer.style.display = 'none';
    
    this.chatDialogContainer.innerHTML = `
      <div class="ai-chat-header">
        <div style="display: flex; align-items: center; gap: 10px">
          <div class="ai-agent-avatar" style="width: 28px; height: 28px">
            <i class="bx bx-code-alt"></i>
          </div>
          <span style="font-weight: 600">AI Assistant</span>
        </div>
        <div style="display: flex; gap: 8px">
          <i class="bx bx-minus" style="cursor: pointer"></i>
          <i class="bx bx-x" style="cursor: pointer"></i>
        </div>
      </div>
      <div class="ai-chat-messages"></div>
      <div class="ai-chat-input">
        <div style="position: relative">
          <textarea placeholder="Ask me anything..."></textarea>
          <button>
            <i class="bx bx-send"></i>
          </button>
        </div>
      </div>
    `;
    
    // Add to the workbench
    workbench.appendChild(this.chatDialogContainer);
    
    // Add event listeners
    const closeBtn = this.chatDialogContainer.querySelector('.bx-x');
    closeBtn.addEventListener('click', () => {
      this.chatDialogContainer.style.display = 'none';
    });
    
    const minimizeBtn = this.chatDialogContainer.querySelector('.bx-minus');
    minimizeBtn.addEventListener('click', () => {
      if (this.chatDialogContainer.style.height === '48px') {
        this.chatDialogContainer.style.height = '480px';
        this.chatDialogContainer.querySelector('.ai-chat-messages').style.display = 'block';
        this.chatDialogContainer.querySelector('.ai-chat-input').style.display = 'block';
      } else {
        this.chatDialogContainer.style.height = '48px';
        this.chatDialogContainer.querySelector('.ai-chat-messages').style.display = 'none';
        this.chatDialogContainer.querySelector('.ai-chat-input').style.display = 'none';
      }
    });
    
    const sendBtn = this.chatDialogContainer.querySelector('button');
    const textarea = this.chatDialogContainer.querySelector('textarea');
    
    sendBtn.addEventListener('click', () => {
      this._sendMessage(textarea.value);
      textarea.value = '';
    });
    
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._sendMessage(textarea.value);
        textarea.value = '';
      }
    });
  }
  
  _setupServerConnection() {
    // Create a WebSocket connection to the server for agent communication
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const path = `${protocol}//${host}/ai-agents`;
    
    try {
      this.socket = new WebSocket(path);
      
      this.socket.onopen = () => {
        console.log('Connected to AI agent server');
      };
      
      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this._handleServerMessage(message);
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      this.socket.onclose = () => {
        console.log('Disconnected from AI agent server');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this._setupServerConnection(), 5000);
      };
    } catch (error) {
      console.error('Failed to connect to AI agent server:', error);
    }
  }
  
  _handleServerMessage(message) {
    switch (message.type) {
      case 'agent-response':
        this._displayAgentMessage(message.agentId, message.content);
        break;
      case 'code-suggestion':
        this._applyCodeSuggestion(message.suggestion);
        break;
      case 'agent-status':
        this._updateAgentStatus(message.agentId, message.status);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }
  
  async _loadDefaultAgents() {
    // Add default agents
    const defaultAgents = [
      {
        id: 'code-assistant',
        name: 'Code Assistant',
        role: 'Code Assistant',
        level: 3,
        progress: 70,
        avatar: { icon: 'bx-code-alt', color: '#3b82f6' },
        capabilities: ['code-completion', 'refactoring', 'documentation']
      },
      {
        id: 'debug-wizard',
        name: 'Debug Wizard',
        role: 'Debugger',
        level: 2,
        progress: 45,
        avatar: { icon: 'bx-bug', color: '#ef4444' },
        capabilities: ['debugging', 'error-analysis', 'performance-optimization']
      }
    ];
    
    defaultAgents.forEach(agentConfig => {
      this.addAgent(new AIAgent(agentConfig));
    });
  }
  
  _setupEditorIntegration() {
    // Setup integration with the Monaco editor
    if (!this.monaco) {
      console.error('Monaco editor not found');
      return;
    }
    
    // Add a command to open the AI agent panel
    this.monaco.editor.registerCommand('ai-warroom.openAgentPanel', () => {
      this.showAgentPanel();
    });
    
    // Add a command to open the chat dialog
    this.monaco.editor.registerCommand('ai-warroom.openChatDialog', (agent) => {
      this.openChatDialog(agent);
    });
    
    // Register code action provider for AI suggestions
    this.monaco.languages.registerCodeActionProvider('*', {
      provideCodeActions: (model, range, context, token) => {
        // Check if there are AI agents that can help with this code
        const activeAgents = this.agents.filter(agent => agent.isActive);
        if (activeAgents.length === 0) return { actions: [], dispose: () => {} };
        
        // Get the code around the cursor
        const code = model.getValueInRange(range);
        if (!code) return { actions: [], dispose: () => {} };
        
        // Create code actions
        const actions = activeAgents.map(agent => {
          return {
            title: `Ask ${agent.name} for help`,
            command: {
              id: 'ai-warroom.openChatDialog',
              arguments: [agent.id]
            }
          };
        });
        
        return {
          actions: actions,
          dispose: () => {}
        };
      }
    });
  }
  
  // Public API
  
  addAgent(agent) {
    if (!(agent instanceof AIAgent)) {
      throw new Error('Agent must be an instance of AIAgent');
    }
    
    this.agents.push(agent);
    this._renderAgents();
    
    // Trigger event
    this.events.onAgentAdded.forEach(callback => callback(agent));
  }
  
  removeAgent(agentId) {
    const agentIndex = this.agents.findIndex(a => a.id === agentId);
    if (agentIndex === -1) return;
    
    const agent = this.agents[agentIndex];
    this.agents.splice(agentIndex, 1);
    
    if (this.activeAgent && this.activeAgent.id === agentId) {
      this.activeAgent = null;
    }
    
    this._renderAgents();
    
    // Trigger event
    this.events.onAgentRemoved.forEach(callback => callback(agent));
  }
  
  activateAgent(agentId) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    agent.isActive = true;
    this.activeAgent = agent;
    
    this._renderAgents();
    
    // Trigger event
    this.events.onAgentActivated.forEach(callback => callback(agent));
  }
  
  deactivateAgent(agentId) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    agent.isActive = false;
    
    if (this.activeAgent && this.activeAgent.id === agentId) {
      this.activeAgent = null;
    }
    
    this._renderAgents();
    
    // Trigger event
    this.events.onAgentDeactivated.forEach(callback => callback(agent));
  }
  
  showAgentPanel() {
    if (!this.agentPanelContainer) {
      this._createAgentPanel();
    }
    
    this.agentPanelContainer.style.display = 'block';
  }
  
  hideAgentPanel() {
    if (this.agentPanelContainer) {
      this.agentPanelContainer.style.display = 'none';
    }
  }
  
  openChatDialog(agentId) {
    if (!this.chatDialogContainer) {
      this._createChatDialog();
    }
    
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    // Update chat dialog header
    const avatar = this.chatDialogContainer.querySelector('.ai-chat-header .ai-agent-avatar');
    if (typeof agent.avatar === 'string') {
      avatar.innerHTML = `<img src="${agent.avatar}" alt="${agent.name}" />`;
    } else {
      avatar.innerHTML = `<i class="bx ${agent.avatar.icon}"></i>`;
      avatar.style.background = agent.avatar.color;
    }
    
    this.chatDialogContainer.querySelector('.ai-chat-header span').textContent = agent.name;
    
    // Clear chat messages
    this.chatDialogContainer.querySelector('.ai-chat-messages').innerHTML = '';
    
    // Display welcome message
    this._displayAgentMessage(agentId, `Hello! I'm ${agent.name}, your ${agent.role}. How can I help you today?`);
    
    // Show the dialog
    this.chatDialogContainer.style.display = 'flex';
    this.chatDialogContainer.style.height = '480px';
    this.chatDialogContainer.querySelector('.ai-chat-messages').style.display = 'block';
    this.chatDialogContainer.querySelector('.ai-chat-input').style.display = 'block';
    
    // Focus on input
    setTimeout(() => {
      this.chatDialogContainer.querySelector('textarea').focus();
    }, 100);
  }
  
  // Private methods
  
  _renderAgents() {
    if (!this.agentPanelContainer) return;
    
    const content = this.agentPanelContainer.querySelector('.ai-agent-panel');
    if (!content) return;
    
    content.innerHTML = '';
    
    this.agents.forEach(agent => {
      const agentCard = document.createElement('div');
      agentCard.className = 'ai-agent-card';
      agentCard.dataset.id = agent.id;
      
      agentCard.innerHTML = `
        <div class="ai-agent-header">
          <div class="ai-agent-avatar" style="background: ${agent.avatar.color || '#3b82f6'}">
            ${agent.getAvatarHTML()}
          </div>
          <div class="ai-agent-info">
            <div class="ai-agent-name">${agent.name}</div>
            <div class="ai-agent-role">${agent.role}</div>
          </div>
        </div>
        <div class="ai-agent-level">
          <div class="ai-agent-level-text">Level ${agent.level}</div>
          <div class="ai-agent-level-bar">
            <div class="ai-agent-level-progress" style="width: ${agent.progress}%"></div>
          </div>
        </div>
        <div class="ai-agent-actions">
          <div class="ai-agent-action" data-action="chat">Chat</div>
          <div class="ai-agent-action" data-action="assign">Assign Task</div>
        </div>
      `;
      
      // Add event listeners
      agentCard.querySelector('[data-action="chat"]').addEventListener('click', (e) => {
        e.stopPropagation();
        this.openChatDialog(agent.id);
      });
      
      agentCard.querySelector('[data-action="assign"]').addEventListener('click', (e) => {
        e.stopPropagation();
        this._assignTask(agent.id);
      });
      
      content.appendChild(agentCard);
    });
  }
  
  _sendMessage(text) {
    if (!text || !this.activeAgent) return;
    
    // Display user message
    const messagesContainer = this.chatDialogContainer.querySelector('.ai-chat-messages');
    const userMessage = document.createElement('div');
    userMessage.className = 'ai-chat-message user-message';
    userMessage.innerHTML = `
      <div class="ai-chat-message-avatar" style="background: #3b82f6">
        <i class="bx bx-user"></i>
      </div>
      <div class="ai-chat-message-content">
        <p>${text}</p>
      </div>
    `;
    messagesContainer.appendChild(userMessage);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Send to server
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'user-message',
        agentId: this.activeAgent.id,
        content: text,
        context: this._getEditorContext()
      }));
    } else {
      // Fallback for when server is not available
      setTimeout(() => {
        this._displayAgentMessage(
          this.activeAgent.id,
          'I apologize, but I am currently unable to process your request. Please try again later.'
        );
      }, 1000);
    }
    
    // Trigger event
    this.events.onChatMessage.forEach(callback => callback({
      agentId: this.activeAgent.id,
      content: text,
      isUser: true
    }));
  }
  
  _displayAgentMessage(agentId, content) {
    if (!this.chatDialogContainer) return;
    
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    const messagesContainer = this.chatDialogContainer.querySelector('.ai-chat-messages');
    const agentMessage = document.createElement('div');
    agentMessage.className = 'ai-chat-message agent-message';
    
    agentMessage.innerHTML = `
      <div class="ai-chat-message-avatar" style="background: ${agent.avatar.color || '#3b82f6'}">
        ${agent.getAvatarHTML()}
      </div>
      <div class="ai-chat-message-content">
        <p>${content}</p>
      </div>
    `;
    
    messagesContainer.appendChild(agentMessage);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Trigger event
    this.events.onChatMessage.forEach(callback => callback({
      agentId: agent.id,
      content: content,
      isUser: false
    }));
  }
  
  _getEditorContext() {
    // Get the current editor state
    if (!this.monaco) return {};
    
    const editor = this.monaco.editor.getActiveEditor();
    if (!editor) return {};
    
    const model = editor.getModel();
    if (!model) return {};
    
    return {
      language: model.getLanguageId(),
      fileName: model.uri.path,
      content: model.getValue(),
      selection: editor.getSelection(),
      position: editor.getPosition()
    };
  }
  
  _applyCodeSuggestion(suggestion) {
    if (!this.monaco) return;
    
    const editor = this.monaco.editor.getActiveEditor();
    if (!editor) return;
    
    const model = editor.getModel();
    if (!model) return;
    
    // Apply the suggestion
    editor.executeEdits('ai-agent', [
      {
        range: suggestion.range,
        text: suggestion.text,
        forceMoveMarkers: true
      }
    ]);
  }
  
  _assignTask(agentId) {
    // Show task assignment dialog
    alert(`Assign task to ${this.agents.find(a => a.id === agentId)?.name}`);
    // This would be implemented with a proper UI component
  }
  
  _showAgentMarketplace() {
    // Show agent marketplace dialog
    alert('Agent Marketplace (to be implemented)');
    // This would be implemented with a proper UI component
  }
  
  _showAgentSettings() {
    // Show agent settings dialog
    alert('Agent Settings (to be implemented)');
    // This would be implemented with a proper UI component
  }
  
  _updateAgentStatus(agentId, status) {
    const agent = this.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    if (status.level) {
      agent.level = status.level;
    }
    
    if (status.progress !== undefined) {
      agent.progress = status.progress;
    }
    
    this._renderAgents();
  }
}

// Create global instance
window.aiAgentSystem = new AIAgentSystem();

// Initialize when the page is fully loaded
window.addEventListener('load', () => {
  // Initialize with a small delay to ensure VS Code is fully loaded
  setTimeout(() => {
    window.aiAgentSystem.initialize().catch(error => {
      console.error('Failed to initialize AI Agent System:', error);
    });
  }, 2000);
});

// Command for VS Code to toggle the agent panel
window.toggleAIAgentPanel = () => {
  if (!window.aiAgentSystem) return;
  
  const container = document.querySelector('.ai-agent-panel-container');
  if (container && container.style.display === 'block') {
    window.aiAgentSystem.hideAgentPanel();
  } else {
    window.aiAgentSystem.showAgentPanel();
  }
};

// Command for VS Code to open the chat dialog with the default agent
window.openAIChatDialog = (agentId) => {
  if (!window.aiAgentSystem) return;
  
  if (agentId) {
    window.aiAgentSystem.openChatDialog(agentId);
  } else if (window.aiAgentSystem.agents.length > 0) {
    window.aiAgentSystem.openChatDialog(window.aiAgentSystem.agents[0].id);
  }
}; 