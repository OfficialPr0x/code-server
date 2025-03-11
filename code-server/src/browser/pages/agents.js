/**
 * AI Agents functionality for Cursor IDE
 */
class AgentManager {
  constructor() {
    this.agents = []
    this.activeAgent = null
    this.chatHistory = new Map() // Map of agent ID to chat history
    this.apiEndpoint = "/api/agents"
    this.initialized = false
    this.chatDialog = document.getElementById("agent-chat-dialog")
    this.chatContainer = document.getElementById("agent-chat-container")
    this.marketplaceModal = document.getElementById("agent-marketplace-modal")

    // Bind event handlers
    this.handleAgentClick = this.handleAgentClick.bind(this)
    this.handleChatSubmit = this.handleChatSubmit.bind(this)
    this.handleChatClose = this.handleChatClose.bind(this)
    this.handleMarketplaceOpen = this.handleMarketplaceOpen.bind(this)
    this.handleMarketplaceClose = this.handleMarketplaceClose.bind(this)
  }

  /**
   * Initialize the agent manager
   */
  async initialize() {
    if (this.initialized) return

    try {
      await this.fetchAgents()
      this.setupEventListeners()
      this.renderAgents()
      this.initialized = true
      console.log("Agent Manager initialized")
    } catch (error) {
      console.error("Failed to initialize Agent Manager:", error)
    }
  }

  /**
   * Fetch agents from the API
   */
  async fetchAgents() {
    try {
      const response = await fetch(`${this.apiEndpoint}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        this.agents = result.data
        console.log(`Loaded ${this.agents.length} agents`)
      } else {
        throw new Error(result.error || "Failed to fetch agents")
      }
    } catch (error) {
      console.error("Error fetching agents:", error)
      throw error
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Chat dialog
    const chatForm = document.getElementById("agent-chat-form")
    const chatCloseBtn = document.getElementById("agent-chat-close")

    if (chatForm) {
      chatForm.addEventListener("submit", this.handleChatSubmit)
    }

    if (chatCloseBtn) {
      chatCloseBtn.addEventListener("click", this.handleChatClose)
    }

    // Marketplace
    const marketplaceBtn = document.getElementById("agent-marketplace-btn")
    const marketplaceCloseBtn = document.getElementById("marketplace-close")

    if (marketplaceBtn) {
      marketplaceBtn.addEventListener("click", this.handleMarketplaceOpen)
    }

    if (marketplaceCloseBtn) {
      marketplaceCloseBtn.addEventListener("click", this.handleMarketplaceClose)
    }

    // Agent panel toggle
    const agentPanelToggle = document.querySelector('.sidebar-button[data-panel="ai-agents"]')
    if (agentPanelToggle) {
      agentPanelToggle.addEventListener("click", () => {
        document.querySelectorAll(".panel").forEach((panel) => {
          panel.classList.remove("active")
        })
        document.getElementById("ai-agents-panel").classList.add("active")

        // Update active state on sidebar buttons
        document.querySelectorAll(".sidebar-button").forEach((btn) => {
          btn.classList.remove("active")
        })
        agentPanelToggle.classList.add("active")
      })
    }
  }

  /**
   * Render agents in the UI
   */
  renderAgents() {
    const agentsContainer = document.getElementById("ai-agents-list")
    if (!agentsContainer) return

    agentsContainer.innerHTML = ""

    this.agents.forEach((agent) => {
      const agentCard = document.createElement("div")
      agentCard.className = "agent-card"
      agentCard.dataset.agentId = agent.id

      const levelBadge = `<div class="agent-level">Level ${agent.level}</div>`
      const experienceBar = `<div class="agent-xp-bar"><div class="agent-xp-progress" style="width: ${this.calculateExperiencePercentage(agent)}%"></div></div>`

      agentCard.innerHTML = `
        <div class="agent-info">
          <h3 class="agent-name">${agent.name}</h3>
          <div class="agent-role">${agent.role}</div>
          ${levelBadge}
          ${experienceBar}
        </div>
        <div class="agent-description">${agent.description}</div>
        <div class="agent-actions">
          <button class="agent-action-btn chat-btn" data-agent-id="${agent.id}">
            <i class='bx bx-message-dots'></i> Chat
          </button>
          <button class="agent-action-btn task-btn" data-agent-id="${agent.id}">
            <i class='bx bx-task'></i> Task
          </button>
        </div>
      `

      agentsContainer.appendChild(agentCard)

      // Add event listeners to buttons
      const chatBtn = agentCard.querySelector(".chat-btn")
      const taskBtn = agentCard.querySelector(".task-btn")

      chatBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        this.handleAgentChat(agent.id)
      })

      taskBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        this.handleAgentTask(agent.id)
      })

      // Make the entire card clickable to open chat
      agentCard.addEventListener("click", () => {
        this.handleAgentChat(agent.id)
      })
    })
  }

  /**
   * Calculate experience percentage for progress bar
   */
  calculateExperiencePercentage(agent) {
    const currentLevel = agent.level
    const nextLevelThreshold = currentLevel * currentLevel * 10
    const prevLevelThreshold = (currentLevel - 1) * (currentLevel - 1) * 10

    const levelProgress = agent.experience - prevLevelThreshold
    const levelRange = nextLevelThreshold - prevLevelThreshold

    return Math.min(100, Math.max(0, (levelProgress / levelRange) * 100))
  }

  /**
   * Handle agent click
   */
  handleAgentClick(e) {
    const agentId = e.currentTarget.dataset.agentId
    this.handleAgentChat(agentId)
  }

  /**
   * Open chat with an agent
   */
  handleAgentChat(agentId) {
    const agent = this.agents.find((a) => a.id === agentId)
    if (!agent) return

    this.activeAgent = agent

    // Set up the chat dialog
    const chatHeader = document.getElementById("agent-chat-header")
    if (chatHeader) {
      chatHeader.textContent = `${agent.name}`
    }

    // Get or create chat history for this agent
    if (!this.chatHistory.has(agentId)) {
      this.chatHistory.set(agentId, [])
    }

    // Render chat history
    this.renderChatHistory(agentId)

    // Show chat dialog
    this.chatDialog.classList.add("visible")
  }

  /**
   * Render chat history for an agent
   */
  renderChatHistory(agentId) {
    const history = this.chatHistory.get(agentId) || []
    this.chatContainer.innerHTML = ""

    if (history.length === 0) {
      // Add a welcome message
      const agent = this.agents.find((a) => a.id === agentId)
      const welcomeMessage = document.createElement("div")
      welcomeMessage.className = "chat-message agent-message"
      welcomeMessage.innerHTML = `
        <div class="message-content">
          <p>Hello! I'm ${agent.name}. How can I assist you today?</p>
        </div>
      `
      this.chatContainer.appendChild(welcomeMessage)
      return
    }

    // Add each message to the chat
    history.forEach((message) => {
      const messageEl = document.createElement("div")
      messageEl.className = `chat-message ${message.isUser ? "user-message" : "agent-message"}`

      messageEl.innerHTML = `
        <div class="message-content">
          <p>${this.formatMessageText(message.text)}</p>
          <span class="message-time">${this.formatTime(message.timestamp)}</span>
        </div>
      `

      this.chatContainer.appendChild(messageEl)
    })

    // Scroll to bottom
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight
  }

  /**
   * Format message text (convert markdown, code blocks, etc.)
   */
  formatMessageText(text) {
    // Simple markdown-like formatting
    // Replace code blocks with formatted HTML
    text = text.replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')

    // Replace inline code
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>")

    // Replace bold text
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")

    // Replace italic text
    text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>")

    // Replace line breaks with <br>
    text = text.replace(/\n/g, "<br>")

    return text
  }

  /**
   * Format timestamp
   */
  formatTime(timestamp) {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  /**
   * Handle chat form submission
   */
  async handleChatSubmit(e) {
    e.preventDefault()

    if (!this.activeAgent) return

    const chatInput = document.getElementById("agent-chat-input")
    const message = chatInput.value.trim()

    if (!message) return

    // Clear input
    chatInput.value = ""

    // Add user message to chat history
    const userMessage = {
      isUser: true,
      text: message,
      timestamp: new Date(),
    }

    const history = this.chatHistory.get(this.activeAgent.id) || []
    history.push(userMessage)
    this.chatHistory.set(this.activeAgent.id, history)

    // Render updated chat
    this.renderChatHistory(this.activeAgent.id)

    // Show typing indicator
    const typingIndicator = document.createElement("div")
    typingIndicator.className = "chat-message agent-message typing"
    typingIndicator.innerHTML = `
      <div class="message-content">
        <p>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </p>
      </div>
    `
    this.chatContainer.appendChild(typingIndicator)
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight

    try {
      // Query the agent API
      const response = await fetch(`${this.apiEndpoint}/${this.activeAgent.id}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: message,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to query agent: ${response.status}`)
      }

      const result = await response.json()

      // Remove typing indicator
      this.chatContainer.removeChild(typingIndicator)

      if (result.success) {
        // Add agent response to chat history
        const agentMessage = {
          isUser: false,
          text: result.data.response,
          timestamp: new Date(),
        }

        history.push(agentMessage)
        this.chatHistory.set(this.activeAgent.id, history)

        // Render updated chat
        this.renderChatHistory(this.activeAgent.id)
      } else {
        throw new Error(result.error || "Failed to get response from agent")
      }
    } catch (error) {
      console.error("Error querying agent:", error)

      // Remove typing indicator
      if (typingIndicator.parentNode === this.chatContainer) {
        this.chatContainer.removeChild(typingIndicator)
      }

      // Show error message
      const errorMessage = document.createElement("div")
      errorMessage.className = "chat-message error-message"
      errorMessage.innerHTML = `
        <div class="message-content">
          <p>Sorry, something went wrong. Please try again.</p>
        </div>
      `
      this.chatContainer.appendChild(errorMessage)
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight
    }
  }

  /**
   * Handle chat dialog close
   */
  handleChatClose() {
    this.chatDialog.classList.remove("visible")
    this.activeAgent = null
  }

  /**
   * Handle creating a task for an agent
   */
  async handleAgentTask(agentId) {
    const agent = this.agents.find((a) => a.id === agentId)
    if (!agent) return

    // For now, just show a simple prompt
    const title = prompt("Task Title:")
    if (!title) return

    const description = prompt("Task Description:")
    if (!description) return

    try {
      const response = await fetch(`${this.apiEndpoint.replace("/agents", "")}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          agentId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        alert(`Task created: ${title}`)

        // Execute the task
        this.executeTask(result.data.id)
      } else {
        throw new Error(result.error || "Failed to create task")
      }
    } catch (error) {
      console.error("Error creating task:", error)
      alert("Failed to create task. Please try again.")
    }
  }

  /**
   * Execute a task
   */
  async executeTask(taskId) {
    try {
      const response = await fetch(`${this.apiEndpoint.replace("/agents", "")}/tasks/${taskId}/execute`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Failed to execute task: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        alert("Task completed successfully")
      } else {
        throw new Error(result.error || "Failed to execute task")
      }
    } catch (error) {
      console.error("Error executing task:", error)
      alert("Failed to execute task. Please try again.")
    }
  }

  /**
   * Open agent marketplace
   */
  handleMarketplaceOpen() {
    this.marketplaceModal.classList.add("visible")
    this.renderMarketplace()
  }

  /**
   * Close agent marketplace
   */
  handleMarketplaceClose() {
    this.marketplaceModal.classList.remove("visible")
  }

  /**
   * Render marketplace agents
   */
  renderMarketplace() {
    const marketplaceContainer = document.getElementById("marketplace-agents")
    if (!marketplaceContainer) return

    // For now, show some sample marketplace agents
    const marketplaceAgents = [
      {
        id: "premium-assistant",
        name: "Claude Pro",
        description: "Premium coding assistant with enhanced capabilities",
        price: 10,
        skills: ["Advanced coding", "System design", "Optimization"],
        level: 5,
      },
      {
        id: "ai-researcher",
        name: "AI Researcher",
        description: "Specialized in researching and analyzing information",
        price: 5,
        skills: ["Research", "Data analysis", "Summary generation"],
        level: 3,
      },
      {
        id: "security-expert",
        name: "Security Expert",
        description: "Specialized in finding and fixing security vulnerabilities",
        price: 15,
        skills: ["Vulnerability detection", "Secure coding", "Penetration testing"],
        level: 4,
      },
    ]

    marketplaceContainer.innerHTML = ""

    marketplaceAgents.forEach((agent) => {
      const agentCard = document.createElement("div")
      agentCard.className = "marketplace-agent-card"

      agentCard.innerHTML = `
        <div class="agent-info">
          <h3 class="agent-name">${agent.name}</h3>
          <div class="agent-price">${agent.price} Credits</div>
          <div class="agent-level">Level ${agent.level}</div>
        </div>
        <div class="agent-description">${agent.description}</div>
        <div class="agent-skills">
          ${agent.skills.map((skill) => `<span class="agent-skill">${skill}</span>`).join("")}
        </div>
        <button class="purchase-btn" data-agent-id="${agent.id}">Purchase</button>
      `

      marketplaceContainer.appendChild(agentCard)

      // Add event listener to purchase button
      const purchaseBtn = agentCard.querySelector(".purchase-btn")
      purchaseBtn.addEventListener("click", () => {
        alert(`Agent purchased: ${agent.name}`)
        this.handleMarketplaceClose()
      })
    })
  }
}

// Initialize agents when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.agentManager = new AgentManager()
  window.agentManager.initialize().catch(console.error)
})
