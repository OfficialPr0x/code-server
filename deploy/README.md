# Todo App - Production Ready

A simple, production-ready Todo application built with vanilla JavaScript.

## Features

- Add, edit, and delete tasks
- Mark tasks as completed
- Filter tasks by status (All, Active, Completed)
- Filter tasks by priority (All, High, Medium, Low)
- Sort tasks by different criteria (Newest, Oldest, Priority)
- Responsive design

## Project Structure

```
dist-todo/              # Production build directory
├── index.html          # Main HTML file
├── todo-app.js         # Application logic
└── styles.css          # Styling

app/                    # Development directory
├── todo.html           # Main HTML file (development)
├── todo-app.js         # Application logic (development)
└── components/         # UI components (if using React)

styles/                 # Styling
└── globals.css         # Global styles
```

## Building the App

To build the app for production, run:

```bash
node build-todo-app.js
```

This will create a `dist-todo` directory with the production-ready files.

## Running the App

### Development Mode

To run the app in development mode, you can simply open the `app/todo.html` file in your browser.

### Production Mode

To run the app in production mode, start the server:

```bash
node server.js
```

Then open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Express.js (for production server)

## Implementation Details

The Todo app is implemented using vanilla JavaScript with a class-based approach:

- `Todo` class: Represents a single todo item with properties like id, text, completed status, priority, etc.
- `TodoApp` class: Manages the application state and provides methods for adding, toggling, and deleting todos, as well as filtering and sorting.

The app uses local storage to persist todos between sessions, ensuring that your tasks are saved even if you close the browser.

## Future Improvements

- Add user authentication
- Implement backend storage with a database
- Add due dates for tasks
- Add categories/tags for better organization
- Implement drag-and-drop for reordering tasks
