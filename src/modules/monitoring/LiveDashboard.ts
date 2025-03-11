import { WebSocketServer } from 'ws';
import { BlockchainService } from '../../services/BlockchainService';

export class LiveMonitor {
  private wss: WebSocketServer;
  private blockchainService: BlockchainService;

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.blockchainService = new BlockchainService();
    this.setupListeners();
  }

  private setupListeners() {
    this.blockchainService.on('transaction', (txData) => {
      this.broadcast('transaction', txData);
    });
    
    this.blockchainService.on('agentUpdate', (agentData) => {
      this.broadcast('agentUpdate', agentData);
    });
  }

  private broadcast(event: string, data: any) {
    this.wss.clients.forEach(client => {
      client.send(JSON.stringify({ event, data }));
    });
  }
} 