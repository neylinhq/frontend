import { useCallback, useMemo } from 'react'

import type { ConnectionPreset, MapSidebarTab, ViewMode } from './map-ui.types'
import { ALL_EDGE_TYPES, ALL_NODE_TYPES, CONNECTION_PRESETS } from './map-ui.constants'
import { useMapUIStore } from './map-ui.store'

// --- Per-map selectors (primitive values — safe with default equality) ---

export const useMapActiveTab = (mapId: string) =>
  useMapUIStore((s) => s.getMapState(mapId).activeTab)

export const useMapViewMode = (mapId: string) =>
  useMapUIStore((s) => s.getMapState(mapId).viewMode)

export const useMapFocusedNodeId = (mapId: string) =>
  useMapUIStore((s) => s.getMapState(mapId).focusedNodeId)

export const useMapFocusDepth = (mapId: string) =>
  useMapUIStore((s) => s.getMapState(mapId).focusDepth)

// --- Per-map selectors (object values — need stable references) ---

export const useMapFocus = (mapId: string) => {
  const focusedNodeId = useMapUIStore((s) => s.getMapState(mapId).focusedNodeId)
  const focusDepth = useMapUIStore((s) => s.getMapState(mapId).focusDepth)
  const viewMode = useMapUIStore((s) => s.getMapState(mapId).viewMode)
  return useMemo(
    () => ({ focusedNodeId, focusDepth, viewMode }),
    [focusedNodeId, focusDepth, viewMode]
  )
}

export const useMapFilters = (mapId: string) => {
  const visibleNodeTypes = useMapUIStore((s) => s.getMapState(mapId).visibleNodeTypes)
  const visibleEdgeTypes = useMapUIStore((s) => s.getMapState(mapId).visibleEdgeTypes)
  const connectionRange = useMapUIStore((s) => s.getMapState(mapId).connectionRange)
  return useMemo(
    () => ({ visibleNodeTypes, visibleEdgeTypes, connectionRange }),
    [visibleNodeTypes, visibleEdgeTypes, connectionRange]
  )
}

export const useMapActiveFiltersCount = (mapId: string) =>
  useMapUIStore((s) => {
    const m = s.getMapState(mapId)
    let count = 0
    if (m.visibleNodeTypes.size < ALL_NODE_TYPES.length) count++
    if (m.visibleEdgeTypes.size < ALL_EDGE_TYPES.length) count++
    if (m.connectionRange[0] !== 0 || m.connectionRange[1] !== Infinity) count++
    return count
  })

export const useMapConnectionPreset = (mapId: string): ConnectionPreset | null =>
  useMapUIStore((s) => {
    const { connectionRange } = s.getMapState(mapId)
    for (const [preset, range] of Object.entries(CONNECTION_PRESETS) as [ConnectionPreset, [number, number]][]) {
      if (connectionRange[0] === range[0] && connectionRange[1] === range[1]) {
        return preset
      }
    }
    return null
  })

// --- Per-map actions (stable callbacks bound to mapId) ---

export const useMapActions = (mapId: string) => {
  const setActiveTab = useCallback(
    (tab: MapSidebarTab) => useMapUIStore.getState().setActiveTab(mapId, tab),
    [mapId]
  )
  const setViewMode = useCallback(
    (mode: ViewMode) => useMapUIStore.getState().setViewMode(mapId, mode),
    [mapId]
  )
  const focusNode = useCallback(
    (nodeId: string) => useMapUIStore.getState().focusNode(mapId, nodeId),
    [mapId]
  )
  const clearFocus = useCallback(
    () => useMapUIStore.getState().clearFocus(mapId),
    [mapId]
  )
  const setFocusDepth = useCallback(
    (depth: number) => useMapUIStore.getState().setFocusDepth(mapId, depth),
    [mapId]
  )
  return useMemo(
    () => ({ setActiveTab, setViewMode, focusNode, clearFocus, setFocusDepth }),
    [setActiveTab, setViewMode, focusNode, clearFocus, setFocusDepth]
  )
}

// --- Global preference selectors ---

export const useSidebarOpen = () => useMapUIStore((s) => s.prefs.sidebarOpen)
export const useSidebarWidth = () => useMapUIStore((s) => s.prefs.sidebarWidth)
export const useShowMinimap = () => useMapUIStore((s) => s.prefs.showMinimap)
export const useNodeSpacing = () => useMapUIStore((s) => s.prefs.nodeSpacing)
export const useDirectionStrength = () => useMapUIStore((s) => s.prefs.directionStrength)
export const useAnimationDuration = () => useMapUIStore((s) => s.prefs.animationDuration)

export const useGlobalUIPrefs = () => {
  const sidebarWidth = useSidebarWidth()
  const sidebarOpen = useSidebarOpen()
  const showMinimap = useShowMinimap()
  const nodeSpacing = useNodeSpacing()
  const directionStrength = useDirectionStrength()
  const animationDuration = useAnimationDuration()
  return useMemo(
    () => ({ sidebarWidth, sidebarOpen, showMinimap, nodeSpacing, directionStrength, animationDuration }),
    [sidebarWidth, sidebarOpen, showMinimap, nodeSpacing, directionStrength, animationDuration]
  )
}
