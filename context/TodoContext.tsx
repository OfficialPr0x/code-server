import React, { useState, useMemo } from 'react';

interface FilterState {
  status: 'all' | 'completed' | 'active';
  priority: 'all' | 'high' | 'medium' | 'low';
  sort: 'newest' | 'oldest' | 'priority';
}

interface TodoContextType {
  // ... existing functions ...
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  filteredTodos: Todo[];
}

// In TodoContextProvider component
const [filter, setFilter] = useState<FilterState>({
  status: 'all',
  priority: 'all',
  sort: 'newest'
});

const filteredTodos = useMemo(() => {
  return todos.filter(todo => {
    const matchesStatus = filter.status === 'all' || 
      (filter.status === 'completed' && todo.completed) ||
      (filter.status === 'active' && !todo.completed);
    
    const matchesPriority = filter.priority === 'all' || 
      todo.priority === filter.priority;
    
    return matchesStatus && matchesPriority;
  }).sort((a, b) => {
    if (filter.sort === 'newest') return b.createdAt.getTime() - a.createdAt.getTime();
    if (filter.sort === 'oldest') return a.createdAt.getTime() - b.createdAt.getTime();
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority || 'low'] - priorityOrder[a.priority || 'low'];
  });
}, [todos, filter]);

// Add filter and filteredTodos to context value 