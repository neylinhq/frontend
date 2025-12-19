/**
 * CodeMirror Theme
 *
 * Minimal theme that inherits from parent container.
 * Typography comes from .prose class.
 */

import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import type { Extension } from '@codemirror/state'

/**
 * Base editor theme
 */
const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    color: 'inherit',
    fontSize: 'inherit'
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
  '.cm-selectionBackground': {
    backgroundColor: 'oklch(var(--muted-foreground) / 0.2)'
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'oklch(var(--muted-foreground) / 0.3)'
  },
  '.cm-scroller': {
    fontFamily: 'inherit',
    overflow: 'visible'
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
  '.cm-gutters': {
    display: 'none'
  }
})

/**
 * Syntax highlighting for code blocks
 */
const syntaxStyle = HighlightStyle.define([
  // Code syntax
  { tag: tags.comment, color: '#6b7280', fontStyle: 'italic' },
  { tag: tags.keyword, color: '#c084fc' },
  { tag: tags.string, color: '#4ade80' },
  { tag: tags.number, color: '#fb923c' },
  { tag: tags.bool, color: '#fb923c' },
  { tag: tags.null, color: '#fb923c' },
  { tag: tags.function(tags.variableName), color: '#60a5fa' },
  { tag: tags.typeName, color: '#fbbf24' },
  { tag: tags.className, color: '#fbbf24' },
  { tag: tags.propertyName, color: '#60a5fa' },
  { tag: tags.variableName, color: '#f472b6' },
  { tag: tags.operator, color: '#94a3b8' },
  { tag: tags.punctuation, color: '#94a3b8' },
  { tag: tags.tagName, color: '#f87171' },
  { tag: tags.attributeName, color: '#fbbf24' },
  { tag: tags.attributeValue, color: '#4ade80' }
])

/**
 * Combined theme
 */
export const theme: Extension[] = [
  editorTheme,
  syntaxHighlighting(syntaxStyle)
]
