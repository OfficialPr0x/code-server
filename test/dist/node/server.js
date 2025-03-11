"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Simple test server that forwards to the main server
 */
const path = __importStar(require("path"));
const child_process = __importStar(require("child_process"));
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
