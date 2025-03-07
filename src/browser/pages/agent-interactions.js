/**
 * Agent Interactions - Handles interactions with AI agents in the War Room IDE
 * This file manages agent communication, UI updates, and experience tracking
 */

class AgentInteractions {
    constructor() {
        this.agents = [];
        this.currentAgentId = null;
        this.chatHistory = new Map(); // Store chat history for each agent
        this.apiEndpoint = '/api/agents';
        this.socket = null;
        this.chatDialog = document.querySelector('.ai-chat-dialog');
        this.chatMessages = document.querySelector('.ai-chat-messages');
        this.chatInput = document.querySelector('.ai-chat-input textarea');
        this.chatSendButton = document.querySelector('.ai-chat-input button');
        this.agentsPanel = document.querySelector('.ai-ide-agents-content');
        this.marketplaceModal = document.querySelector('.ai-marketplace-modal');
        this.sidebarButtons = document.querySelectorAll('.ai-ide-sidebar-btn');
        
        // Initialize
        this.init();
    }

    async init() {
        try {
            // Load agents
            await this.loadAgents();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Render agents in the panel
            this.renderAgents();
            
            // Setup WebSocket for real-time updates
            this.setupWebSocket();
            
            console.log('Agent Interactions initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Agent Interactions:', error);
        }
    }

    async loadAgents() {
        try {
            const response = await fetch(this.apiEndpoint);
            if (!response.ok) {
                throw new Error(`Failed to load agents: ${response.status}`);
            }
            
            const data = await response.json();
            this.agents = data.agents;
            
            // If no agents loaded from API, use sample data for demonstration
            if (!this.agents || this.agents.length === 0) {
                this.agents = [
                    {
                        id: 'agent-1',
                        name: 'Code Assistant',
                        role: 'code-assistant',
                        description: 'Helps with coding tasks and provides suggestions',
                        level: 3,
                        experience: 350,
                        skills: ['JavaScript', 'TypeScript', 'React']
                    },
                    {
                        id: 'agent-2',
                        name: 'Debug Wizard',
                        role: 'debugger',
                        description: 'Specialized in finding and fixing bugs',
                        level: 2,
                        experience: 180,
                        skills: ['Error Analysis', 'Performance Optimization']
                    },
                    {
                        id: 'agent-3',
                        name: 'DevOps Engineer',
                        role: 'devops-engineer',
                        description: 'Helps with deployment, CI/CD, and infrastructure',
                        level: 4,
                        experience: 580,
                        skills: ['Docker', 'GitHub Actions', 'AWS']
                    }
                ];
            }
            
            console.log('Agents loaded:', this.agents);
        } catch (error) {
            console.error('Error loading agents:', error);
            // Use sample data on error
            this.agents = [
                {
                    id: 'agent-1',
                    name: 'Code Assistant',
                    role: 'code-assistant',
                    description: 'Helps with coding tasks and provides suggestions',
                    level: 3,
                    experience: 350,
                    skills: ['JavaScript', 'TypeScript', 'React']
                }
            ];
        }
    }

    setupEventListeners() {
        // Chat input submission
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleChatSubmit();
            }
        });
        
        this.chatSendButton.addEventListener('click', () => {
            this.handleChatSubmit();
        });
        
        // Close chat dialog
        document.querySelector('.ai-chat-header .bx-x').addEventListener('click', () => {
            this.toggleChatDialog(false);
        });
        
        // Minimize chat dialog
        document.querySelector('.ai-chat-header .bx-minus').addEventListener('click', () => {
            this.chatDialog.style.height = this.chatDialog.style.height === '48px' ? '480px' : '48px';
            this.chatDialog.querySelector('.ai-chat-messages').style.display = this.chatDialog.style.height === '48px' ? 'none' : 'block';
            this.chatDialog.querySelector('.ai-chat-input').style.display = this.chatDialog.style.height === '48px' ? 'none' : 'block';
        });
        
        // Toggle marketplace modal
        document.querySelector('.ai-ide-sidebar-btn[title="Agent Marketplace"]').addEventListener('click', () => {
            this.toggleMarketplace(true);
        });
        
        document.querySelector('.ai-marketplace-header .bx-x').addEventListener('click', () => {
            this.toggleMarketplace(false);
        });
        
        // Toggle AI Agents panel
        document.querySelector('.ai-ide-sidebar-btn[title="AI Agents"]').addEventListener('click', () => {
            this.toggleAgentsPanel();
        });
        
        // Add event delegation for agent cards and actions
        this.agentsPanel.addEventListener('click', (e) => {
            const agentCard = e.target.closest('.ai-agent-card');
            if (!agentCard) return;
            
            // If clicked on action button
            if (e.target.closest('.ai-agent-action')) {
                this.handleAgentAction(e);
                return;
            }
            
            // If clicked on the card itself
            const agentId = agentCard.dataset.id;
            if (agentId) {
                this.handleAgentClick(agentId);
            }
        });
    }

    renderAgents() {
        if (!this.agentsPanel) return;
        
        this.agentsPanel.innerHTML = '';
        
        this.agents.forEach(agent => {
            const progress = Math.min(100, (agent.experience / ((agent.level * 100) + 100)) * 100);
            
            const card = document.createElement('div');
            card.className = 'ai-agent-card';
            card.dataset.id = agent.id;
            
            card.innerHTML = `
                <div class="ai-agent-header">
                    <div class="ai-agent-avatar" style="background: ${this.getAgentColor(agent.role)}">
                        <i class="${this.getAgentIcon(agent.role)}"></i>
                    </div>
                    <div class="ai-agent-info">
                        <div class="ai-agent-name">${agent.name}</div>
                        <div class="ai-agent-role">${this.formatRole(agent.role)}</div>
                    </div>
                </div>
                <div class="ai-agent-level">
                    <div class="ai-agent-level-text">Level ${agent.level}</div>
                    <div class="ai-agent-level-bar">
                        <div class="ai-agent-level-progress" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div class="ai-agent-actions">
                    <div class="ai-agent-action" data-action="chat">Chat</div>
                    <div class="ai-agent-action" data-action="assign">Assign Task</div>
                </div>
            `;
            
            this.agentsPanel.appendChild(card);
        });
    }

    handleAgentClick(agentId) {
        this.currentAgentId = agentId;
        const agent = this.agents.find(a => a.id === agentId);
        
        if (agent) {
            this.toggleChatDialog(true);
            document.querySelector('.ai-chat-header span').textContent = agent.name;
            document.querySelector('.ai-chat-header .ai-agent-avatar').style.background = this.getAgentColor(agent.role);
            document.querySelector('.ai-chat-header .ai-agent-avatar i').className = this.getAgentIcon(agent.role);
            
            // Load chat history
            this.renderChatHistory();
        }
    }

    async handleChatSubmit() {
        if (!this.chatInput.value.trim() || !this.currentAgentId) return;
        
        const message = this.chatInput.value.trim();
        const agentId = this.currentAgentId;
        
        // Add user message to chat
        this.addChatMessage(message, true);
        
        // Clear input
        this.chatInput.value = '';
        
        try {
            // In a real implementation, this would call the API
            // For now, we'll use a simulated response
            const agent = this.agents.find(a => a.id === agentId);
            
            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'ai-chat-message';
            typingIndicator.innerHTML = `
                <div class="ai-chat-message-avatar" style="background: ${this.getAgentColor(agent.role)}">
                    <i class="${this.getAgentIcon(agent.role)}"></i>
                </div>
                <div class="ai-chat-message-content">
                    <p>Thinking...</p>
                </div>
            `;
            this.chatMessages.appendChild(typingIndicator);
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            
            // Simulate API call delay
            setTimeout(async () => {
                // Remove typing indicator
                this.chatMessages.removeChild(typingIndicator);
                
                // Get AI response
                const response = await this.simulateAgentResponse(message);
                
                // Add AI response to chat
                this.addChatMessage(response, false);
                
                // Add experience points
                this.updateAgentExperience(agentId, 10);
            }, 1500);
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.addChatMessage('Sorry, I encountered an error processing your request.', false);
        }
    }

    handleAgentAction(event) {
        const actionButton = event.target.closest('.ai-agent-action');
        if (!actionButton) return;
        
        const action = actionButton.dataset.action;
        const agentId = actionButton.closest('.ai-agent-card').dataset.id;
        const agent = this.agents.find(a => a.id === agentId);
        
        if (!agent) return;
        
        switch (action) {
            case 'chat':
                this.handleAgentClick(agentId);
                break;
                
            case 'assign':
                // In a real implementation, this would open a task assignment modal
                alert(`Assigning task to ${agent.name}. Feature coming soon!`);
                break;
                
            default:
                console.warn('Unknown agent action:', action);
        }
    }

    addChatMessage(message, isUser = false) {
        if (!this.currentAgentId) return;
        
        // Get agent for styling
        const agent = this.agents.find(a => a.id === this.currentAgentId);
        if (!agent && !isUser) return;
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = 'ai-chat-message';
        
        if (isUser) {
            messageEl.innerHTML = `
                <div class="ai-chat-message-avatar" style="background: var(--ai-accent-blue)">
                    <i class="bx bx-user"></i>
                </div>
                <div class="ai-chat-message-content" style="background: rgba(59, 130, 246, 0.2);">
                    <p>${this.formatMessage(message)}</p>
                </div>
            `;
        } else {
            messageEl.innerHTML = `
                <div class="ai-chat-message-avatar" style="background: ${this.getAgentColor(agent.role)}">
                    <i class="${this.getAgentIcon(agent.role)}"></i>
                </div>
                <div class="ai-chat-message-content">
                    <p>${this.formatMessage(message)}</p>
                </div>
            `;
        }
        
        // Add to chat container
        this.chatMessages.appendChild(messageEl);
        
        // Save to history
        if (!this.chatHistory.has(this.currentAgentId)) {
            this.chatHistory.set(this.currentAgentId, []);
        }
        
        this.chatHistory.get(this.currentAgentId).push({
            message,
            isUser,
            timestamp: new Date()
        });
        
        // Scroll to bottom
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    renderChatHistory() {
        if (!this.currentAgentId || !this.chatHistory.has(this.currentAgentId)) {
            this.chatMessages.innerHTML = '';
            return;
        }
        
        const history = this.chatHistory.get(this.currentAgentId);
        this.chatMessages.innerHTML = '';
        
        history.forEach(entry => {
            this.addChatMessage(entry.message, entry.isUser);
        });
    }

    updateAgentExperience(agentId, amount) {
        const agent = this.agents.find(a => a.id === agentId);
        if (!agent) return;
        
        agent.experience += amount;
        const nextLevelThreshold = (agent.level * 100) + 100;
        
        // Level up if experience is enough
        if (agent.experience >= nextLevelThreshold) {
            agent.level += 1;
            
            // Show level up notification
            this.showNotification(`${agent.name} leveled up to Level ${agent.level}!`);
        }
        
        // Update UI
        this.renderAgents();
    }

    toggleChatDialog(show = true) {
        if (!this.chatDialog) return;
        
        this.chatDialog.style.display = show ? 'flex' : 'none';
        
        if (show && this.chatInput) {
            // Focus input when shown
            setTimeout(() => this.chatInput.focus(), 100);
        }
    }

    toggleMarketplace(show = true) {
        if (!this.marketplaceModal) return;
        
        this.marketplaceModal.style.display = show ? 'flex' : 'none';
        
        if (show) {
            // Populate marketplace (sample data)
            const content = this.marketplaceModal.querySelector('.ai-marketplace-content');
            content.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px;">
                    <div class="glass-panel" style="padding: 16px; display: flex; flex-direction: column;">
                        <div style="background: var(--ai-accent-purple); width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                            <i class="bx bx-code-block" style="font-size: 32px; color: white;"></i>
                        </div>
                        <h3 style="margin: 0 0 8px 0;">Senior Architect</h3>
                        <p style="color: var(--ai-text-secondary); margin: 0 0 16px 0;">Expert in system design and architecture patterns</p>
                        <div style="margin-top: auto;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                                <i class="bx bx-purchase-tag" style="color: var(--ai-gold-primary);"></i>
                                <span>0.05 ETH</span>
                            </div>
                            <button style="width: 100%; padding: 8px; background: var(--ai-gold-primary); border: none; border-radius: 4px; color: var(--ai-bg-primary); font-weight: 500; cursor: pointer;">Purchase</button>
                        </div>
                    </div>
                    
                    <div class="glass-panel" style="padding: 16px; display: flex; flex-direction: column;">
                        <div style="background: var(--ai-accent-blue); width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                            <i class="bx bx-bug-alt" style="font-size: 32px; color: white;"></i>
                        </div>
                        <h3 style="margin: 0 0 8px 0;">Security Expert</h3>
                        <p style="color: var(--ai-text-secondary); margin: 0 0 16px 0;">Specializes in identifying and fixing security vulnerabilities</p>
                        <div style="margin-top: auto;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                                <i class="bx bx-purchase-tag" style="color: var(--ai-gold-primary);"></i>
                                <span>0.08 ETH</span>
                            </div>
                            <button style="width: 100%; padding: 8px; background: var(--ai-gold-primary); border: none; border-radius: 4px; color: var(--ai-bg-primary); font-weight: 500; cursor: pointer;">Purchase</button>
                        </div>
                    </div>
                    
                    <div class="glass-panel" style="padding: 16px; display: flex; flex-direction: column;">
                        <div style="background: var(--ai-accent-green); width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                            <i class="bx bx-palette" style="font-size: 32px; color: white;"></i>
                        </div>
                        <h3 style="margin: 0 0 8px 0;">UI Designer</h3>
                        <p style="color: var(--ai-text-secondary); margin: 0 0 16px 0;">Creates beautiful user interfaces and experiences</p>
                        <div style="margin-top: auto;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                                <i class="bx bx-purchase-tag" style="color: var(--ai-gold-primary);"></i>
                                <span>0.03 ETH</span>
                            </div>
                            <button style="width: 100%; padding: 8px; background: var(--ai-gold-primary); border: none; border-radius: 4px; color: var(--ai-bg-primary); font-weight: 500; cursor: pointer;">Purchase</button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    toggleAgentsPanel() {
        const agentsPanel = document.querySelector('.ai-ide-agents');
        
        // Toggle the agents panel visibility
        if (agentsPanel.style.display === 'none') {
            agentsPanel.style.display = 'flex';
        } else {
            agentsPanel.style.display = 'none';
        }
        
        // Adjust editor area to take full space when panel is hidden
        const editorArea = document.querySelector('.ai-ide-editor');
        if (agentsPanel.style.display === 'none') {
            editorArea.style.gridRow = '2 / 5';
        } else {
            editorArea.style.gridRow = '';
        }
    }

    setupWebSocket() {
        this.socket = new WebSocket(`wss://${window.location.host}/ai-warroom`);
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'agent-status') {
                this.agents = data.agents;
                this.renderAgents();
            }
        };
    }

    formatMessage(message) {
        // Replace newlines with <br> tags
        // In a real implementation, this would have more sophisticated formatting
        return message.replace(/\n/g, '<br>');
    }

    async simulateAgentResponse(message) {
        // Simulate an AI response based on the message
        // In a real implementation, this would call an API
        
        if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
            return 'Hello there! How can I assist you with your coding today?';
        }
        
        if (message.toLowerCase().includes('help')) {
            return 'I can help you with code suggestions, debugging, and answering programming questions. What are you working on?';
        }
        
        if (message.toLowerCase().includes('bug') || message.toLowerCase().includes('error')) {
            return 'I can help you debug that issue. Can you share more details about the error you\'re seeing?';
        }
        
        if (message.toLowerCase().includes('javascript') || message.toLowerCase().includes('js')) {
            return 'JavaScript is my specialty! What specific aspect are you working with?';
        }
        
        if (message.toLowerCase().includes('code') || message.toLowerCase().includes('example')) {
            return 'Here\'s a simple example:\n\n```javascript\nfunction factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\n\nconst result = factorial(5); // 120\n```\n\nIs this what you were looking for?';
        }
        
        // Default response
        return 'I understand. Let me know if you need help with any specific programming tasks or have questions about your code.';
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'ai-notification glass-panel';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 16px;
            z-index: 1002;
            animation: slideIn 0.3s ease, fadeOut 0.5s ease 4.5s forwards;
            display: flex;
            align-items: center;
            gap: 12px;
        `;
        
        notification.innerHTML = `
            <i class="bx bx-medal" style="color: var(--ai-gold-primary); font-size: 24px;"></i>
            <span>${message}</span>
        `;
        
        // Add styles if they don't exist
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add to document
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 5000);
    }

    getAgentColor(role) {
        const colors = {
            'code-assistant': 'var(--ai-accent-blue)',
            'debugger': 'var(--ai-accent-red)',
            'optimizer': 'var(--ai-accent-purple)',
            'security-expert': 'var(--ai-accent-red)',
            'ui-designer': 'var(--ai-accent-green)',
            'devops-engineer': 'var(--ai-gold-primary)',
            'documentation-writer': 'var(--ai-accent-blue)',
            'data-scientist': 'var(--ai-accent-purple)',
            'architect': 'var(--ai-gold-primary)'
        };
        
        return colors[role] || 'var(--ai-accent-blue)';
    }

    getAgentIcon(role) {
        const icons = {
            'code-assistant': 'bx bx-code-alt',
            'debugger': 'bx bx-bug',
            'optimizer': 'bx bx-tachometer',
            'security-expert': 'bx bx-shield-quarter',
            'ui-designer': 'bx bx-palette',
            'devops-engineer': 'bx bx-server',
            'documentation-writer': 'bx bx-book',
            'data-scientist': 'bx bx-line-chart',
            'architect': 'bx bx-building-house'
        };
        
        return icons[role] || 'bx bx-bot';
    }

    formatRole(role) {
        return role
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}

// Initialize when the document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.agentInteractions = new AgentInteractions();
}); 