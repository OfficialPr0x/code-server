/**
 * Simple test server that forwards to the main server
 */
import * as path from 'path';
import * as child_process from 'child_process';

// Path to the main server.js file
const mainServerPath = path.resolve(__dirname, '../../../dist/node/server.js');

console.log(`Forwarding to main server at: ${mainServerPath}`);

// Spawn the main server process
const serverProcess = child_process.spawn('node', [mainServerPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: process.env.PORT || '3000'
  }
});

// Handle process exit
serverProcess.on('exit', (code) => {
  console.log(`Main server exited with code ${code}`);
  process.exit(code || 0);
});

// Handle process errors
serverProcess.on('error', (err) => {
  console.error('Failed to start main server:', err);
  process.exit(1);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  serverProcess.kill('SIGINT');
});
