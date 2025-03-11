/**
 * Agent Interactions 
 * Handles UI interactions with the agent system
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize WebSocket connection for real-time agent interactions
  let socket;
  
  function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    try {
      socket = new WebSocket(`${protocol}//${host}/ai-warroom`);
      
      socket.onopen = () => {
        console.log('WebSocket connection established');
        displaySystemMessage('Connected to AI War Room. All agent features are enabled.');
      };
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received message:', message);
          
          if (message.type === 'agent-message' && message.content) {
            displayAgentMessage(message.content, message.agentId);
          } else if (message.type === 'agent-status') {
            updateAgentStatus(message.agents);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      socket.onclose = () => {
        console.log('WebSocket connection closed');
        setTimeout(initWebSocket, 3000); // Try to reconnect after 3 seconds
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      displaySystemMessage('Failed to connect to agent system. Using offline mode.');
    }
  }
  
  // Initialize chat UI
  const chatContainer = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');
  
  if (chatContainer && chatInput && sendButton) {
    // Set up chat functionality
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        sendMessage();
      }
    });
    
    // Activate agent buttons
    document.querySelectorAll('.action-button').forEach((button, index) => {
      button.addEventListener('click', () => {
        const agentId = `agent-${index + 1}`;
        activateAgent(agentId);
      });
    });
  }
  
  function sendMessage() {
    if (!chatInput) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    displayUserMessage(message);
    
    // Get the active agent
    const activeAgent = window.AIAgentManager?.activeAgent;
    
    if (activeAgent) {
      // If we have a WebSocket connection, send through that
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'user-message',
          agentId: activeAgent.id,
          content: message
        }));
      } else {
        // Otherwise use the local agent processing
        activeAgent.process(message)
          .then(response => {
            displayAgentMessage(response.content, activeAgent.id);
          })
          .catch(error => {
            console.error('Error processing message with agent:', error);
            displaySystemMessage('Failed to process message with agent. Try again later.');
          });
      }
    } else {
      displaySystemMessage('Please activate an agent first by clicking the "Activate" button on an agent card.');
    }
    
    chatInput.value = '';
  }
  
  function activateAgent(agentId) {
    if (window.AIAgentManager) {
      const agent = window.AIAgentManager.setActiveAgent(agentId);
      if (agent) {
        displaySystemMessage(`Agent ${agent.name} activated and ready to assist.`);
        
        // Update UI to show active agent
        document.querySelectorAll('.action-button').forEach(btn => {
          btn.textContent = 'Activate';
          btn.classList.remove('active');
        });
        
        // Find the button that activated this agent and update it
        const button = document.querySelector(`[data-agent-id="${agentId}"] .action-button`);
        if (button) {
          button.textContent = 'Active';
          button.classList.add('active');
        }
      }
    } else {
      displaySystemMessage('Agent system not initialized. Try refreshing the page.');
    }
  }
  
  function displayUserMessage(content) {
    if (!chatContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'user-message';
    messageElement.innerHTML = `
      <div class="message-content user">
        <p>${escapeHtml(content)}</p>
      </div>
    `;
    
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
  
  function displayAgentMessage(content, agentId) {
    if (!chatContainer) return;
    
    const agent = window.AIAgentManager?.getAgent(agentId);
    const agentName = agent ? agent.name : 'AI Agent';
    
    const messageElement = document.createElement('div');
    messageElement.className = 'agent-message';
    messageElement.innerHTML = `
      <div class="message-header">
        <strong>${escapeHtml(agentName)}</strong>
      </div>
      <div class="message-content agent">
        <p>${escapeHtml(content)}</p>
      </div>
    `;
    
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
  
  function displaySystemMessage(content) {
    if (!chatContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'system-message';
    messageElement.innerHTML = `
      <div class="message-content system">
        <p>${escapeHtml(content)}</p>
      </div>
    `;
    
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
  
  function updateAgentStatus(agents) {
    // Update agent status in the UI
    if (!agents || !agents.length) return;
    
    agents.forEach(agent => {
      const agentElement = document.querySelector(`[data-agent-id="${agent.id}"]`);
      if (agentElement) {
        // Update agent level display
        const levelElement = agentElement.querySelector('.agent-level');
        if (levelElement) {
          levelElement.textContent = `Level ${agent.level}`;
        }
        
        // Update agent progress bar
        const progressElement = agentElement.querySelector('.agent-progress');
        if (progressElement) {
          progressElement.style.width = `${agent.progress || 0}%`;
        }
      }
    });
  }
  
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * Format agent role into a readable string
   * @param {string} role - The role of the agent
   * @returns {string} - Formatted role string
   */
  function formatRole(role) {
    if (!role) return 'General Assistant';
    
    // Handle case where role is undefined
    const roleParts = typeof role === 'string' ? role.split('-') : ['general'];
    
    return roleParts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  
  // Initialize the WebSocket connection
  initWebSocket();
}); 