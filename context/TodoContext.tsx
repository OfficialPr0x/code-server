import React, { createContext, useState, useContext, useMemo, ReactNode } from 'react';
import { Todo } from '../types/Todo';
import { v4 as uuidv4 } from 'uuid';

interface FilterState {
  status: 'all' | 'completed' | 'active';
  priority: 'all' | 'high' | 'medium' | 'low';
  sort: 'newest' | 'oldest' | 'priority';
}

interface TodoContextType {
  todos: Todo[];
  addTodo: (text: string, priority?: 'low' | 'medium' | 'high') => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  filteredTodos: Todo[];
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

interface TodoContextProviderProps {
  children: ReactNode;
}

export function TodoContextProvider({ children }: TodoContextProviderProps) {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: '1',
      text: 'Learn React',
      completed: true,
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      priority: 'high'
    },
    {
      id: '2',
      text: 'Build a Todo App',
      completed: false,
      createdAt: new Date(),
      priority: 'medium'
    },
    {
      id: '3',
      text: 'Deploy to production',
      completed: false,
      createdAt: new Date(),
      priority: 'low'
    }
  ]);

  const [filter, setFilter] = useState<FilterState>({
    status: 'all',
    priority: 'all',
    sort: 'newest'
  });

  const addTodo = (text: string, priority: 'low' | 'medium' | 'high' = 'low') => {
    const newTodo: Todo = {
      id: uuidv4(),
      text,
      completed: false,
      createdAt: new Date(),
      priority
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const filteredTodos = useMemo(() => {
    return todos
      .filter(todo => {
        const matchesStatus = 
          filter.status === 'all' || 
          (filter.status === 'completed' && todo.completed) ||
          (filter.status === 'active' && !todo.completed);
        
        const matchesPriority = 
          filter.priority === 'all' || 
          todo.priority === filter.priority;
        
        return matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (filter.sort === 'newest') return b.createdAt.getTime() - a.createdAt.getTime();
        if (filter.sort === 'oldest') return a.createdAt.getTime() - b.createdAt.getTime();
        
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority || 'low'] - priorityOrder[a.priority || 'low'];
      });
  }, [todos, filter]);

  const value = {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    filter,
    setFilter,
    filteredTodos
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodoContext() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodoContext must be used within a TodoContextProvider');
  }
  return context;
}
