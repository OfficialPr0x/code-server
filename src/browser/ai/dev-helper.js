/**
 * AI War Room Development Helper Script
 * This file provides utilities for testing and developing the AI War Room features
 */

(function() {
  // Check if we're in development mode
  const isDev = window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.search.includes('aidev=true');

  // Only run in development mode
  if (!isDev) return;

  console.log('[AI War Room] Development mode active');

  // Create development controls
  function createDevControls() {
    const container = document.createElement('div');
    container.className = 'ai-dev-controls';
    container.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.7);
      border: 1px solid #d4af37;
      border-radius: 8px;
      padding: 10px;
      z-index: 9999;
      font-family: monospace;
      color: white;
      font-size: 12px;
    `;

    container.innerHTML = `
      <h4 style="margin: 0 0 10px 0; color: #d4af37;">AI War Room Dev</h4>
      <div style="display: flex; flex-direction: column; gap: 5px;">
        <button data-action="toggle-theme">Toggle AI Theme</button>
        <button data-action="toggle-agent-panel">Toggle Agent Panel</button>
        <button data-action="toggle-chat-dialog">Show Chat Dialog</button>
        <button data-action="inject-test-agent">Inject Test Agent</button>
        <button data-action="clear-console">Clear Console</button>
      </div>
    `;

    document.body.appendChild(container);

    // Add event listeners
    container.querySelector('[data-action="toggle-theme"]').addEventListener('click', () => {
      document.body.classList.toggle('ai-theme');
      document.querySelector('.monaco-workbench')?.classList.toggle('ai-theme');
      console.log('[AI War Room] Theme toggled');
    });

    container.querySelector('[data-action="toggle-agent-panel"]').addEventListener('click', () => {
      if (window.aiAgentSystem) {
        window.toggleAIAgentPanel();
        console.log('[AI War Room] Agent panel toggled');
      } else {
        console.warn('[AI War Room] Agent system not initialized');
      }
    });

    container.querySelector('[data-action="toggle-chat-dialog"]').addEventListener('click', () => {
      if (window.aiAgentSystem) {
        window.openAIChatDialog();
        console.log('[AI War Room] Chat dialog opened');
      } else {
        console.warn('[AI War Room] Agent system not initialized');
      }
    });

    container.querySelector('[data-action="inject-test-agent"]').addEventListener('click', () => {
      if (window.aiAgentSystem) {
        injectTestAgent();
        console.log('[AI War Room] Test agent injected');
      } else {
        console.warn('[AI War Room] Agent system not initialized');
      }
    });

    container.querySelector('[data-action="clear-console"]').addEventListener('click', () => {
      console.clear();
      console.log('[AI War Room] Console cleared');
    });
  }

  // Inject a test agent
  function injectTestAgent() {
    if (!window.aiAgentSystem) return;

    const randomId = 'test-agent-' + Math.floor(Math.random() * 1000);
    
    // Create test agent
    class TestAgent {
      constructor() {
        this.id = randomId;
        this.name = 'Test Agent';
        this.role = 'Testing Assistant';
        this.level = 1;
        this.progress = 0;
        this.avatar = { icon: 'bx-test-tube', color: '#8b5cf6' };
        this.capabilities = ['testing'];
        this.isActive = false;
      }

      getAvatarHTML() {
        return `<i class="bx ${this.avatar.icon}"></i>`;
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

    try {
      window.aiAgentSystem.addAgent(new TestAgent());
      window.aiAgentSystem.showAgentPanel();
    } catch (error) {
      console.error('[AI War Room] Failed to inject test agent:', error);
    }
  }

  // Mock WebSocket for offline development
  function setupMockWebSocket() {
    // Save the original WebSocket
    const OriginalWebSocket = window.WebSocket;
    
    // Create a mock WebSocket for AI agents endpoints
    window.WebSocket = function(url, protocols) {
      if (url.includes('/ai-agents')) {
        console.log('[AI War Room] Using mock WebSocket for AI agents');
        
        // Create a mock WebSocket object
        const mockWs = {
          url,
          protocols,
          readyState: 1, // OPEN
          send: function(data) {
            console.log('[AI War Room] Mock WebSocket sent:', data);
            
            // Simulate agent response after a delay
            setTimeout(() => {
              if (this.onmessage) {
                try {
                  const message = JSON.parse(data);
                  
                  if (message.type === 'user-message') {
                    const response = {
                      type: 'agent-response',
                      agentId: message.agentId,
                      content: `This is a mock response to: "${message.content}"`,
                      status: {
                        level: 1,
                        progress: Math.min(100, Math.floor(Math.random() * 100))
                      }
                    };
                    
                    this.onmessage({ data: JSON.stringify(response) });
                  }
                } catch (error) {
                  console.error('[AI War Room] Mock WebSocket error:', error);
                }
              }
            }, 1000);
          },
          close: function() {
            console.log('[AI War Room] Mock WebSocket closed');
            this.readyState = 3; // CLOSED
            if (this.onclose) {
              this.onclose({ code: 1000, reason: 'Mock close' });
            }
          }
        };
        
        // Simulate connection after a small delay
        setTimeout(() => {
          if (mockWs.onopen) {
            mockWs.onopen({});
          }
          
          // Send initial agent list
          if (mockWs.onmessage) {
            const agentList = {
              type: 'agent-list',
              agents: [
                {
                  id: 'mock-agent-1',
                  name: 'Mock Agent',
                  role: 'Testing Assistant',
                  level: 2,
                  progress: 50,
                  avatar: { icon: 'bx-bot', color: '#9333ea' },
                  capabilities: ['mock-testing', 'debugging'],
                  isActive: false
                }
              ]
            };
            
            mockWs.onmessage({ data: JSON.stringify(agentList) });
          }
        }, 300);
        
        return mockWs;
      } else {
        // For non-AI agents endpoints, use the original WebSocket
        return new OriginalWebSocket(url, protocols);
      }
    };
    
    // Copy properties from original WebSocket
    Object.defineProperties(window.WebSocket, Object.getOwnPropertyDescriptors(OriginalWebSocket));
  }

  // Initialize development helpers
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAfterDOMReady);
    } else {
      initAfterDOMReady();
    }
  }

  function initAfterDOMReady() {
    // Add development controls
    createDevControls();
    
    // Setup mock WebSocket if needed
    if (window.location.search.includes('mockws=true')) {
      setupMockWebSocket();
    }
    
    // Log when AI agent system is initialized
    const originalInitialize = window.aiAgentSystem?.initialize;
    if (originalInitialize) {
      window.aiAgentSystem.initialize = async function() {
        console.log('[AI War Room] Agent system initializing...');
        try {
          await originalInitialize.apply(this, arguments);
          console.log('[AI War Room] Agent system initialized successfully');
        } catch (error) {
          console.error('[AI War Room] Agent system initialization failed:', error);
          throw error;
        }
      };
    }
    
    console.log('[AI War Room] Development helpers initialized');
  }

  // Start initialization
  init();
})(); 