// Minimal Monaco Editor main file
console.log('Monaco Editor loaded');

// Define global monaco object if it doesn't exist
if (typeof window !== 'undefined') {
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
}
