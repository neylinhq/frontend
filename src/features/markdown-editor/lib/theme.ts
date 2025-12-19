/**
 * CodeMirror Theme Configuration
 *
 * Clean, minimal theme following Design Manifesto:
 * - "Interface disappears, content shines"
 * - Uses OKLCH colors via CSS variables
 * - Proper syntax highlighting for code blocks
 */

import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import type { Extension } from '@codemirror/state'

/**
 * Base editor theme - minimal, clean
 * Uses OKLCH colors via CSS variables for theme consistency
 */
const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    color: 'inherit',
    fontSize: 'inherit',
    lineHeight: '1.6'
  },
  '.cm-content': {
    caretColor: 'currentColor',
    fontFamily: 'inherit',
    padding: '0'
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'currentColor',
    borderLeftWidth: '2px'
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: 'oklch(var(--muted-foreground) / 0.2) !important'
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'oklch(var(--muted-foreground) / 0.3) !important'
  },
  '.cm-scroller': {
    fontFamily: 'inherit',
    overflow: 'visible !important'
  },
  '.cm-line': {
    padding: '0'
  },
  '.cm-placeholder': {
    color: 'oklch(var(--muted-foreground) / 0.6)',
    fontStyle: 'italic'
  },
  '&.cm-focused': {
    outline: 'none'
  },
  // Remove default gutters to prevent scroll issues
  '.cm-gutters': {
    display: 'none'
  }
})

/**
 * Syntax highlighting styles
 * Synced with .prose from globals.css
 */
const syntaxHighlightStyle = HighlightStyle.define([
  // Headings (synced with .prose)
  { tag: tags.heading1, fontWeight: '600', fontSize: '1.5em' },
  { tag: tags.heading2, fontWeight: '600', fontSize: '1.25em' },
  { tag: tags.heading3, fontWeight: '600', fontSize: '1.125em' },
  { tag: tags.heading4, fontWeight: '600', fontSize: '1em' },
  { tag: tags.heading5, fontWeight: '600' },
  { tag: tags.heading6, fontWeight: '600' },

  // Emphasis
  { tag: tags.strong, fontWeight: '600' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },

  // Code
  { tag: tags.monospace, fontFamily: 'var(--font-mono, "Söhne Mono", ui-monospace, monospace)' },

  // Links & URLs
  { tag: tags.link, textDecoration: 'underline' },
  { tag: tags.url, textDecoration: 'underline' },

  // Quotes
  { tag: tags.quote, fontStyle: 'italic' },

  // Meta & punctuation (markdown syntax)
  { tag: tags.meta, opacity: '0.6' },
  { tag: tags.processingInstruction, opacity: '0.6' },

  // === CODE BLOCK SYNTAX HIGHLIGHTING ===
  // Comments
  { tag: tags.comment, color: '#6b7280', fontStyle: 'italic' },
  { tag: tags.lineComment, color: '#6b7280', fontStyle: 'italic' },
  { tag: tags.blockComment, color: '#6b7280', fontStyle: 'italic' },

  // Keywords
  { tag: tags.keyword, color: '#c084fc' },
  { tag: tags.controlKeyword, color: '#c084fc' },
  { tag: tags.moduleKeyword, color: '#c084fc' },
  { tag: tags.operatorKeyword, color: '#c084fc' },

  // Strings
  { tag: tags.string, color: '#4ade80' },
  { tag: tags.special(tags.string), color: '#4ade80' },

  // Numbers
  { tag: tags.number, color: '#fb923c' },
  { tag: tags.integer, color: '#fb923c' },
  { tag: tags.float, color: '#fb923c' },

  // Boolean & null
  { tag: tags.bool, color: '#fb923c' },
  { tag: tags.null, color: '#fb923c' },

  // Functions
  { tag: tags.function(tags.variableName), color: '#60a5fa' },
  { tag: tags.function(tags.propertyName), color: '#60a5fa' },

  // Types & classes
  { tag: tags.typeName, color: '#fbbf24' },
  { tag: tags.className, color: '#fbbf24' },
  { tag: tags.namespace, color: '#fbbf24' },

  // Properties
  { tag: tags.propertyName, color: '#60a5fa' },
  { tag: tags.attributeName, color: '#fbbf24' },
  { tag: tags.attributeValue, color: '#4ade80' },

  // Variables
  { tag: tags.variableName, color: '#f472b6' },
  { tag: tags.definition(tags.variableName), color: '#f472b6' },
  { tag: tags.local(tags.variableName), color: '#f472b6' },
  { tag: tags.special(tags.variableName), color: '#f472b6' },

  // Operators & punctuation
  { tag: tags.operator, color: '#94a3b8' },
  { tag: tags.punctuation, color: '#94a3b8' },
  { tag: tags.bracket, color: '#94a3b8' },
  { tag: tags.separator, color: '#94a3b8' },

  // Tags (HTML/JSX)
  { tag: tags.tagName, color: '#f87171' },
  { tag: tags.angleBracket, color: '#94a3b8' },

  // Regex
  { tag: tags.regexp, color: '#fb923c' },

  // Invalid
  { tag: tags.invalid, color: '#ef4444', textDecoration: 'underline wavy' }
])

/**
 * Combined theme extension with syntax highlighting
 * Use this in extensions.ts
 */
export const theme: Extension[] = [
  editorTheme,
  syntaxHighlighting(syntaxHighlightStyle)
]

/**
 * Export individual parts for custom configurations
 */
export { editorTheme, syntaxHighlightStyle }
