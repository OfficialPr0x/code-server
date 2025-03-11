const fs = require('fs');
const path = require('path');

// Create dist-todo directory if it doesn't exist
const distDir = path.join(__dirname, 'dist-todo');
if (fs.existsSync(distDir)) {
  // Clean the directory if it exists
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy HTML file
const htmlContent = fs.readFileSync(path.join(__dirname, 'app', 'todo.html'), 'utf8');
fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);

// Copy JavaScript file
const jsContent = fs.readFileSync(path.join(__dirname, 'app', 'todo-app.js'), 'utf8');
fs.writeFileSync(path.join(distDir, 'todo-app.js'), jsContent);

// Copy CSS file
const cssContent = fs.readFileSync(path.join(__dirname, 'styles', 'globals.css'), 'utf8');
fs.writeFileSync(path.join(distDir, 'styles.css'), cssContent);

// Update file references in HTML
let updatedHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
updatedHtml = updatedHtml.replace('../styles/globals.css', 'styles.css');
updatedHtml = updatedHtml.replace('todo-app.js', 'todo-app.js');
fs.writeFileSync(path.join(distDir, 'index.html'), updatedHtml);

console.log('Todo app built successfully! Files are in the dist-todo directory.');
