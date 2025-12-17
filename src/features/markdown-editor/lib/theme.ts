/**
 * CodeMirror Theme Configuration
 *
 * Clean, minimal theme that inherits from the application.
 */

import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

/**
 * Base editor theme - minimal, clean
 */
export const editorTheme = EditorView.theme({
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
    backgroundColor: 'rgba(100, 100, 100, 0.2) !important'
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(100, 100, 100, 0.3) !important'
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'inherit'
  },
  '.cm-line': {
    padding: '0'
  },
  '.cm-placeholder': {
    color: 'rgba(128, 128, 128, 0.6)',
    fontStyle: 'italic'
  },
  '&.cm-focused': {
    outline: 'none'
  }
})

/**
 * Syntax highlighting for Markdown - minimal colors
 */
export const markdownHighlighting = HighlightStyle.define([
  // Headings
  { tag: tags.heading1, fontWeight: '700', fontSize: '1.75em' },
  { tag: tags.heading2, fontWeight: '600', fontSize: '1.5em' },
  { tag: tags.heading3, fontWeight: '600', fontSize: '1.25em' },
  { tag: tags.heading4, fontWeight: '600', fontSize: '1.1em' },
  { tag: tags.heading5, fontWeight: '600' },
  { tag: tags.heading6, fontWeight: '600', color: '#888' },

  // Emphasis
  { tag: tags.strong, fontWeight: '600' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through', color: '#888' },

  // Code
  { tag: tags.monospace, fontFamily: 'ui-monospace, monospace', backgroundColor: 'rgba(128, 128, 128, 0.1)', padding: '1px 4px', borderRadius: '3px' },

  // Links
  { tag: tags.link, color: '#0066cc', textDecoration: 'underline' },
  { tag: tags.url, color: '#0066cc', textDecoration: 'underline' },

  // Quotes
  { tag: tags.quote, color: '#666', fontStyle: 'italic' },

  // Meta (markdown syntax characters like #, *, -, etc.)
  { tag: tags.meta, color: '#999' },
  { tag: tags.processingInstruction, color: '#999' },

  // Comments
  { tag: tags.comment, color: '#888', fontStyle: 'italic' },

  // Keywords (for code blocks)
  { tag: tags.keyword, color: '#9333ea' },
  { tag: tags.string, color: '#16a34a' },
  { tag: tags.number, color: '#ea580c' },
  { tag: tags.bool, color: '#0891b2' },
  { tag: tags.null, color: '#0891b2' },
  { tag: tags.function(tags.variableName), color: '#2563eb' },
  { tag: tags.typeName, color: '#ca8a04' },
  { tag: tags.className, color: '#ca8a04' },
  { tag: tags.propertyName, color: '#2563eb' },
  { tag: tags.attributeName, color: '#ca8a04' },
  { tag: tags.attributeValue, color: '#16a34a' },

  // Invalid
  { tag: tags.invalid, color: '#dc2626' }
])

/**
 * Combined theme extension for the editor
 */
export const theme = [
  editorTheme,
  syntaxHighlighting(markdownHighlighting)
]
