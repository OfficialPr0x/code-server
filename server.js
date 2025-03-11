const express = require('express');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist-todo directory
app.use(express.static(path.join(__dirname, 'dist-todo')));

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist-todo', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop the server`);
});

const wss = new WebSocket.Server({ 
    port: 3001,
    path: '/807aab1f7efd5f710ab9164118ded086afa7251b'
});

wss.on('connection', function connection(ws) {
    console.log('Client connected');
    // Add error handling
    ws.on('error', function(error) {
        console.error('WebSocket error:', error);
    });
});
