/**
 * Unified Editor Types
 *
 * Types for the editor wrapper around CodeMirror.
 */

import type { EditorView } from '@codemirror/view'

/**
 * Props for the UnifiedEditor component
 *
 * Uses Markdown as the storage format.
 */
export interface UnifiedEditorProps {
  /** Initial Markdown content (storage format) */
  initialContent?: string
  /** Callback when content changes (returns Markdown) */
  onChange?: (markdown: string) => void
  /** Callback with raw editor content (Markdown) */
  onRawChange?: (content: string) => void
  /** Callback with editor instance for advanced use cases */
  onEditorReady?: (editor: EditorView) => void
  /** Whether the editor is editable */
  editable?: boolean
  /** Additional CSS class */
  className?: string
  /** Placeholder text */
  placeholder?: string
}
