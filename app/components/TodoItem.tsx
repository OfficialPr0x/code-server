import React, { useContext } from 'react';
import { useTodoContext } from '../contexts/TodoContext';
import { Todo } from '../types/Todo';

interface TodoItemProps {
  todo: Todo;
}

function TodoItem({ todo }: TodoItemProps) {
  const { toggleTodo, deleteTodo } = useTodoContext();
  
  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${todo.priority || 'low'}`}>
      <div className="todo-info">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => toggleTodo(todo.id)}
        />
        <div className="todo-text">
          <span>{todo.text}</span>
          <div className="todo-meta">
            <span className="priority">{todo.priority}</span>
            <span className="date">
              {new Date(todo.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="todo-actions">
        <button onClick={() => deleteTodo(todo.id)} className="delete-btn">
          🗑️
        </button>
      </div>
    </div>
  );
}

export default TodoItem; 