/**
 * AI War Room Integration Entry Point
 * This file loads all AI War Room components
 */

// Check if BoxIcons are loaded, if not, load them
if (!document.querySelector('link[href*="boxicons"]')) {
  const linkElement = document.createElement('link');
  linkElement.rel = 'stylesheet';
  linkElement.href = 'https://cdn.jsdelivr.net/npm/boxicons@2.1.4/css/boxicons.min.css';
  document.head.appendChild(linkElement);
}

// Check if Inter font is loaded, if not, load it
if (!document.querySelector('link[href*="Inter"]')) {
  const fontElement = document.createElement('link');
  fontElement.rel = 'stylesheet';
  fontElement.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  document.head.appendChild(fontElement);
}

// Check if JetBrains Mono font is loaded, if not, load it
if (!document.querySelector('link[href*="JetBrains+Mono"]')) {
  const monoFontElement = document.createElement('link');
  monoFontElement.rel = 'stylesheet';
  monoFontElement.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap';
  document.head.appendChild(monoFontElement);
}

// Load our AI theme CSS
import './ai-warroom.css';

// Load our AI agent system
import './ai-agent-system.js';

// Load development helpers (only active in dev mode)
import './dev-helper.js';

console.log('AI War Room components loaded');

// Add theme class to document body and workbench
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('ai-theme');
  document.querySelector('.monaco-workbench')?.classList.add('ai-theme');
}); 