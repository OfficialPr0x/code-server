/**
 * Deployment script for Todo App
 * 
 * This script builds the Todo app and prepares it for deployment
 * to a production server.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  buildDir: path.join(__dirname, 'dist-todo'),
  deployDir: path.join(__dirname, 'deploy'),
  serverFile: path.join(__dirname, 'server.js'),
  packageJsonTemplate: {
    "name": "todo-app",
    "version": "1.0.0",
    "description": "Production-ready Todo application",
    "main": "server.js",
    "scripts": {
      "start": "node server.js"
    },
    "dependencies": {
      "express": "^4.21.2"
    },
    "engines": {
      "node": ">=14.0.0"
    }
  }
};

// Create deploy directory
console.log('Creating deployment directory...');
if (fs.existsSync(config.deployDir)) {
  fs.rmSync(config.deployDir, { recursive: true, force: true });
}
fs.mkdirSync(config.deployDir, { recursive: true });

// Build the app
console.log('Building the app...');
try {
  execSync('node build-todo-app.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error building the app:', error);
  process.exit(1);
}

// Copy build files to deploy directory
console.log('Copying build files to deployment directory...');
fs.mkdirSync(path.join(config.deployDir, 'public'), { recursive: true });

// Copy HTML, JS, and CSS files
fs.copyFileSync(
  path.join(config.buildDir, 'index.html'),
  path.join(config.deployDir, 'public', 'index.html')
);
fs.copyFileSync(
  path.join(config.buildDir, 'todo-app.js'),
  path.join(config.deployDir, 'public', 'todo-app.js')
);
fs.copyFileSync(
  path.join(config.buildDir, 'styles.css'),
  path.join(config.deployDir, 'public', 'styles.css')
);

// Create production server.js
console.log('Creating production server file...');
const serverContent = `const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;

fs.writeFileSync(path.join(config.deployDir, 'server.js'), serverContent);

// Create package.json for deployment
console.log('Creating package.json for deployment...');
fs.writeFileSync(
  path.join(config.deployDir, 'package.json'),
  JSON.stringify(config.packageJsonTemplate, null, 2)
);

// Create .gitignore
fs.writeFileSync(
  path.join(config.deployDir, '.gitignore'),
  'node_modules\n.env\n.DS_Store\n'
);

// Create README.md
fs.copyFileSync(
  path.join(__dirname, 'README-TODO-APP.md'),
  path.join(config.deployDir, 'README.md')
);

console.log('\nDeployment package created successfully!');
console.log(`Files are in the '${config.deployDir}' directory.`);
console.log('\nTo deploy to a server:');
console.log('1. Copy the contents of the deploy directory to your server');
console.log('2. Run "npm install" to install dependencies');
console.log('3. Run "npm start" to start the server');
console.log('\nFor cloud platforms like Heroku, Vercel, or Netlify:');
console.log('- Push the deploy directory to your Git repository');
console.log('- Connect your repository to the cloud platform');
console.log('- The platform will automatically detect and deploy your app');
