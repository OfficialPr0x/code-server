// Todo Model
class Todo {
  constructor(id, text, completed = false, priority = 'low') {
    this.id = id;
    this.text = text;
    this.completed = completed;
    this.createdAt = new Date();
    this.priority = priority;
  }
}

// Todo App
class TodoApp {
  constructor() {
    this.todos = [
      new Todo('1', 'Learn React', true, 'high'),
      new Todo('2', 'Build a Todo App', false, 'medium'),
      new Todo('3', 'Deploy to production', false, 'low')
    ];
    
    this.filter = {
      status: 'all',
      priority: 'all',
      sort: 'newest'
    };
    
    this.init();
  }
  
  init() {
    // DOM elements
    this.todoForm = document.getElementById('todo-form');
    this.todoInput = document.getElementById('todo-input');
    this.prioritySelect = document.getElementById('priority-select');
    this.statusFilter = document.getElementById('status-filter');
    this.priorityFilter = document.getElementById('priority-filter');
    this.sortFilter = document.getElementById('sort-filter');
    this.todoList = document.getElementById('todo-list');
    
    // Event listeners
    this.todoForm.addEventListener('submit', this.handleSubmit.bind(this));
    this.statusFilter.addEventListener('change', this.handleFilterChange.bind(this));
    this.priorityFilter.addEventListener('change', this.handleFilterChange.bind(this));
    this.sortFilter.addEventListener('change', this.handleFilterChange.bind(this));
    
    // Initial render
    this.render();
  }
  
  handleSubmit(e) {
    e.preventDefault();
    const text = this.todoInput.value.trim();
    const priority = this.prioritySelect.value;
    
    if (text) {
      this.addTodo(text, priority);
      this.todoInput.value = '';
      this.prioritySelect.value = 'low';
    }
  }
  
  handleFilterChange() {
    this.filter = {
      status: this.statusFilter.value,
      priority: this.priorityFilter.value,
      sort: this.sortFilter.value
    };
    
    this.render();
  }
  
  addTodo(text, priority) {
    const id = Date.now().toString();
    const todo = new Todo(id, text, false, priority);
    this.todos.push(todo);
    this.render();
  }
  
  toggleTodo(id) {
    this.todos = this.todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    this.render();
  }
  
  deleteTodo(id) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.render();
  }
  
  getFilteredTodos() {
    return this.todos
      .filter(todo => {
        const matchesStatus = 
          this.filter.status === 'all' || 
          (this.filter.status === 'completed' && todo.completed) ||
          (this.filter.status === 'active' && !todo.completed);
        
        const matchesPriority = 
          this.filter.priority === 'all' || 
          todo.priority === this.filter.priority;
        
        return matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (this.filter.sort === 'newest') return b.createdAt - a.createdAt;
        if (this.filter.sort === 'oldest') return a.createdAt - b.createdAt;
        
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }
  
  render() {
    const filteredTodos = this.getFilteredTodos();
    
    // Clear the list
    this.todoList.innerHTML = '';
    
    if (filteredTodos.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.textContent = 'No todos found';
      this.todoList.appendChild(emptyState);
      return;
    }
    
    // Render todos
    filteredTodos.forEach(todo => {
      const todoItem = document.createElement('div');
      todoItem.className = `todo-item ${todo.priority} ${todo.completed ? 'completed' : ''}`;
      
      todoItem.innerHTML = `
        <div class="todo-info">
          <input type="checkbox" ${todo.completed ? 'checked' : ''}>
          <div class="todo-text">
            <span>${todo.text}</span>
            <div class="todo-meta">
              <span class="priority ${todo.priority}">${todo.priority}</span>
              <span class="date">${new Date(todo.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div class="todo-actions">
          <button class="delete-btn">🗑️</button>
        </div>
      `;
      
      // Add event listeners
      const checkbox = todoItem.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
      
      const deleteBtn = todoItem.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
      
      this.todoList.appendChild(todoItem);
    });
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TodoApp();
});
