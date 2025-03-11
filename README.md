# AI War Room

A powerful development environment with integrated AI assistance for enhanced productivity.

## Overview

AI War Room is a comprehensive IDE-like environment that integrates AI agents to assist with coding, research, debugging, and other development tasks. It provides a familiar VSCode-like interface with additional AI-powered features.

## Features

### Core Features

- **VSCode-like Interface**: Familiar editor experience with syntax highlighting, file explorer, and more
- **AI Agent Integration**: Interact with AI agents specialized in different tasks
- **OpenRouter Integration**: Connect to advanced AI models like Claude 3 Opus, GPT-4 Turbo, and more
- **Agent Marketplace**: Discover and add specialized AI agents to your workspace
- **Todo App**: Integrated task management application

### AI Capabilities

- **Code Assistance**: Get help with writing, reviewing, and refactoring code
- **Debugging**: AI-powered debugging suggestions and error analysis
- **Research**: Use AI to gather and summarize information
- **Custom Agents**: Create and configure custom AI agents for specific tasks

## Components

The AI War Room consists of several key components:

1. **AI War Room IDE**: The main interface for interacting with the system
2. **Agent Service**: Manages AI agents and their capabilities
3. **OpenRouter Integration**: Connects to advanced AI models
4. **Todo App**: Task management application

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

To run the full AI War Room application:

```bash
node run-ai-warroom.js
```

This will start the server and make the following endpoints available:

- AI War Room IDE: http://localhost:3000/ai-warroom
- Todo App: http://localhost:3000/todo

### Running the Todo App Separately

To run just the Todo app:

```bash
# Build the Todo app
node build-todo-app.js

# Run the Todo app server
node server.js
```

Then open your browser and navigate to http://localhost:3000

### Deploying the Todo App

To create a deployment package for the Todo app:

```bash
node deploy.js
```

This will create a `deploy` directory with everything needed to deploy the Todo app to a production server.

## Configuration

### OpenRouter API Key

To use the AI capabilities, you need an OpenRouter API key. You can set it in the following ways:

1. Environment variable: `OPENROUTER_API_KEY`
2. Through the UI: Settings > AI Integration > OpenRouter API Key

### Agent Configuration

Agents can be configured through the AI Lab interface. Click on the lab icon in the sidebar to open the AI Lab and customize your agents.

## Project Structure

```
├── app/                    # Todo app source files
├── context/                # React context providers
├── dist-todo/              # Production build of Todo app
├── dist/                   # Compiled server files
├── src/                    # Source files
│   ├── browser/            # Frontend assets
│   │   ├── pages/          # HTML pages
│   │   │   └── ai-warroom.html  # Main AI War Room interface
│   ├── common/             # Shared utilities
│   ├── components/         # UI components
│   ├── contexts/           # Context providers
│   ├── contracts/          # Smart contract interfaces
│   ├── modules/            # Core modules
│   │   ├── agent/          # Agent management
│   │   ├── security/       # Security framework
│   │   └── ...
│   ├── node/               # Server-side code
│   │   ├── agents/         # Agent service and controller
│   │   └── ...
│   └── services/           # Service implementations
├── styles/                 # CSS styles
├── build-todo-app.js       # Todo app build script
├── deploy.js               # Todo app deployment script
├── run-ai-warroom.js       # AI War Room launcher
└── server.js               # Todo app server
```

## Development

### Building the Todo App

```bash
node build-todo-app.js
```

### Creating a Deployment Package

```bash
node deploy.js
```

### Running in Development Mode

```bash
# Run the Todo app in development mode
node server.js

# Run the full AI War Room in development mode
node run-ai-warroom.js
```

## License

MIT
