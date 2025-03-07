# AI War Room IDE

Welcome to the AI War Room IDE, a powerful code-server extension that brings intelligent AI agents into your development workflow. This extension transforms your coding experience by providing specialized AI assistants for different aspects of software development.

![AI War Room IDE](https://i.imgur.com/Z6wMgw0.png)

## Features

- **AI Agent Ecosystem**: Interact with a diverse set of specialized AI agents, each with different skills and expertise
- **Agent Leveling System**: Agents gain experience and level up as they assist you, becoming more effective over time
- **Blockchain Integration**: Premium agents can be acquired and owned as NFTs on the blockchain
- **Contextual Assistance**: Agents can analyze your code and provide contextual help and suggestions
- **Task Assignment**: Delegate specific coding tasks to appropriate agents
- **Agent Marketplace**: Discover and acquire new agents with specialized skills
- **Real-time Collaboration**: Work alongside AI agents that understand your codebase and goals

## Agent Types

- **Code Assistant**: Helps with code generation, refactoring, and best practices
- **Debug Wizard**: Specialized in identifying and fixing bugs in your code
- **Performance Optimizer**: Improves your code's efficiency and performance
- **Security Guardian**: Identifies and fixes security vulnerabilities
- **UI Architect**: Helps design and implement beautiful user interfaces
- **DevOps Master**: Assists with deployment, CI/CD pipelines, and infrastructure
- **Doc Maestro**: Creates clear, comprehensive documentation for your code
- **System Architect**: Helps design scalable and maintainable software architecture

## Setup

### Prerequisites

- Node.js 16+
- npm or yarn
- An OpenRouter API key for AI model access

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/code-server.git
   cd code-server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure the AI agents:
   Create a `.env` file in the root directory with the following content:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key
   AGENT_CONFIG_DIR=./agent-config
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Build for production:
   ```
   npm run build
   ```

## Usage

1. **Accessing the War Room**: Open the AI War Room panel by clicking the bot icon in the sidebar.

2. **Chatting with Agents**: Click on any agent card to start a conversation. Agents will provide assistance based on their specialized roles.

3. **Assigning Tasks**: You can assign specific coding tasks to agents by clicking the "Assign Task" button on any agent card.

4. **Agent Marketplace**: Discover and acquire new agents through the marketplace by clicking the store icon in the sidebar.

5. **Agent Leveling**: As you interact with agents, they'll gain experience and level up, becoming more capable and efficient.

## Development

### Project Structure

- `src/browser/pages`: Contains the front-end UI components
- `src/node/agents`: Contains agent implementation and service classes
- `src/node/routes`: API routes for agent interactions

### Adding New Agents

To create a new agent type, update the following files:

1. `src/node/agents/types.ts` - Add the new role to the `AgentRole` type
2. `src/node/agents/default-agents.ts` - Add a new agent configuration
3. Update color and icon mappings in the same file

### Customizing Agents

Agents can be customized by editing their configuration in the `agent-config` directory. Each agent has:

- **System Prompt**: Defines the agent's behavior and expertise
- **Model**: The underlying AI model used by the agent
- **Temperature**: Controls the creativity of the agent's responses
- **Skills**: Areas of expertise for the agent

## License

MIT

## Acknowledgments

- The code-server team for the amazing foundation
- OpenRouter for providing access to state-of-the-art AI models
- The open source community for inspiration and support

---

Built with ❤️ by the AI War Room team 