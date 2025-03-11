// Minimal Monaco Editor loader
console.log('Monaco Editor loader initialized');

// Define require function if it doesn't exist
if (typeof window !== 'undefined' && !window.require) {
  window.require = function(dependencies, callback) {
    console.log('Requiring dependencies:', dependencies);
    if (callback) {
      setTimeout(function() {
        callback();
      }, 0);
    }
  };
}
