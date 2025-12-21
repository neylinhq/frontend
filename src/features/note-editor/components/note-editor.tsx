'use client'

import { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { cn } from '@/shared/lib/cn'

import { createExtensions } from '../lib/extensions'
import type { NoteEditorProps } from '../model/note-editor.types'
import styles from '../styles/note-editor.module.css'

export const NoteEditor = ({
  initialContent = '',
  onChange,
  onEditorUpdate,
  onError,
  editable = true,
  className,
  placeholder
}: NoteEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const isInitialized = useRef(false)
  const [hasError, setHasError] = useState(false)

  const editableCompartment = useMemo(() => new Compartment(), [])
  const editableCompartmentRef = useRef(editableCompartment)

  const onChangeRef = useRef(onChange)
  const onEditorUpdateRef = useRef(onEditorUpdate)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onChangeRef.current = onChange
    onEditorUpdateRef.current = onEditorUpdate
    onErrorRef.current = onError
  }, [onChange, onEditorUpdate, onError])

  const handleChange = useCallback((content: string) => {
    onChangeRef.current?.(content)
  }, [])

  useEffect(() => {
    if (!containerRef.current || isInitialized.current || hasError) return

    try {
      const extensions = createExtensions({
        placeholder: placeholder || "Type '/' for commands, or start writing...",
        onChange: handleChange
      })

      const state = EditorState.create({
        doc: initialContent,
        extensions: [
          ...extensions,
          editableCompartmentRef.current.of(EditorView.editable.of(editable))
        ]
      })

      const view = new EditorView({
        state,
        parent: containerRef.current
      })

      viewRef.current = view
      isInitialized.current = true

      onEditorUpdateRef.current?.(view)
    } catch (error) {
      console.error('Failed to initialize note editor:', error)
      setHasError(true)
      onErrorRef.current?.(error instanceof Error ? error : new Error(String(error)))
    }

    return () => {
      viewRef.current?.destroy()
      viewRef.current = null
      isInitialized.current = false
    }
  }, [hasError])

  useEffect(() => {
    if (!viewRef.current) return
    viewRef.current.dispatch({
      effects: editableCompartmentRef.current.reconfigure(
        EditorView.editable.of(editable)
      )
    })
  }, [editable])

  const lastInitialContentRef = useRef(initialContent)

  useEffect(() => {
    if (!viewRef.current || !isInitialized.current) return

    const isNewDocument =
      lastInitialContentRef.current !== initialContent &&
      initialContent !== viewRef.current.state.doc.toString()

    if (isNewDocument) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: initialContent
        }
      })
    }

    lastInitialContentRef.current = initialContent
  }, [initialContent])

  if (typeof window === 'undefined') {
    return (
      <div className={cn(styles.editorWrapper, className)}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className={cn(styles.editorWrapper, className)}>
        <textarea
          className={cn(styles.editor, styles.fallbackTextarea)}
          defaultValue={initialContent}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder || "Type '/' for commands, or start writing..."}
          readOnly={!editable}
          data-testid='note-editor-fallback'
        />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(styles.editorWrapper, styles.editor, 'focus-within:outline-none', className)}
      data-testid='note-editor'
    />
  )
}
