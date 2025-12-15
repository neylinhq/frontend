/**
 * Markdown Editor Types
 *
 * Types for the CodeMirror 6 based Obsidian-style Live Preview editor.
 */

import type { EditorView } from '@codemirror/view'

/**
 * Props for the MarkdownEditor component
 */
export interface MarkdownEditorProps {
  /** Initial markdown content */
  initialContent?: string
  /** Callback when content changes */
  onChange?: (markdown: string) => void
  /** Callback with editor view instance for advanced use cases */
  onEditorUpdate?: (view: EditorView) => void
  /** Whether the editor is editable */
  editable?: boolean
  /** Additional CSS class */
  className?: string
  /** Placeholder text when editor is empty */
  placeholder?: string
}

/**
 * Theme configuration for the editor
 */
export interface MarkdownEditorTheme {
  /** Background color */
  background: string
  /** Foreground/text color */
  foreground: string
  /** Cursor color */
  cursor: string
  /** Selection background */
  selection: string
  /** Line numbers color */
  lineNumbers: string
  /** Active line background */
  activeLine: string
  /** Syntax highlighting colors */
  syntax: {
    heading: string
    bold: string
    italic: string
    code: string
    link: string
    quote: string
    list: string
  }
}

/**
 * Live Preview decoration types
 */
export type DecorationNodeType =
  | 'heading'
  | 'bold'
  | 'italic'
  | 'code'
  | 'codeBlock'
  | 'link'
  | 'image'
  | 'blockquote'
  | 'list'
  | 'task'
  | 'callout'
  | 'math'
  | 'highlight'

/**
 * Range for decorations
 */
export interface DecorationRange {
  from: number
  to: number
  type: DecorationNodeType
}
