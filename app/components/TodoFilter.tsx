import React, { useContext } from 'react';
import { useTodoContext } from '../contexts/TodoContext';

export default function TodoFilter() {
  const { filter, setFilter } = useTodoContext();
  
  return (
    <div className="todo-filter">
      <select 
        value={filter.status} 
        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
      >
        <option value="all">All</option>
        <option value="completed">Completed</option>
        <option value="active">Active</option>
      </select>
      
      <select
        value={filter.priority}
        onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
      >
        <option value="all">All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  );
} 