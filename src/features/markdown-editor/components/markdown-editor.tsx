'use client'

/**
 * Markdown Editor Component
 *
 * CodeMirror 6 based Obsidian-style Live Preview editor.
 * Features:
 * - WYSIWYG-like experience with markdown source
 * - Hidden syntax when cursor is not on the line
 * - Full markdown support including GFM
 * - Syntax highlighting for code blocks
 */

import { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import { Compartment, EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { cn } from '@/shared/lib/cn'

import { createExtensions } from '../lib/extensions'
import type { MarkdownEditorProps } from '../model/markdown-editor.types'
import styles from '../styles/markdown-editor.module.css'

export const MarkdownEditor = ({
  initialContent = '',
  onChange,
  onEditorUpdate,
  onError,
  editable = true,
  className,
  placeholder
}: MarkdownEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const isInitialized = useRef(false)
  const [hasError, setHasError] = useState(false)

  // Compartments for dynamic reconfiguration
  const editableCompartment = useMemo(() => new Compartment(), [])
  const editableCompartmentRef = useRef(editableCompartment)

  // Stable callback refs to avoid recreating editor on every render
  const onChangeRef = useRef(onChange)
  const onEditorUpdateRef = useRef(onEditorUpdate)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onChangeRef.current = onChange
    onEditorUpdateRef.current = onEditorUpdate
    onErrorRef.current = onError
  }, [onChange, onEditorUpdate, onError])

  // Handle content changes
  const handleChange = useCallback((content: string) => {
    if (onChangeRef.current) {
      onChangeRef.current(content)
    }
  }, [])

  // Initialize editor with error handling
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

      // Notify parent about editor instance
      if (onEditorUpdateRef.current) {
        onEditorUpdateRef.current(view)
      }
    } catch (error) {
      console.error('Failed to initialize markdown editor:', error)
      setHasError(true)

      if (onErrorRef.current) {
        onErrorRef.current(error instanceof Error ? error : new Error(String(error)))
      }
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy()
        viewRef.current = null
      }
      isInitialized.current = false
    }
  }, [hasError]) // Only run once on mount, or retry after error state changes

  // Update editable state
  useEffect(() => {
    if (!viewRef.current) return

    viewRef.current.dispatch({
      effects: editableCompartmentRef.current.reconfigure(
        EditorView.editable.of(editable)
      )
    })
  }, [editable])

  // Track the initial content to avoid overwriting user edits
  // Only update if content was externally changed (e.g., loading different document)
  const lastInitialContentRef = useRef(initialContent)

  useEffect(() => {
    if (!viewRef.current || !isInitialized.current) return

    // Only update if this is a fundamentally different document
    // (e.g., navigating to a different note), not just a save cycle
    const isNewDocument = lastInitialContentRef.current !== initialContent &&
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

  // Loading skeleton for SSR
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

  // Fallback textarea when editor fails to initialize
  if (hasError) {
    return (
      <div className={cn(styles.editorWrapper, className)}>
        <textarea
          className={cn(styles.editor, styles.fallbackTextarea)}
          defaultValue={initialContent}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder || "Type '/' for commands, or start writing..."}
          readOnly={!editable}
          data-testid="markdown-editor-fallback"
        />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        styles.editorWrapper,
        styles.editor,
        // Use prose styles for consistent typography with AI responses
        'prose prose-sm max-w-none dark:prose-invert',
        'focus-within:outline-none',
        className
      )}
      data-testid="markdown-editor"
    />
  )
}
