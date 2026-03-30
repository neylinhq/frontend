import { useCallback, useState } from 'react'

import { useFullscreen } from '@/shared/hooks/use-fullscreen'

import type { GraphControls } from './graph-visualization.types'

export const useGraphControls = () => {
  const [controls, setControls] = useState<GraphControls>({
    zoom: 100,
    isFullscreen: false,
    showMinimap: true
  })

  const { isFullscreen, toggleFullscreen } = useFullscreen()

  const setZoom = useCallback((zoom: number) => {
    setControls(prev => ({ ...prev, zoom }))
  }, [])

  const toggleMinimap = useCallback(() => {
    setControls(prev => ({ ...prev, showMinimap: !prev.showMinimap }))
  }, [])

  return {
    controls: { ...controls, isFullscreen },
    setZoom,
    toggleFullscreen,
    toggleMinimap
  }
}
