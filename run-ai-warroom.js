/**
 * AI War Room Launcher
 * 
 * This script launches the AI War Room application with all necessary components.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const http = require('http');
// Create a simple logger
const logger = {
  info: (message) => console.log(`[INFO] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`),
  warn: (message) => console.warn(`[WARN] ${message}`)
};

// Configuration
const config = {
  port: process.env.PORT || 3000,
  rootPath: __dirname,
  staticPath: path.join(__dirname, 'src/browser'),
  apiKey: process.env.OPENROUTER_API_KEY || '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'
};

// Create Express app
const app = express();

// Serve static files
app.use(express.static(config.staticPath));

// Serve Monaco editor files - handle all Monaco paths
app.get('/vs/editor/loader.min.js', (req, res) => {
  // Serve our monaco-fix.js for the loader
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'dist/node/src/browser/pages/monaco-fix.js'));
});

app.get('/vs/editor/editor.main.js', (req, res) => {
  // Serve our monaco-fix.js for the main editor
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'dist/node/src/browser/pages/monaco-fix.js'));
});

// Handle any other Monaco editor files
app.get('/vs/*', (req, res) => {
  // Serve our monaco-fix.js for any other Monaco paths
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'dist/node/src/browser/pages/monaco-fix.js'));
});

// Serve monaco-fix.js directly
app.get('/monaco-fix.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'dist/node/src/browser/pages/monaco-fix.js'));
});

// Serve the AI War Room HTML directly
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/node/src/browser/pages/index.html'));
});

// Serve the Todo app
app.use('/todo', express.static(path.join(__dirname, 'dist-todo')));

// Serve the AI War Room HTML
app.get('/ai-warroom', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/browser/pages/ai-warroom.html'));
});

// API routes - Create a simple router for now
const apiRouter = express.Router();
apiRouter.get('/', (req, res) => {
  res.json({ message: 'AI War Room API' });
});

apiRouter.get('/agents', (req, res) => {
  res.json({
    agents: [
      {
        id: 'agent-1',
        name: 'Code Assistant',
        role: 'Code Assistant',
        status: 'active'
      },
      {
        id: 'agent-openrouter',
        name: 'OpenRouter AI',
        role: 'Connected • Claude 3 Opus',
        status: 'active'
      }
    ]
  });
});

app.use('/api', apiRouter);

// Default route
app.get('/', (req, res) => {
  res.redirect('/ai-warroom');
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ 
  server,
  path: '/ai-warroom'
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  logger.info('WebSocket client connected');
  
  // Send initial status message
  ws.send(JSON.stringify({
    type: 'agent-status',
    agents: [
      {
        id: 'agent-1',
        name: 'Code Assistant',
        level: 1,
        progress: 25
      },
      {
        id: 'agent-openrouter',
        name: 'OpenRouter AI',
        level: 2,
        progress: 50
      }
    ]
  }));
  
  // Handle messages from client
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      logger.info(`Received message: ${JSON.stringify(data)}`);
      
      // Handle user messages
      if (data.type === 'user-message') {
        // Echo back a response for now
        setTimeout(() => {
          ws.send(JSON.stringify({
            type: 'agent-message',
            agentId: data.agentId,
            content: `Received your message: "${data.content}". This is a placeholder response from the server.`
          }));
        }, 1000);
      }
    } catch (error) {
      logger.error(`Error processing WebSocket message: ${error.message}`);
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    logger.info('WebSocket client disconnected');
  });
  
  // Handle errors
  ws.on('error', (error) => {
    logger.error(`WebSocket error: ${error.message}`);
  });
});

// Start the server
server.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║                      AI WAR ROOM LAUNCHER                      ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

  Server running at:
  
  • AI War Room IDE: http://localhost:${config.port}/ai-warroom
  • Todo App: http://localhost:${config.port}/todo
  
  Press Ctrl+C to stop the server
  `);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});
