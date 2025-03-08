import * as monaco from 'monaco-editor'

export function initializeAIMonaco() {
  monaco.editor.defineTheme('ai-war-room-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'D4AF37' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'regexp', foreground: 'D16969' },
      { token: 'type', foreground: '9CDCFE' },
      { token: 'function', foreground: 'DCDCAA' },
      { token: 'variable', foreground: '9CDCFE' },
      { token: 'variable.predefined', foreground: '4FC1FF' },
    ],
    colors: {
      'editor.background': '#0A0B14',
      'editor.foreground': '#F8FAFC',
      'editorCursor.foreground': '#D4AF37',
      'editor.lineHighlightBackground': '#1E293B',
      'editorLineNumber.foreground': '#64748B',
      'editorLineNumber.activeForeground': '#D4AF37',
      'editor.selectionBackground': '#264F78',
      'editor.inactiveSelectionBackground': '#3A3D41',
      'editorIndentGuide.background': '#404040',
      'editorIndentGuide.activeBackground': '#707070',
    }
  })
} 