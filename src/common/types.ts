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
  createdAt: Date | string
  updatedAt: Date | string
}

export interface AgentResponse {
  id: string
  agentId: string
  prompt: string
  response: string
  timestamp: Date
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  agentId?: string
  createdAt: Date
}

export interface TaskResult {
  taskId: string
  result: any
  success: boolean
  timestamp: Date
}

export interface AgentExperience {
  currentLevel: number
  currentExperience: number
  experienceToNextLevel: number
} 