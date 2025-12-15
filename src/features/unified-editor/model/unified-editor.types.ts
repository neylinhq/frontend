/**
 * Unified Editor Types
 *
 * Types for the editor wrapper that switches between Tiptap and CodeMirror.
 */

import type { Editor, JSONContent } from '@tiptap/react'
import type { EditorView } from '@codemirror/view'

/**
 * Props for the UnifiedEditor component
 *
 * Uses HTML as the storage format for backward compatibility.
 * When using CodeMirror, conversion happens automatically:
 * - Load: HTML -> Markdown
 * - Save: Markdown -> HTML
 */
export interface UnifiedEditorProps {
  /** Initial HTML content (storage format) */
  initialContent?: string
  /** Callback when content changes (returns HTML) */
  onChange?: (html: string) => void
  /** Callback with raw editor content (JSON for Tiptap, Markdown for CodeMirror) */
  onRawChange?: (content: JSONContent | string) => void
  /** Callback with editor instance for advanced use cases */
  onEditorReady?: (editor: Editor | EditorView) => void
  /** Whether the editor is editable */
  editable?: boolean
  /** Additional CSS class */
  className?: string
  /** Placeholder text */
  placeholder?: string
}

/**
 * Internal state for tracking conversion
 */
export interface EditorState {
  /** Current HTML content (source of truth) */
  html: string
  /** Markdown content (for CodeMirror) */
  markdown: string
  /** Whether content has been modified */
  isDirty: boolean
}
