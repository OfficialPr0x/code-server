// Monaco Editor Fix
console.log('Monaco Editor Fix loaded');

// Define global monaco object if it doesn't exist
window.monaco = {
  editor: {
    create: function(element, options) {
      console.log('Monaco editor create called with options:', options);
      return {
        onDidChangeModelContent: function(callback) {
          console.log('Monaco editor onDidChangeModelContent called');
          if (callback) callback();
          return { dispose: function() {} };
        },
        getValue: function() {
          return options && options.value || '';
        },
        setValue: function(value) {
          console.log('Monaco editor setValue called with:', value);
          if (options) options.value = value;
        },
        getModel: function() {
          return {
            getLanguageId: function() {
              return options && options.language || 'javascript';
            }
          };
        },
        dispose: function() {
          console.log('Monaco editor dispose called');
        }
      };
    },
    setModelLanguage: function(model, language) {
      console.log('Monaco editor setModelLanguage called with language:', language);
    },
    getModel: function() {
      return {
        getLanguageId: function() {
          return 'javascript';
        }
      };
    },
    getModels: function() {
      return [];
    },
    createModel: function(content, language) {
      console.log('Monaco editor createModel called with language:', language);
      return {
        getLanguageId: function() {
          return language || 'javascript';
        },
        getValue: function() {
          return content || '';
        }
      };
    }
  },
  languages: {
    register: function() {},
    setMonarchTokensProvider: function() {},
    registerCompletionItemProvider: function() {
      return { dispose: function() {} };
    }
  }
};

// Initialize the editor when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing Monaco editor');
  
  // Create the editor instance if the element exists
  const editorElement = document.getElementById('monaco-editor');
  if (editorElement) {
    console.log('Found monaco-editor element, creating editor');
    window.editor = window.monaco.editor.create(editorElement, {
      value: '',
      language: 'javascript',
      theme: 'vs-dark'
    });
  } else {
    console.warn('Monaco editor element not found');
  }
  
  // Create the lab editor if it exists
  const labEditorElement = document.getElementById('lab-editor');
  if (labEditorElement) {
    console.log('Found lab-editor element, creating editor');
    window.labEditor = window.monaco.editor.create(labEditorElement, {
      value: '',
      language: 'json',
      theme: 'vs-dark'
    });
  }
  
  // Initialize the VirtualFileSystem if it doesn't exist
  if (!window.VirtualFileSystem) {
    window.VirtualFileSystem = {
      files: {
        'index.js': `// Welcome to AI War Room IDE
// Start coding with AI assistance

function calculateFibonacci(n) {
  if (n <= 1) return n;
  
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  
  return b;
}

// Example usage
console.log("Fibonacci(10) =", calculateFibonacci(10));
`,
        'package.json': `{
  "name": "ai-warroom-project",
  "version": "1.0.0",
  "description": "AI War Room Project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.0.3"
  },
  "author": "",
  "license": "MIT"
}`,
        'README.md': `# AI War Room Project

A powerful development environment with AI assistance.

## Features

- Integrated AI support
- Real-time collaboration
- Advanced code completion

## Getting Started

1. Clone this repository
2. Run \`npm install\`
3. Run \`npm start\`
`,
        '.env': `PORT=3000
NODE_ENV=development
API_KEY=your-api-key-here
`
      },
      getFile: function(filename) {
        console.log('VirtualFileSystem.getFile called with:', filename);
        return this.files[filename] || null;
      },
      saveFile: function(filename, content) {
        console.log('VirtualFileSystem.saveFile called with:', filename);
        this.files[filename] = content;
        return true;
      },
      getAllFiles: function() {
        return Object.keys(this.files);
      }
    };
    console.log('VirtualFileSystem initialized');
  }
  
  // Fix the openFile function
  window.openFile = function(file) {
    console.log('Opening file:', file);
    
    // Update active tab
    document.querySelectorAll('.ai-ide-editor-tab').forEach(tab => {
      if (tab.dataset.file === file) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    // Update file tree selection
    document.querySelectorAll('.file-tree-item').forEach(item => {
      const fileSpan = item.querySelector('span');
      if (fileSpan && fileSpan.textContent === file) {
        const content = item.querySelector('.file-tree-item-content');
        if (content) {
          content.style.backgroundColor = 'var(--ai-selection)';
        }
      } else {
        const content = item.querySelector('.file-tree-item-content');
        if (content) {
          content.style.backgroundColor = '';
        }
      }
    });
    
    // Load file content
    if (window.VirtualFileSystem) {
      const fileContent = window.VirtualFileSystem.getFile(file);
      if (fileContent) {
        const language = getLanguageForFile(file);
        
        // Make sure editor exists
        if (!window.editor && document.getElementById('monaco-editor')) {
          window.editor = window.monaco.editor.create(document.getElementById('monaco-editor'), {
            value: '',
            language: language,
            theme: 'vs-dark'
          });
        }
        
        // Set content
        if (window.editor) {
          window.editor.setValue(fileContent);
          console.log('File content set successfully');
        }
      }
    }
  };
  
  // Helper function to get language for file
  function getLanguageForFile(file) {
    const ext = file.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'json': 'json',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'env': 'plaintext'
    };
    return languageMap[ext] || 'plaintext';
  }
  
  // Initialize the editor with the default file
  if (window.editor) {
    const defaultFile = 'index.js';
    const defaultContent = window.VirtualFileSystem.getFile(defaultFile);
    if (defaultContent) {
      window.editor.setValue(defaultContent);
      console.log('Default file loaded:', defaultFile);
    }
  }
});
