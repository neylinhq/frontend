import { useEffect, useMemo, useRef } from 'react'

import { useFullMap } from '@/entities/map'
import { useMapPracticeActive } from '@/entities/map-ui'
import { DEFAULT_NODE_PROGRESS, useAllNodeProgress, type UserNodeProgress } from '@/entities/progress'

import { learnSessionApi } from '../api/practice-mode.api'
import { usePracticeModeActions, usePracticeModeStore } from '../model/practice-mode.store'

/**
 * Fetches node progress when practice mode is active and syncs to store.
 * Creates default "unlearned" entries for nodes that have no progress yet,
 * so the overview shows all nodes from the start.
 *
 * Reads nodes from react-query cache (useFullMap) so it stays in sync
 * when AI chat creates new nodes.
 */
export const useMasteryOverlay = (mapId: string) => {
  const isActive = useMapPracticeActive(mapId)
  const { setMasteryData, setLoadingMastery } = usePracticeModeActions()

  const { data: fullMap } = useFullMap(mapId, { enabled: isActive })
  const { data: nodeProgress, isLoading } = useAllNodeProgress(isActive ? mapId : '')

  // Stable set of node IDs from the live map data
  const nodeIdKey = fullMap?.nodes ? fullMap.nodes.map((n) => n.id).join(',') : ''
  const nodeIdSet = useMemo(() => {
    if (!nodeIdKey) {
      return null
    }
    return new Set(nodeIdKey.split(','))
  }, [nodeIdKey])

  // Reset mastery data when map changes
  const prevMapId = useRef(mapId)
  if (prevMapId.current !== mapId) {
    prevMapId.current = mapId
    setMasteryData([])
  }

  useEffect(() => {
    setLoadingMastery(isLoading)
  }, [isLoading, setLoadingMastery])

  useEffect(() => {
    if (nodeProgress === undefined) {
      return
    }

    const progressByNode = new Map<string, UserNodeProgress>()
    for (const p of nodeProgress) {
      progressByNode.set(p.nodeId, p)
    }

    const merged: UserNodeProgress[] = [...nodeProgress]

    if (nodeIdSet) {
      const now = new Date().toISOString()
      for (const nodeId of nodeIdSet) {
        if (!progressByNode.has(nodeId)) {
          merged.push({
            ...DEFAULT_NODE_PROGRESS,
            id: `default-${nodeId}`,
            userId: '',
            nodeId,
            createdAt: now,
            updatedAt: now,
          })
        }
      }
    }

    setMasteryData(merged)
  }, [nodeProgress, nodeIdSet, setMasteryData])

  // Prefetch lesson for first ZPD frontier node so it's ready when user clicks "Learn New"
  const prefetchedRef = useRef<string | null>(null)
  const masteryMapSize = usePracticeModeStore((s) => s.masteryMap.size)
  useEffect(() => {
    if (!isActive || masteryMapSize === 0) {
      return
    }
    const { masteryMap } = usePracticeModeStore.getState()
    const firstZpd = [...masteryMap.values()].find(
      (d) => d.mastery === 'unlearned' && d.prereqsStable
    )
    if (!firstZpd || prefetchedRef.current === firstZpd.nodeId) {
      return
    }
    prefetchedRef.current = firstZpd.nodeId
    learnSessionApi.startLesson(mapId, firstZpd.nodeId).catch(() => {
      // Prefetch failed — user will see normal loading when they click
    })
  }, [isActive, mapId, masteryMapSize])
}
