'use client'

/**
 * Unified Editor Component
 *
 * Wrapper that conditionally renders either Tiptap (block-editor) or
 * CodeMirror (markdown-editor) based on the EDITOR_TYPE configuration.
 *
 * Storage format: Markdown (native, no conversion needed for CodeMirror)
 * Block editor converts MD ↔ Tiptap JSON on the fly if used.
 */

import { useCallback, useRef } from 'react'
import type { Editor, JSONContent } from '@tiptap/react'
import type { EditorView } from '@codemirror/view'

import { isCodeMirrorEnabled } from '@/shared/config'
import { BlockEditor, editorToHTML, htmlToEditor } from '@/features/block-editor'
import { MarkdownEditor } from '@/features/markdown-editor'
import { toHtml, toMarkdown } from '@/features/editor-converter'

import type { UnifiedEditorProps } from '../model/unified-editor.types'

export const UnifiedEditor = ({
  initialContent = '',
  onChange,
  onRawChange,
  onEditorReady,
  editable = true,
  className,
  placeholder
}: UnifiedEditorProps) => {
  const useCodeMirror = isCodeMirrorEnabled()

  // Track if we've initialized
  const isInitialized = useRef(false)

  // Store initial content only once on mount
  const initialContentRef = useRef<string>(initialContent)

  // For Tiptap: convert MD → HTML → JSON (only if block editor is used)
  const initialJsonContentRef = useRef<JSONContent | undefined>(undefined)
  if (initialJsonContentRef.current === undefined && !useCodeMirror && initialContent) {
    // Block editor needs HTML, so convert MD → HTML → JSON
    const html = toHtml(initialContent)
    initialJsonContentRef.current = htmlToEditor(html)
  }

  // Handle CodeMirror content changes - MD native, no conversion
  const handleMarkdownChange = useCallback(
    (markdown: string) => {
      if (onChange) {
        onChange(markdown) // Direct MD to storage
      }
      if (onRawChange) {
        onRawChange(markdown)
      }
    },
    [onChange, onRawChange]
  )

  // Handle Tiptap content changes
  const handleTiptapChange = useCallback(
    (content: JSONContent) => {
      if (onRawChange) {
        onRawChange(content)
      }
    },
    [onRawChange]
  )

  // Handle Tiptap editor update - convert HTML → MD for storage
  const handleTiptapEditorUpdate = useCallback(
    (editor: Editor) => {
      if (onChange) {
        const html = editorToHTML(editor)
        const markdown = toMarkdown(html) // Convert to MD for storage
        onChange(markdown)
      }

      if (onEditorReady && !isInitialized.current) {
        onEditorReady(editor)
        isInitialized.current = true
      }
    },
    [onChange, onEditorReady]
  )

  // Handle CodeMirror editor ready
  const handleCodeMirrorReady = useCallback(
    (view: EditorView) => {
      if (onEditorReady && !isInitialized.current) {
        onEditorReady(view)
        isInitialized.current = true
      }
    },
    [onEditorReady]
  )

  // Render CodeMirror editor - MD native
  if (useCodeMirror) {
    return (
      <MarkdownEditor
        initialContent={initialContentRef.current}
        onChange={handleMarkdownChange}
        onEditorUpdate={handleCodeMirrorReady}
        editable={editable}
        className={className}
        placeholder={placeholder}
      />
    )
  }

  // Render Tiptap editor - needs conversion
  return (
    <BlockEditor
      initialContent={initialJsonContentRef.current}
      onChange={handleTiptapChange}
      onEditorUpdate={handleTiptapEditorUpdate}
      editable={editable}
      className={className}
      placeholder={placeholder}
    />
  )
}
