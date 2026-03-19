import { useEffect } from 'react'

import { useAllNodeProgress } from '@/entities/progress'

import { usePracticeModeActions, usePracticeModeActive } from '../model/practice-mode.store'

/**
 * Fetches node progress when practice mode is active and syncs to store.
 * Call this once at the graph view level.
 */
export const useMasteryOverlay = (mapId: string) => {
  const isActive = usePracticeModeActive()
  const { setMasteryData, setLoadingMastery } = usePracticeModeActions()

  const { data: nodeProgress, isLoading } = useAllNodeProgress(isActive ? mapId : '')

  useEffect(() => {
    setLoadingMastery(isLoading)
  }, [isLoading, setLoadingMastery])

  useEffect(() => {
    if (nodeProgress) {
      setMasteryData(nodeProgress)
    }
  }, [nodeProgress, setMasteryData])
}
