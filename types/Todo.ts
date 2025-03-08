export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  priority?: 'low' | 'medium' | 'high';
} 