import { useViewport } from '@xyflow/react'
import { useEffect, useRef, useState } from 'react'
import { getSnappedZoom } from './use-discrete-zoom'

/**
 * PERFORMANCE OPTIMIZATION: Debounced zoom for node/edge data updates
 *
 * Problem:
 * - useViewport() fires on EVERY frame during pan/zoom (60+ times/second)
 * - Updating nodes/edges data on every frame causes massive re-renders
 * - This creates a cascade: data change → useMemo recalc → setNodes → re-render 500+ nodes
 *
 * Solution:
 * - Use requestAnimationFrame to batch updates to once per frame
 * - Only update when zoom crosses LOD thresholds (via getSnappedZoom)
 * - During active interaction, skip updates entirely
 */

interface UseDebouncedZoomOptions {
  /** Debounce delay in ms. Default: 100ms */
  debounceMs?: number
  /** Skip updates during active interaction. Default: true */
  skipDuringInteraction?: boolean
}

interface UseDebouncedZoomResult {
  /** Current snapped zoom value (only updates after debounce) */
  zoom: number
  /** Raw zoom value (updates every frame) */
  rawZoom: number
  /** Whether user is actively interacting (panning/zooming) */
  isInteracting: boolean
}

/**
 * Hook that provides debounced zoom updates for node/edge data.
 *
 * Use this in graph-visualization.tsx instead of direct useViewport().
 * The debounced zoom value should be passed to transformNodesToFlow/transformEdgesToFlow.
 */
export const useDebouncedZoom = (
  options: UseDebouncedZoomOptions = {}
): UseDebouncedZoomResult => {
  const { debounceMs = 100, skipDuringInteraction = true } = options

  const { zoom: rawZoom } = useViewport()
  const [debouncedZoom, setDebouncedZoom] = useState(() => getSnappedZoom(rawZoom))
  const [isInteracting, setIsInteracting] = useState(false)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastUpdateRef = useRef(Date.now())
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdateRef.current

    // Detect interaction: frequent updates = active pan/zoom
    const interacting = timeSinceLastUpdate < 50
    setIsInteracting(interacting)

    // Skip updates during interaction if configured
    if (skipDuringInteraction && interacting) {
      lastUpdateRef.current = now
      return
    }

    // Cancel any pending updates
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    // Debounce the update
    timeoutRef.current = setTimeout(() => {
      rafRef.current = requestAnimationFrame(() => {
        const snapped = getSnappedZoom(rawZoom)
        setDebouncedZoom(prev => {
          // Only update if snapped value changed (prevents unnecessary re-renders)
          if (prev !== snapped) {
            return snapped
          }
          return prev
        })
      })
    }, debounceMs)

    lastUpdateRef.current = now

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [rawZoom, debounceMs, skipDuringInteraction])

  return {
    zoom: debouncedZoom,
    rawZoom,
    isInteracting
  }
}
