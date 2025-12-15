/**
 * Markdown Editor Feature
 *
 * CodeMirror 6 based Obsidian-style Live Preview editor.
 *
 * @example
 * import { MarkdownEditor } from '@/features/markdown-editor'
 *
 * <MarkdownEditor
 *   initialContent="# Hello World"
 *   onChange={(markdown) => console.log(markdown)}
 *   placeholder="Start writing..."
 * />
 */

export { MarkdownEditor } from './components/markdown-editor'
export type { MarkdownEditorProps } from './model/markdown-editor.types'
