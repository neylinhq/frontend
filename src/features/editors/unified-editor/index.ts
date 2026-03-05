/**
 * Unified Editor Feature
 *
 * Wrapper around the CodeMirror editor.
 *
 * @example
 * import { UnifiedEditor } from '@/features/unified-editor'
 *
 * <UnifiedEditor
 *   initialContent={markdownFromServer}
 *   onChange={(markdown) => saveToServer(markdown)}
 *   placeholder="Start writing..."
 * />
 */

export { UnifiedEditor } from './components/unified-editor'
export type { UnifiedEditorProps } from './model/unified-editor.types'
