// Minimal Monaco Editor main file
console.log('Monaco Editor loaded');

// Define global monaco object if it doesn't exist
if (typeof window !== 'undefined' && !window.monaco) {
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
          setValue: function() {
            console.log('Monaco editor setValue called');
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
      setModelLanguage: function() {
        console.log('Monaco editor setModelLanguage called');
      }
    }
  };
}
