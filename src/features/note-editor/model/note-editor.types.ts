/**
 * Note Editor Types
 *
 * Types for the CodeMirror 6 based live preview editor.
 */

import type { EditorView } from '@codemirror/view'

export interface NoteEditorProps {
  /** Initial markdown content */
  initialContent?: string
  /** Callback when content changes */
  onChange?: (markdown: string) => void
  /** Callback with editor view instance for advanced use cases */
  onEditorUpdate?: (view: EditorView) => void
  /** Callback when editor initialization fails */
  onError?: (error: Error) => void
  /** Whether the editor is editable */
  editable?: boolean
  /** Additional CSS class */
  className?: string
  /** Placeholder text when editor is empty */
  placeholder?: string
}
