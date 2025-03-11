// Configure Babel to handle TypeScript and JSX
window.Babel.registerPreset('tsx', {
  presets: [
    [window.Babel.availablePresets['typescript'], { 
      isTSX: true, 
      allExtensions: true 
    }],
    [window.Babel.availablePresets['react']]
  ]
});

// Set the default preset for all scripts
window.Babel.transformScriptTags({
  preset: 'tsx'
});
