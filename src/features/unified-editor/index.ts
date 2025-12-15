/**
 * Unified Editor Feature
 *
 * Wrapper that switches between Tiptap and CodeMirror editors
 * based on the EDITOR_TYPE configuration.
 *
 * @example
 * import { UnifiedEditor } from '@/features/unified-editor'
 *
 * <UnifiedEditor
 *   initialContent={htmlFromServer}
 *   onChange={(html) => saveToServer(html)}
 *   placeholder="Start writing..."
 * />
 */

export { UnifiedEditor } from './components/unified-editor'
export type { UnifiedEditorProps } from './model/unified-editor.types'
