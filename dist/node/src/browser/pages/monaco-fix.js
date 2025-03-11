// Monaco Editor Fix
console.log('Monaco Editor Fix loaded');

// Define global monaco object if it doesn't exist
window.monaco = {
  editor: {
    create: function() {
      console.log('Monaco editor create called');
      return {
        onDidChangeModelContent: function(callback) {
          console.log('Monaco editor onDidChangeModelContent called');
          if (callback) callback();
          return { dispose: function() {} };
        },
        getValue: function() {
          return '';
        },
        setValue: function(value) {
          console.log('Monaco editor setValue called with:', value);
        },
        getModel: function() {
          return {
            getLanguageId: function() {
              return 'javascript';
            }
          };
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

// Add a script tag to load this fix before the main page loads
document.addEventListener('DOMContentLoaded', function() {
  // Fix the openFile function
  window.openFile = function(file) {
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
        item.querySelector('.file-tree-item-content').style.backgroundColor = 'var(--ai-selection)';
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
      if (fileContent && window.editor) {
        const language = getLanguageForFile(file);
        if (window.monaco && window.monaco.editor) {
          try {
            const model = window.editor.getModel();
            if (model) {
              window.monaco.editor.setModelLanguage(model, language);
            }
            window.editor.setValue(fileContent);
          } catch (e) {
            console.error('Error setting editor content:', e);
          }
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
});
