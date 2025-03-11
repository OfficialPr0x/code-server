/**
 * Types for the AI War Room Agent System
 */

export interface AgentConfig {
  id: string
  name: string
  description: string
  systemPrompt: string
  model: string
  maxTokens: number
  temperature: number
  role: string
  ownerAddress?: string
  tokenId?: string
  skills: string[]
  level: number
  experience: number
  createdAt: Date
  updatedAt: Date
}

export interface Agent {
  id: string
  name: string
  description: string
  systemPrompt: string
  model: string
  maxTokens: number
  temperature: number
  role: string
  skills: string[]
  level: number
  experience: number
  ownerAddress?: string
  tokenId?: string
  query: (prompt: string, context?: any) => Promise<AgentResponse>
  addExperience: (amount: number) => Promise<void>
}

export interface AgentResponse {
  id: string
  agentId: string
  prompt: string
  response: string
  timestamp: Date
  executionTime: number
  model: string
  tokenUsage?: {
    prompt: number
    completion: number
    total: number
  }
}

export interface OpenRouterCompletionRequest {
  model: string
  prompt: string
  system?: string
  context?: string
  max_tokens?: number
  temperature?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  stop?: string[]
}

export interface OpenRouterCompletionResponse {
  id: string
  choices: [
    {
      message: {
        content: string
        role: string
      }
      finish_reason: string
    },
  ]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model: string
}

export interface Task {
  id: string
  description: string
  context: string
  requiredRoles: AgentRole[]
  status: "created" | "assigned" | "in_progress" | "completed" | "failed"
  agentTasks: AgentTask[]
  results: TaskResult[]
  created: Date
  updated: Date
}

export interface AgentTask {
  agentId: string
  status: "assigned" | "in_progress" | "completed" | "failed"
  assigned: Date
  completed?: Date
  error?: string
}

export interface TaskResult {
  agentId: string
  response: AgentResponse
  timestamp: Date
}

export type AgentRole =
  | "code-assistant"
  | "debugger"
  | "optimizer"
  | "security-expert"
  | "ui-designer"
  | "devops-engineer"
  | "documentation-writer"
  | "data-scientist"
  | "architect"

export interface AgentExperience {
  agentId: string
  level: number
  experience: number
  actions: ExperienceAction[]
}

export interface ExperienceAction {
  type:
    | "query"
    | "task_completion"
    | "code_improvement"
    | "bug_fix"
    | "security_improvement"
    | "performance_optimization"
  amount: number
  timestamp: Date
}

export interface LevelUpEvent {
  agentId: string
  oldLevel: number
  newLevel: number
  timestamp: Date
}

export interface AgentNFT {
  id: string // Contract token ID
  name: string
  skills: string[]
  level: number
  experience: number
  owner: string // Wallet address
}

export interface DatabaseConfig {
  client: string
  connection: {
    host: string
    user: string
    password: string
    database: string
    port?: number
  }
}
