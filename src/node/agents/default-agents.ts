/**
 * Default Agents for AI War Room IDE
 * Defines a set of pre-configured AI agents with specific roles and capabilities
 */

import { AgentConfig, AgentRole } from './types';

/**
 * Generate default agent configurations
 * These will be used to create the initial set of agents when the system first starts
 * @returns Array of default agent configurations
 */
export function getDefaultAgents(): AgentConfig[] {
  const now = new Date();
  
  return [
    {
      id: 'code-assistant-1',
      name: 'Code Assistant',
      description: 'An expert coding assistant that helps with code generation, refactoring, and best practices.',
      systemPrompt: `You are an expert coding assistant in the AI War Room IDE. 
Your primary role is to help users write high-quality code, suggest improvements, and implement best practices.
Focus on being helpful, accurate, and providing clear explanations.
Always provide context for your suggestions and explain why certain approaches are better than others.`,
      model: 'anthropic/claude-3-sonnet-20240229',
      maxTokens: 2000,
      temperature: 0.7,
      role: 'code-assistant',
      skills: ['JavaScript', 'TypeScript', 'Python', 'React', 'Node.js'],
      level: 3,
      experience: 350,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'debugger-1',
      name: 'Debug Wizard',
      description: 'Specialized in identifying and fixing bugs in your code.',
      systemPrompt: `You are a debugging expert in the AI War Room IDE.
Your primary role is to help users identify and fix bugs in their code.
Analyze error messages, trace code execution, and suggest fixes for issues.
Provide detailed explanations of what's causing each problem and how your solution addresses it.`,
      model: 'anthropic/claude-3-sonnet-20240229',
      maxTokens: 2000,
      temperature: 0.5,
      role: 'debugger',
      skills: ['Error Analysis', 'Debugging', 'Testing', 'Code Review'],
      level: 2,
      experience: 180,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'optimizer-1',
      name: 'Performance Optimizer',
      description: 'Helps optimize your code for better performance and efficiency.',
      systemPrompt: `You are a performance optimization expert in the AI War Room IDE.
Your primary role is to help users improve the performance and efficiency of their code.
Identify bottlenecks, suggest optimizations, and refactor inefficient code.
Focus on measurable improvements and explain the reasoning behind each optimization.`,
      model: 'anthropic/claude-3-haiku-20240307',
      maxTokens: 1000,
      temperature: 0.4,
      role: 'optimizer',
      skills: ['Algorithm Optimization', 'Memory Management', 'Performance Analysis'],
      level: 2,
      experience: 220,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'security-expert-1',
      name: 'Security Guardian',
      description: 'Identifies and fixes security vulnerabilities in your code.',
      systemPrompt: `You are a security expert in the AI War Room IDE.
Your primary role is to help users identify and address security vulnerabilities in their code.
Scan for common security issues, suggest secure coding practices, and recommend fixes.
Educate users about potential security risks and how to prevent them.`,
      model: 'anthropic/claude-3-sonnet-20240229',
      maxTokens: 1500,
      temperature: 0.5,
      role: 'security-expert',
      skills: ['Security Analysis', 'Vulnerability Assessment', 'Secure Coding Practices'],
      level: 3,
      experience: 310,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'ui-designer-1',
      name: 'UI Architect',
      description: 'Helps design and implement beautiful user interfaces and experiences.',
      systemPrompt: `You are a UI/UX design expert in the AI War Room IDE.
Your primary role is to help users create beautiful and functional user interfaces.
Suggest UI improvements, recommend design patterns, and help implement responsive designs.
Focus on user experience, accessibility, and modern design principles.`,
      model: 'anthropic/claude-3-opus-20240229',
      maxTokens: 2000,
      temperature: 0.7,
      role: 'ui-designer',
      skills: ['UI Design', 'CSS', 'Animation', 'Responsive Design', 'Accessibility'],
      level: 4,
      experience: 450,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'devops-engineer-1',
      name: 'DevOps Master',
      description: 'Assists with deployment, CI/CD pipelines, and infrastructure management.',
      systemPrompt: `You are a DevOps expert in the AI War Room IDE.
Your primary role is to help users with deployment, CI/CD pipelines, and infrastructure management.
Provide guidance on containerization, automated testing, and deployment strategies.
Focus on best practices for reliable and scalable infrastructure.`,
      model: 'anthropic/claude-3-sonnet-20240229',
      maxTokens: 1500,
      temperature: 0.6,
      role: 'devops-engineer',
      skills: ['Docker', 'Kubernetes', 'GitHub Actions', 'AWS', 'CI/CD'],
      level: 4,
      experience: 580,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'documentation-writer-1',
      name: 'Doc Maestro',
      description: 'Helps create clear, comprehensive documentation for your code.',
      systemPrompt: `You are a documentation expert in the AI War Room IDE.
Your primary role is to help users create clear and comprehensive documentation for their code.
Generate comments, README files, API documentation, and usage guides.
Focus on clarity, completeness, and following documentation best practices.`,
      model: 'anthropic/claude-3-haiku-20240307',
      maxTokens: 1500,
      temperature: 0.6,
      role: 'documentation-writer',
      skills: ['Technical Writing', 'API Documentation', 'Markdown', 'Code Comments'],
      level: 2,
      experience: 200,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'architect-1',
      name: 'System Architect',
      description: 'Helps design scalable and maintainable software architecture.',
      systemPrompt: `You are a software architecture expert in the AI War Room IDE.
Your primary role is to help users design scalable and maintainable software systems.
Suggest architectural patterns, help with system design, and guide technical decisions.
Focus on long-term maintainability, scalability, and solid engineering principles.`,
      model: 'anthropic/claude-3-opus-20240229',
      maxTokens: 2500,
      temperature: 0.5,
      role: 'architect',
      skills: ['System Design', 'Design Patterns', 'Microservices', 'Domain-Driven Design'],
      level: 5,
      experience: 720,
      createdAt: now,
      updatedAt: now
    }
  ];
}

/**
 * Get color coding for agent roles
 * Used for consistent UI representation of agent roles
 */
export const agentRoleColors: Record<AgentRole, string> = {
  'code-assistant': '#3B82F6', // Blue
  'debugger': '#EF4444',      // Red
  'optimizer': '#8B5CF6',     // Purple
  'security-expert': '#F59E0B', // Amber
  'ui-designer': '#10B981',   // Green
  'devops-engineer': '#6366F1', // Indigo
  'documentation-writer': '#EC4899', // Pink
  'data-scientist': '#14B8A6', // Teal
  'architect': '#D4AF37'      // Gold
};

/**
 * Get icon names for agent roles
 * Used for consistent UI representation of agent roles
 */
export const agentRoleIcons: Record<AgentRole, string> = {
  'code-assistant': 'bx bx-code-alt',
  'debugger': 'bx bx-bug',
  'optimizer': 'bx bx-tachometer',
  'security-expert': 'bx bx-shield-quarter',
  'ui-designer': 'bx bx-palette',
  'devops-engineer': 'bx bx-server',
  'documentation-writer': 'bx bx-book',
  'data-scientist': 'bx bx-line-chart',
  'architect': 'bx bx-building-house'
};

/**
 * Get nice display names for agent roles
 */
export function formatRoleName(role: AgentRole): string {
  return role
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get experience required for each level
 * This follows a simple progression where each level requires more XP than the previous
 * @param level The level to calculate XP threshold for
 * @returns The amount of XP required to reach this level
 */
export function getExperienceThreshold(level: number): number {
  // Base XP is 100, and each level requires level * 100 more XP
  return level * 100;
}

/**
 * Calculate level from total experience points
 * @param experience Total experience points
 * @returns Current level based on experience
 */
export function calculateLevelFromExperience(experience: number): number {
  let level = 1;
  let threshold = getExperienceThreshold(level);
  
  while (experience >= threshold) {
    level++;
    threshold += getExperienceThreshold(level);
  }
  
  return level;
}

/**
 * Calculate progress to next level
 * @param experience Total experience points
 * @returns Object containing level information and progress percentage
 */
export function getLevelProgress(experience: number): { 
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  progress: number;
} {
  const currentLevel = calculateLevelFromExperience(experience);
  const previousLevelThreshold = currentLevel === 1 ? 0 : 
    Array.from({ length: currentLevel - 1 }, (_, i) => getExperienceThreshold(i + 1))
      .reduce((sum, xp) => sum + xp, 0);
  
  const nextLevelThreshold = getExperienceThreshold(currentLevel);
  const currentLevelXP = experience - previousLevelThreshold;
  
  return {
    currentLevel,
    currentXP: currentLevelXP,
    nextLevelXP: nextLevelThreshold,
    progress: (currentLevelXP / nextLevelThreshold) * 100
  };
} 