import { useCallback, useState } from 'react'
import type { GraphControls } from './graph-visualization.types'

export function useGraphControls() {
  const [controls, setControls] = useState<GraphControls>({
    isFullscreen: false
  })

  const toggleFullscreen = useCallback(() => {
    setControls(prev => ({ isFullscreen: !prev.isFullscreen }))
  }, [])

  return {
    controls,
    toggleFullscreen
  }
}
