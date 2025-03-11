// Mock implementation of AgentDAO contract
export interface Proposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  forVotes: number;
  againstVotes: number;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  createdAt: Date;
}

export class AgentDAO {
  private proposals: Proposal[] = [];
  private nextProposalId = 1;

  constructor() {
    // Initialize with some mock proposals
    this.proposals = [
      {
        id: 0,
        title: 'Upgrade Agent Protocol',
        description: 'Upgrade the agent communication protocol to v2.0',
        proposer: '0x1234567890abcdef1234567890abcdef12345678',
        forVotes: 100,
        againstVotes: 20,
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 3) // 3 days ago
      }
    ];
  }

  async getProposals(): Promise<Proposal[]> {
    return this.proposals;
  }

  async createProposal(title: string, description: string, proposer: string): Promise<Proposal> {
    const proposal: Proposal = {
      id: this.nextProposalId++,
      title,
      description,
      proposer,
      forVotes: 0,
      againstVotes: 0,
      status: 'active',
      createdAt: new Date()
    };

    this.proposals.push(proposal);
    return proposal;
  }

  async vote(proposalId: number, support: boolean, voter: string): Promise<void> {
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (support) {
      proposal.forVotes += 1;
    } else {
      proposal.againstVotes += 1;
    }

    // Update status based on votes
    if (proposal.forVotes > proposal.againstVotes * 2) {
      proposal.status = 'passed';
    } else if (proposal.againstVotes > proposal.forVotes * 2) {
      proposal.status = 'rejected';
    }
  }

  async executeProposal(proposalId: number): Promise<void> {
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== 'passed') {
      throw new Error(`Proposal ${proposalId} is not in passed state`);
    }

    proposal.status = 'executed';
  }
}
