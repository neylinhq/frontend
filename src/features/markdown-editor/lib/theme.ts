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
  { tag: tags.comment, color: 'oklch(var(--syntax-comment))', fontStyle: 'italic' },
  { tag: tags.keyword, color: 'oklch(var(--syntax-keyword))' },
  { tag: tags.string, color: 'oklch(var(--syntax-string))' },
  { tag: tags.number, color: 'oklch(var(--syntax-number))' },
  { tag: tags.bool, color: 'oklch(var(--syntax-number))' },
  { tag: tags.null, color: 'oklch(var(--syntax-number))' },
  { tag: tags.function(tags.variableName), color: 'oklch(var(--syntax-function))' },
  { tag: tags.typeName, color: 'oklch(var(--syntax-type))' },
  { tag: tags.className, color: 'oklch(var(--syntax-type))' },
  { tag: tags.propertyName, color: 'oklch(var(--syntax-property))' },
  { tag: tags.variableName, color: 'oklch(var(--syntax-variable))' },
  { tag: tags.operator, color: 'oklch(var(--syntax-operator))' },
  { tag: tags.punctuation, color: 'oklch(var(--syntax-punctuation))' },
  { tag: tags.tagName, color: 'oklch(var(--syntax-keyword))' },
  { tag: tags.attributeName, color: 'oklch(var(--syntax-property))' },
  { tag: tags.attributeValue, color: 'oklch(var(--syntax-string))' }
])

/**
 * Combined theme
 */
export const theme: Extension[] = [
  editorTheme,
  syntaxHighlighting(syntaxStyle)
]
