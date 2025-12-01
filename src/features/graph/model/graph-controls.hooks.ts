import { useCallback, useState } from 'react'
import type { GraphControls } from './graph-visualization.types'

export const useGraphControls = () => {
  const [controls, setControls] = useState<GraphControls>({
    zoom: 100,
    isFullscreen: false,
    showMinimap: true
  })

  const setZoom = useCallback((zoom: number) => {
    setControls(prev => ({ ...prev, zoom }))
  }, [])

  const toggleFullscreen = useCallback(() => {
    setControls(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))
  }, [])

  const toggleMinimap = useCallback(() => {
    setControls(prev => ({ ...prev, showMinimap: !prev.showMinimap }))
  }, [])

  return {
    controls,
    setZoom,
    toggleFullscreen,
    toggleMinimap
  }
}
