import { useViewport } from '@xyflow/react'
import { useMemo, useRef } from 'react'

/**
 * LOD (Level of Detail) zoom thresholds
 */
export const ZOOM_THRESHOLDS = {
  /** Below this: show simplified nodes (colored rectangles) */
  LOW_DETAIL: 0.05,
  /** Below this: hide edge labels entirely */
  VERY_LOW_DETAIL: 0.02,
  /** Above this: show full detail */
  HIGH_DETAIL: 0.5
} as const

export type ZoomLevel = 'very-low' | 'low' | 'medium' | 'high'

/**
 * Get discrete zoom level from continuous zoom value.
 * This prevents re-renders when zoom changes within the same level.
 */
export const getZoomLevel = (zoom: number): ZoomLevel => {
  if (zoom < ZOOM_THRESHOLDS.VERY_LOW_DETAIL) return 'very-low'
  if (zoom < ZOOM_THRESHOLDS.LOW_DETAIL) return 'low'
  if (zoom < ZOOM_THRESHOLDS.HIGH_DETAIL) return 'medium'
  return 'high'
}

interface UseDiscreteZoomResult {
  /** Current continuous zoom value */
  zoom: number
  /** Discrete zoom level for LOD */
  zoomLevel: ZoomLevel
  /** Whether we're in low detail mode (zoom < 0.05) */
  isLowDetail: boolean
  /** Whether we're in very low detail mode (zoom < 0.02) */
  isVeryLowDetail: boolean
}

/**
 * Hook that provides discrete zoom levels instead of continuous values.
 *
 * PERFORMANCE OPTIMIZATION:
 * Instead of re-rendering all nodes/edges on every zoom change,
 * we only trigger updates when crossing LOD thresholds.
 *
 * This reduces re-renders from O(zoom_changes) to O(threshold_crossings).
 */
export const useDiscreteZoom = (): UseDiscreteZoomResult => {
  const { zoom } = useViewport()
  const prevZoomLevelRef = useRef<ZoomLevel>(getZoomLevel(zoom))

  // Only update zoomLevel when it actually changes
  const zoomLevel = useMemo(() => {
    const newLevel = getZoomLevel(zoom)
    if (newLevel !== prevZoomLevelRef.current) {
      prevZoomLevelRef.current = newLevel
    }
    return prevZoomLevelRef.current
  }, [zoom])

  return useMemo(() => ({
    zoom,
    zoomLevel,
    isLowDetail: zoomLevel === 'low' || zoomLevel === 'very-low',
    isVeryLowDetail: zoomLevel === 'very-low'
  }), [zoom, zoomLevel])
}

/**
 * Get a "snapped" zoom value that only changes at LOD thresholds.
 * Use this to pass to child components instead of raw zoom.
 *
 * For example:
 * - zoom 0.03 → returns 0.03 (actual value, since < 0.05)
 * - zoom 0.07 → returns 0.05 (threshold value, since we're in medium range)
 * - zoom 0.15 → returns 0.05 (threshold value)
 * - zoom 0.60 → returns 0.50 (threshold value, since we're in high range)
 *
 * This way children only re-render when crossing thresholds.
 */
export const getSnappedZoom = (zoom: number): number => {
  const level = getZoomLevel(zoom)
  switch (level) {
    case 'very-low':
      return zoom // Need actual value for stroke width calculation
    case 'low':
      return zoom // Need actual value for stroke width calculation
    case 'medium':
      return ZOOM_THRESHOLDS.LOW_DETAIL // Snap to threshold
    case 'high':
      return ZOOM_THRESHOLDS.HIGH_DETAIL // Snap to threshold
    default:
      return zoom
  }
}
