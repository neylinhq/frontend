import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useFullMap } from '@/entities/map'
import { useMapFocus, useMapPracticeActive, useMapViewMode } from '@/entities/map-ui'
import { DEFAULT_NODE_PROGRESS, type UserNodeProgress, useAllNodeProgress } from '@/entities/progress'

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
}

/**
 * Determines the practice scope based on the current map view mode.
 *
 * - In focus mode: BFS from the focused node up to focusDepth levels.
 * - In overview mode: all node IDs from the map.
 */
export function usePracticeScope(mapId: string): {
  scopeNodeIds: string[]
  scopeLabel: string
} {
  const { t } = useTranslation()
  const viewMode = useMapViewMode(mapId)
  const { focusedNodeId, focusDepth } = useMapFocus(mapId)
  const { data: fullMap } = useFullMap(mapId)

  return useMemo(() => {
    if (!fullMap?.nodes?.length) {
      return { scopeNodeIds: [], scopeLabel: '' }
    }

    if (viewMode === 'focus' && focusedNodeId) {
      const adjacency = new Map<string, string[]>()
      for (const node of fullMap.nodes) {
        adjacency.set(node.id, [])
      }
      for (const edge of fullMap.edges) {
        adjacency.get(edge.sourceNodeId)?.push(edge.targetNodeId)
        adjacency.get(edge.targetNodeId)?.push(edge.sourceNodeId)
      }

      const visited = new Set<string>()
      const queue: Array<{ id: string; depth: number }> = [{ id: focusedNodeId, depth: 0 }]
      visited.add(focusedNodeId)

      while (queue.length > 0) {
        const current = queue.shift()!
        if (current.depth < focusDepth) {
          const neighbors = adjacency.get(current.id) ?? []
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor)
              queue.push({ id: neighbor, depth: current.depth + 1 })
            }
          }
        }
      }

      const scopeNodeIds = [...visited]
      const focusedNode = fullMap.nodes.find((n) => n.id === focusedNodeId)
      const scopeLabel = focusedNode
        ? `${focusedNode.label} +${focusDepth}`
        : `+${focusDepth}`

      return { scopeNodeIds, scopeLabel }
    }

    // Overview mode — all nodes
    const scopeNodeIds = fullMap.nodes.map((n) => n.id)
    return { scopeNodeIds, scopeLabel: t('practice.scope.entireMap') }
  }, [fullMap, viewMode, focusedNodeId, focusDepth, t])
}

/**
 * Auto-ends active practice session when view scope changes
 * (user switched focus node, depth, or view mode).
 * FSRS progress is already saved per-exchange, so no data loss.
 */
export const useSessionScopeGuard = (mapId: string) => {
  const viewMode = useMapViewMode(mapId)
  const { focusedNodeId, focusDepth } = useMapFocus(mapId)
  const scopeKey = `${viewMode}:${focusedNodeId ?? ''}:${focusDepth}`
  const prevScopeRef = useRef(scopeKey)

  useEffect(() => {
    if (prevScopeRef.current !== scopeKey) {
      prevScopeRef.current = scopeKey
      const { session } = usePracticeModeStore.getState()
      if (session) {
        usePracticeModeStore.getState().endSession()
      }
    }
  }, [scopeKey])
}
