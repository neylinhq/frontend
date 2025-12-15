'use client'

/**
 * Unified Editor Component
 *
 * Wrapper that conditionally renders either Tiptap (block-editor) or
 * CodeMirror (markdown-editor) based on the EDITOR_TYPE configuration.
 *
 * Handles conversion between HTML (storage) and Markdown (CodeMirror) formats.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Editor, JSONContent } from '@tiptap/react'
import type { EditorView } from '@codemirror/view'

import { isCodeMirrorEnabled } from '@/shared/config'
import { BlockEditor, editorToHTML, htmlToEditor } from '@/features/block-editor'
import { MarkdownEditor } from '@/features/markdown-editor'
import { toMarkdown, toHtml } from '@/features/editor-converter'

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

  // Track if we've initialized to avoid double conversions
  const isInitialized = useRef(false)

  // Convert HTML to markdown for CodeMirror initial content
  const initialMarkdown = useMemo(() => {
    if (!useCodeMirror || !initialContent) return ''
    return toMarkdown(initialContent)
  }, [useCodeMirror, initialContent])

  // Convert HTML to Tiptap JSONContent
  const initialJsonContent = useMemo(() => {
    if (useCodeMirror || !initialContent) return undefined
    return htmlToEditor(initialContent)
  }, [useCodeMirror, initialContent])

  // Debounce timer ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Handle CodeMirror content changes
  const handleMarkdownChange = useCallback(
    (markdown: string) => {
      // Debounce conversion for performance
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        const html = toHtml(markdown)

        if (onChange) {
          onChange(html)
        }

        if (onRawChange) {
          onRawChange(markdown)
        }
      }, 300) // 300ms debounce
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

  // Handle Tiptap editor update (for getting HTML)
  const handleTiptapEditorUpdate = useCallback(
    (editor: Editor) => {
      if (onChange) {
        const html = editorToHTML(editor)
        onChange(html)
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

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Render CodeMirror editor
  if (useCodeMirror) {
    return (
      <MarkdownEditor
        initialContent={initialMarkdown}
        onChange={handleMarkdownChange}
        onEditorUpdate={handleCodeMirrorReady}
        editable={editable}
        className={className}
        placeholder={placeholder}
      />
    )
  }

  // Render Tiptap editor
  return (
    <BlockEditor
      initialContent={initialJsonContent}
      onChange={handleTiptapChange}
      onEditorUpdate={handleTiptapEditorUpdate}
      editable={editable}
      className={className}
      placeholder={placeholder}
    />
  )
}
