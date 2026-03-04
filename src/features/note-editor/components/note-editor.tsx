'use client'

import { Compartment, EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { logger } from '@/shared/lib/logger'

import { decodeHtmlEntities } from '../lib/decode-html-entities'
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
  const content = useMemo(() => decodeHtmlEntities(initialContent), [initialContent])
  const contentRef = useRef(content)
  contentRef.current = content
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const isInitialized = useRef(false)
  const [isMounted, setIsMounted] = useState(false)
  const [hasError, setHasError] = useState(false)

  const editableCompartment = useMemo(() => new Compartment(), [])
  const editableCompartmentRef = useRef(editableCompartment)

  const onChangeRef = useRef(onChange)
  const onEditorUpdateRef = useRef(onEditorUpdate)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
        doc: contentRef.current,
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
      logger.error('Failed to initialize note editor:', error)
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
      effects: editableCompartmentRef.current.reconfigure(EditorView.editable.of(editable))
    })
  }, [editable])

  const lastContentRef = useRef(content)

  useEffect(() => {
    if (!viewRef.current || !isInitialized.current) return

    const isNewDocument =
      lastContentRef.current !== content && content !== viewRef.current.state.doc.toString()

    if (isNewDocument) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: content
        }
      })
    }

    lastContentRef.current = content
  }, [content])

  if (!isMounted) {
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
          defaultValue={content}
          onChange={event => onChange?.(event.target.value)}
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
