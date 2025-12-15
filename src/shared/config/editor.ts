/**
 * Editor Configuration
 *
 * Controls which editor implementation is used in the application.
 * - 'tiptap': Original block editor based on Tiptap (ProseMirror)
 * - 'codemirror': New Obsidian-style Live Preview editor based on CodeMirror 6
 *
 * The system stores content as HTML for backward compatibility.
 * When using CodeMirror, runtime conversion happens:
 * - Load: HTML -> Markdown
 * - Save: Markdown -> HTML
 */

export type EditorType = 'tiptap' | 'codemirror'

/**
 * Current editor type to use across the application.
 * Change this to switch between editors.
 */
export const EDITOR_TYPE: EditorType = 'codemirror'

/**
 * Check if CodeMirror editor is enabled
 */
export const isCodeMirrorEnabled = () => EDITOR_TYPE === 'codemirror'

/**
 * Check if Tiptap editor is enabled
 */
export const isTiptapEnabled = () => EDITOR_TYPE === 'tiptap'
