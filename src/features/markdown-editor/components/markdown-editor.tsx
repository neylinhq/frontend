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

import { useEffect, useRef, useCallback, useMemo } from 'react'
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
  editable = true,
  className,
  placeholder
}: MarkdownEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const isInitialized = useRef(false)

  // Compartments for dynamic reconfiguration
  const editableCompartment = useMemo(() => new Compartment(), [])
  const editableCompartmentRef = useRef(editableCompartment)

  // Stable callback ref to avoid recreating editor on every render
  const onChangeRef = useRef(onChange)
  const onEditorUpdateRef = useRef(onEditorUpdate)

  useEffect(() => {
    onChangeRef.current = onChange
    onEditorUpdateRef.current = onEditorUpdate
  }, [onChange, onEditorUpdate])

  // Handle content changes
  const handleChange = useCallback((content: string) => {
    if (onChangeRef.current) {
      onChangeRef.current(content)
    }
  }, [])

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current || isInitialized.current) return

    const extensions = createExtensions({
      placeholder: placeholder || "Type '/' for commands, or start writing...",
      editable,
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

    return () => {
      view.destroy()
      viewRef.current = null
      isInitialized.current = false
    }
  }, []) // Only run once on mount

  // Update editable state
  useEffect(() => {
    if (!viewRef.current) return

    viewRef.current.dispatch({
      effects: editableCompartmentRef.current.reconfigure(
        EditorView.editable.of(editable)
      )
    })
  }, [editable])

  // Update content when initialContent changes externally
  useEffect(() => {
    if (!viewRef.current || !isInitialized.current) return

    const currentContent = viewRef.current.state.doc.toString()
    if (currentContent !== initialContent) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: initialContent
        }
      })
    }
  }, [initialContent])

  // Loading skeleton
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

  return (
    <div
      ref={containerRef}
      className={cn(
        styles.editorWrapper,
        styles.editor,
        'focus-within:outline-none',
        className
      )}
      data-testid="markdown-editor"
    />
  )
}
