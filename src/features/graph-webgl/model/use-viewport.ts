/**
 * Hook for managing viewport state (pan/zoom)
 */

import { useCallback, useState, useRef, useEffect } from 'react'
import type { ViewportState } from '../lib/types'
import { DEFAULT_VIEWPORT } from '../lib/types'

interface UseViewportOptions {
  initialViewport?: Partial<ViewportState>
  minZoom?: number
  maxZoom?: number
  onViewportChange?: (viewport: ViewportState) => void
}

export function useViewport(options: UseViewportOptions = {}) {
  const {
    initialViewport,
    minZoom = 0.1,
    maxZoom = 4,
    onViewportChange,
  } = options

  const [viewport, setViewport] = useState<ViewportState>({
    ...DEFAULT_VIEWPORT,
    ...initialViewport,
  })

  // Ref for accessing current viewport in callbacks
  const viewportRef = useRef(viewport)
  viewportRef.current = viewport

  // Pan by delta (screen pixels)
  const pan = useCallback((dx: number, dy: number) => {
    setViewport(v => {
      const newViewport = {
        ...v,
        x: v.x - dx / v.zoom,
        y: v.y - dy / v.zoom,
      }
      onViewportChange?.(newViewport)
      return newViewport
    })
  }, [onViewportChange])

  // Zoom at screen point
  const zoomAt = useCallback((screenX: number, screenY: number, factor: number) => {
    setViewport(v => {
      // Get world position before zoom
      const worldX = (screenX - v.width / 2) / v.zoom + v.x
      const worldY = (screenY - v.height / 2) / v.zoom + v.y

      // Apply zoom with clamping
      const newZoom = Math.max(minZoom, Math.min(maxZoom, v.zoom * factor))

      // Get new world position at same screen point
      const newWorldX = (screenX - v.width / 2) / newZoom + v.x
      const newWorldY = (screenY - v.height / 2) / newZoom + v.y

      // Adjust camera to keep point under cursor
      const newViewport = {
        ...v,
        zoom: newZoom,
        x: v.x + worldX - newWorldX,
        y: v.y + worldY - newWorldY,
      }

      onViewportChange?.(newViewport)
      return newViewport
    })
  }, [minZoom, maxZoom, onViewportChange])

  // Set zoom level directly
  const setZoom = useCallback((zoom: number) => {
    setViewport(v => {
      const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom))
      const newViewport = { ...v, zoom: newZoom }
      onViewportChange?.(newViewport)
      return newViewport
    })
  }, [minZoom, maxZoom, onViewportChange])

  // Update canvas size
  const setSize = useCallback((width: number, height: number) => {
    setViewport(v => {
      const newViewport = { ...v, width, height }
      onViewportChange?.(newViewport)
      return newViewport
    })
  }, [onViewportChange])

  // Fit viewport to bounds
  const fitToBounds = useCallback((
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    padding = 0.1
  ) => {
    setViewport(v => {
      const boundsWidth = maxX - minX
      const boundsHeight = maxY - minY

      if (boundsWidth <= 0 || boundsHeight <= 0) return v

      // Calculate zoom to fit
      const zoomX = (v.width * (1 - padding)) / boundsWidth
      const zoomY = (v.height * (1 - padding)) / boundsHeight
      const newZoom = Math.max(minZoom, Math.min(maxZoom, Math.min(zoomX, zoomY)))

      // Center on bounds
      const newViewport = {
        ...v,
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
        zoom: newZoom,
      }

      onViewportChange?.(newViewport)
      return newViewport
    })
  }, [minZoom, maxZoom, onViewportChange])

  // Convert screen to world coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number): { x: number; y: number } => {
    const v = viewportRef.current
    return {
      x: (screenX - v.width / 2) / v.zoom + v.x,
      y: (screenY - v.height / 2) / v.zoom + v.y,
    }
  }, [])

  // Convert world to screen coordinates
  const worldToScreen = useCallback((worldX: number, worldY: number): { x: number; y: number } => {
    const v = viewportRef.current
    return {
      x: (worldX - v.x) * v.zoom + v.width / 2,
      y: (worldY - v.y) * v.zoom + v.height / 2,
    }
  }, [])

  // Get visible bounds in world coordinates
  const getVisibleBounds = useCallback((): { minX: number; minY: number; maxX: number; maxY: number } => {
    const v = viewportRef.current
    const halfW = v.width / 2 / v.zoom
    const halfH = v.height / 2 / v.zoom
    return {
      minX: v.x - halfW,
      minY: v.y - halfH,
      maxX: v.x + halfW,
      maxY: v.y + halfH,
    }
  }, [])

  return {
    viewport,
    setViewport,
    pan,
    zoomAt,
    setZoom,
    setSize,
    fitToBounds,
    screenToWorld,
    worldToScreen,
    getVisibleBounds,
  }
}
