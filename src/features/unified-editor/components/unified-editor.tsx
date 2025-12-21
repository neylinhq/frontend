'use client'

/**
 * Unified Editor Component
 *
 * Wrapper around CodeMirror (note-editor).
 *
 * Storage format: Markdown (native, no conversion needed).
 */

import { useCallback, useRef } from 'react'
import type { EditorView } from '@codemirror/view'

import { NoteEditor } from '@/features/note-editor'

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
  // Track if we've initialized
  const isInitialized = useRef(false)

  // Store initial content only once on mount
  const initialContentRef = useRef<string>(initialContent)

  // Handle CodeMirror content changes - MD native, no conversion
  const handleNoteChange = useCallback(
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

  return (
    <NoteEditor
      initialContent={initialContentRef.current}
      onChange={handleNoteChange}
      onEditorUpdate={handleCodeMirrorReady}
      editable={editable}
      className={className}
      placeholder={placeholder}
    />
  )
}
