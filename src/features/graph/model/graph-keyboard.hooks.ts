import { useCallback, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { triggerLayout, useGraphViewStore } from './graph.store'

interface UseGraphKeyboardOptions {
  selectedNodeId: string | null
  onFitView?: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  enabled?: boolean
}

export const useGraphKeyboard = ({
  selectedNodeId,
  onFitView,
  onZoomIn,
  onZoomOut,
  enabled = true
}: UseGraphKeyboardOptions) => {
  const {
    viewMode,
    setViewMode,
    focusNode,
    clearFocus,
    focusedNodeId,
    focusDepth,
    setFocusDepth,
    resetFilters
  } = useGraphViewStore(
    useShallow(s => ({
      viewMode: s.viewMode,
      setViewMode: s.setViewMode,
      focusNode: s.focusNode,
      clearFocus: s.clearFocus,
      focusedNodeId: s.focusedNodeId,
      focusDepth: s.focusDepth,
      setFocusDepth: s.setFocusDepth,
      resetFilters: s.resetFilters
    }))
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle if typing in input
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      // F - Focus on selected node (switch to focus mode)
      if (e.key === 'f' || e.key === 'F') {
        if (selectedNodeId) {
          focusNode(selectedNodeId)
          e.preventDefault()
        } else if (viewMode !== 'focus') {
          setViewMode('focus')
          e.preventDefault()
        }
      }

      // Escape - Clear focus / Return to overview
      if (e.key === 'Escape') {
        if (focusedNodeId) {
          clearFocus()
        } else if (viewMode !== 'overview') {
          setViewMode('overview')
        }
        e.preventDefault()
      }

      // O - Overview mode
      if (e.key === 'o' || e.key === 'O') {
        setViewMode('overview')
        e.preventDefault()
      }

      // P - Path mode
      if (e.key === 'p' || e.key === 'P') {
        setViewMode('path')
        e.preventDefault()
      }

      // 1-5 - Set focus depth (in focus mode)
      if (/^[1-5]$/.test(e.key) && !e.ctrlKey && !e.metaKey && viewMode === 'focus') {
        setFocusDepth(parseInt(e.key, 10))
        e.preventDefault()
      }

      // + / - - Adjust focus depth in focus mode
      if (viewMode === 'focus' && !e.ctrlKey && !e.metaKey) {
        if (e.key === '+' || e.key === '=') {
          setFocusDepth(Math.min(5, focusDepth + 1))
          e.preventDefault()
        }
        if (e.key === '-' || e.key === '_') {
          setFocusDepth(Math.max(1, focusDepth - 1))
          e.preventDefault()
        }
      }

      // R - Reset filters
      if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) {
        resetFilters()
        e.preventDefault()
      }

      // L - Apply layout
      if (e.key === 'l' || e.key === 'L') {
        triggerLayout()
        e.preventDefault()
      }

      // Ctrl/Cmd+0 or = - Fit view
      if ((e.ctrlKey || e.metaKey) && (e.key === '0' || e.key === '=')) {
        onFitView?.()
        e.preventDefault()
      }

      // Ctrl/Cmd++ - Zoom in
      if ((e.ctrlKey || e.metaKey) && e.key === '+') {
        onZoomIn?.()
        e.preventDefault()
      }

      // Ctrl/Cmd+- - Zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        onZoomOut?.()
        e.preventDefault()
      }
    },
    [
      selectedNodeId,
      viewMode,
      focusedNodeId,
      focusDepth,
      setViewMode,
      focusNode,
      clearFocus,
      setFocusDepth,
      resetFilters,
      onFitView,
      onZoomIn,
      onZoomOut
    ]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, enabled])

  return {
    shortcuts: [
      { key: 'O', description: 'Overview mode' },
      { key: 'F', description: 'Focus mode / Focus on selected node' },
      { key: 'P', description: 'Path mode' },
      { key: 'Escape', description: 'Clear focus / Back to overview' },
      { key: '1-5', description: 'Set focus depth (in focus mode)' },
      { key: '+/-', description: 'Adjust focus depth' },
      { key: 'R', description: 'Reset filters' },
      { key: 'L', description: 'Apply layout' },
      { key: 'Ctrl+0', description: 'Fit view' }
    ]
  }
}

