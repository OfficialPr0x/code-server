import React, { useState } from 'react';
import { TodoContextProvider } from '../context/TodoContext';
import TodoFilter from './components/TodoFilter';
import TodoItem from './components/TodoItem';
import { useTodoContext } from '../context/TodoContext';

function TodoList() {
  const { filteredTodos, addTodo } = useTodoContext();
  const [newTodoText, setNewTodoText] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      addTodo(newTodoText, priority);
      setNewTodoText('');
      setPriority('low');
    }
  };

  return (
    <div className="todo-app">
      <h1>Todo App</h1>
      
      <form onSubmit={handleSubmit} className="todo-form">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a new todo..."
          className="todo-input"
        />
        <select 
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="priority-select"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" className="add-btn">Add</button>
      </form>
      
      <TodoFilter />
      
      <div className="todo-list">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">No todos found</div>
        ) : (
          filteredTodos.map(todo => (
            <TodoItem key={todo.id} todo={todo} />
          ))
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <TodoContextProvider>
      <TodoList />
    </TodoContextProvider>
  );
}
