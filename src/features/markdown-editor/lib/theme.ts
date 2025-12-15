/**
 * CodeMirror Theme Configuration
 *
 * Creates a theme that matches the application's design system.
 * Supports both light and dark modes via CSS variables.
 */

import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

/**
 * Base editor theme using CSS variables for light/dark mode support
 */
export const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    color: 'hsl(var(--foreground))',
    fontSize: '16px',
    lineHeight: '1.6'
  },
  '.cm-content': {
    caretColor: 'hsl(var(--foreground))',
    fontFamily: 'inherit',
    padding: '0'
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'hsl(var(--foreground))'
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: 'hsl(var(--primary))'
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: 'hsl(var(--primary) / 0.2) !important'
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'hsl(var(--primary) / 0.3) !important'
  },
  '.cm-activeLine': {
    backgroundColor: 'hsl(var(--muted) / 0.3)'
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: 'hsl(var(--muted-foreground))',
    border: 'none'
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'hsl(var(--muted) / 0.3)'
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 8px 0 4px'
  },
  '.cm-scroller': {
    overflow: 'auto'
  },
  '.cm-line': {
    padding: '0'
  },
  // Placeholder styling
  '.cm-placeholder': {
    color: 'hsl(var(--muted-foreground) / 0.5)',
    fontStyle: 'italic'
  },
  // Search match highlighting
  '.cm-searchMatch': {
    backgroundColor: 'hsl(var(--primary) / 0.2)',
    outline: '1px solid hsl(var(--primary) / 0.4)'
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'hsl(var(--primary) / 0.4)'
  },
  // Fold gutter
  '.cm-foldGutter': {
    width: '14px'
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'hsl(var(--muted))',
    border: 'none',
    padding: '0 4px',
    borderRadius: '2px',
    margin: '0 4px',
    color: 'hsl(var(--muted-foreground))'
  }
})

/**
 * Syntax highlighting for Markdown
 */
export const markdownHighlighting = HighlightStyle.define([
  // Headings
  { tag: tags.heading1, fontWeight: '700', fontSize: '1.75em', color: 'hsl(var(--foreground))' },
  { tag: tags.heading2, fontWeight: '600', fontSize: '1.5em', color: 'hsl(var(--foreground))' },
  { tag: tags.heading3, fontWeight: '600', fontSize: '1.25em', color: 'hsl(var(--foreground))' },
  { tag: tags.heading4, fontWeight: '600', fontSize: '1.1em', color: 'hsl(var(--foreground))' },
  { tag: tags.heading5, fontWeight: '600', color: 'hsl(var(--foreground))' },
  { tag: tags.heading6, fontWeight: '600', color: 'hsl(var(--muted-foreground))' },

  // Emphasis
  { tag: tags.strong, fontWeight: '600' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through', color: 'hsl(var(--muted-foreground))' },

  // Code
  { tag: tags.monospace, fontFamily: 'var(--font-mono, monospace)', backgroundColor: 'hsl(var(--muted))', padding: '1px 4px', borderRadius: '3px' },

  // Links
  { tag: tags.link, color: 'hsl(var(--primary))', textDecoration: 'underline' },
  { tag: tags.url, color: 'hsl(var(--primary))', textDecoration: 'underline' },

  // Quotes
  { tag: tags.quote, color: 'hsl(var(--muted-foreground))', fontStyle: 'italic', borderLeft: '3px solid hsl(var(--border))' },

  // Lists
  { tag: tags.list, color: 'hsl(var(--foreground))' },

  // Meta (markdown syntax characters like #, *, -, etc.)
  { tag: tags.meta, color: 'hsl(var(--muted-foreground))' },
  { tag: tags.processingInstruction, color: 'hsl(var(--muted-foreground))' },

  // Comments
  { tag: tags.comment, color: 'hsl(var(--muted-foreground))', fontStyle: 'italic' },

  // Keywords (for code blocks)
  { tag: tags.keyword, color: 'hsl(280 70% 60%)' },
  { tag: tags.string, color: 'hsl(120 60% 45%)' },
  { tag: tags.number, color: 'hsl(30 80% 55%)' },
  { tag: tags.bool, color: 'hsl(200 80% 55%)' },
  { tag: tags.null, color: 'hsl(200 80% 55%)' },
  { tag: tags.operator, color: 'hsl(var(--foreground))' },
  { tag: tags.function(tags.variableName), color: 'hsl(210 80% 60%)' },
  { tag: tags.typeName, color: 'hsl(35 80% 55%)' },
  { tag: tags.className, color: 'hsl(35 80% 55%)' },
  { tag: tags.propertyName, color: 'hsl(210 80% 60%)' },
  { tag: tags.attributeName, color: 'hsl(35 80% 55%)' },
  { tag: tags.attributeValue, color: 'hsl(120 60% 45%)' },

  // Invalid
  { tag: tags.invalid, color: 'hsl(0 70% 55%)' }
])

/**
 * Combined theme extension for the editor
 */
export const theme = [
  editorTheme,
  syntaxHighlighting(markdownHighlighting)
]
