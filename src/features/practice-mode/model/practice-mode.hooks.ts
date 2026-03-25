import { useEffect, useMemo } from 'react'

import { DEFAULT_NODE_PROGRESS, useAllNodeProgress, type UserNodeProgress } from '@/entities/progress'

import { usePracticeModeActions, usePracticeModeActive } from '../model/practice-mode.store'

interface NodeLike {
  id: string
}

/**
 * Fetches node progress when practice mode is active and syncs to store.
 * Creates default "unlearned" entries for nodes that have no progress yet,
 * so the overview shows all nodes from the start.
 *
 * @param mapId - The map ID to fetch progress for
 * @param nodes - All nodes on the map (to populate defaults for unseen nodes)
 */
export const useMasteryOverlay = (mapId: string, nodes?: NodeLike[]) => {
  const isActive = usePracticeModeActive()
  const { setMasteryData, setLoadingMastery } = usePracticeModeActions()

  const { data: nodeProgress, isLoading } = useAllNodeProgress(isActive ? mapId : '')

  // Build a stable string key from node IDs to avoid re-running effect on every render
  const nodeIdKey = nodes ? nodes.map((n) => n.id).join(',') : ''
  const nodeIdSet = useMemo(() => {
    if (!nodeIdKey) {
      return null
    }
    return new Set(nodeIdKey.split(','))
  }, [nodeIdKey])

  useEffect(() => {
    setLoadingMastery(isLoading)
  }, [isLoading, setLoadingMastery])

  useEffect(() => {
    // Wait for query to settle (not loading, data arrived or empty array)
    if (nodeProgress === undefined) {
      return
    }

    const progressByNode = new Map<string, UserNodeProgress>()
    for (const p of nodeProgress) {
      progressByNode.set(p.nodeId, p)
    }

    const merged: UserNodeProgress[] = [...nodeProgress]

    // Fill in defaults for nodes that have no backend progress yet
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
}
