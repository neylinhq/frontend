/**
 * CodeMirror Theme Configuration
 *
 * Clean, minimal theme that inherits from the application.
 * Reads colors from CSS variables and recreates on theme/palette change.
 */

import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { cssVarToHex } from '@/features/graph-webgl/lib/theme-bridge'

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
 * Create syntax highlighting for Markdown with theme-aware colors
 * Call this when theme/palette changes to recreate with updated colors
 */
export const createMarkdownHighlighting = () => HighlightStyle.define([
  // Headings
  { tag: tags.heading1, fontWeight: '700', fontSize: '1.75em' },
  { tag: tags.heading2, fontWeight: '600', fontSize: '1.5em' },
  { tag: tags.heading3, fontWeight: '600', fontSize: '1.25em' },
  { tag: tags.heading4, fontWeight: '600', fontSize: '1.1em' },
  { tag: tags.heading5, fontWeight: '600' },
  { tag: tags.heading6, fontWeight: '600', color: cssVarToHex('syntax-comment') },

  // Emphasis
  { tag: tags.strong, fontWeight: '600' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through', color: cssVarToHex('syntax-comment') },

  // Code
  { tag: tags.monospace, fontFamily: 'ui-monospace, monospace', backgroundColor: 'rgba(128, 128, 128, 0.1)', padding: '1px 4px', borderRadius: '3px' },

  // Links
  { tag: tags.link, color: cssVarToHex('brand'), textDecoration: 'underline' },
  { tag: tags.url, color: cssVarToHex('brand'), textDecoration: 'underline' },

  // Quotes
  { tag: tags.quote, color: cssVarToHex('muted-foreground'), fontStyle: 'italic' },

  // Meta (markdown syntax characters like #, *, -, etc.)
  { tag: tags.meta, color: cssVarToHex('syntax-punctuation') },
  { tag: tags.processingInstruction, color: cssVarToHex('syntax-punctuation') },

  // Comments
  { tag: tags.comment, color: cssVarToHex('syntax-comment'), fontStyle: 'italic' },

  // Keywords (for code blocks)
  { tag: tags.keyword, color: cssVarToHex('syntax-keyword') },
  { tag: tags.string, color: cssVarToHex('syntax-string') },
  { tag: tags.number, color: cssVarToHex('syntax-number') },
  { tag: tags.bool, color: cssVarToHex('syntax-variable') },
  { tag: tags.null, color: cssVarToHex('syntax-variable') },
  { tag: tags.function(tags.variableName), color: cssVarToHex('syntax-function') },
  { tag: tags.typeName, color: cssVarToHex('syntax-type') },
  { tag: tags.className, color: cssVarToHex('syntax-type') },
  { tag: tags.propertyName, color: cssVarToHex('syntax-property') },
  { tag: tags.attributeName, color: cssVarToHex('syntax-type') },
  { tag: tags.attributeValue, color: cssVarToHex('syntax-string') },

  // Invalid
  { tag: tags.invalid, color: cssVarToHex('destructive') }
])

/**
 * Create combined theme extension with current CSS colors
 * Call this to recreate theme when palette/mode changes
 */
export const createTheme = () => [
  editorTheme,
  syntaxHighlighting(createMarkdownHighlighting())
]

/**
 * Combined theme extension for the editor
 * Uses base theme only - syntax highlighting is applied via createTheme() at runtime
 * This avoids SSR issues with CSS variable resolution
 */
export const theme = [editorTheme]
