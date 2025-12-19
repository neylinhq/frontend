import '@xyflow/react/dist/style.css'

import { useQueryClient } from '@tanstack/react-query'
import { Loading03Icon } from '@untitledui/icons-react/outline'
import {
  addEdge,
  Background,
  type Connection,
  type EdgeChange,
  MiniMap,
  type NodeChange,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow
} from '@xyflow/react'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type Edge,
  type FullMap,
  mapKeys,
  type Node,
  useCreateEdge,
  useDeleteEdge,
  useFullMap,
  useUpdateNodePosition,
  useUpdateNodePositions
} from '@/entities/map'
import { cssVarToHex, getNodeColorHex } from '@/features/graph-webgl/lib/theme-bridge'
import { Card } from '@/shared/components/card'
import { useDarkMode } from '@/shared/hooks'
import { cn } from '@/shared/lib/cn'
import { type EdgeTranslations, getEdgeTranslations } from '../lib/edge-translations'
import { applyLayout } from '../lib/layout-algorithms-optimized'
import { transformEdgesToFlow, transformNodesToFlow } from '../lib/transform-data'
import { useGraphControls } from '../model/graph.controls.hooks'
import { useFilteredGraphData } from '../model/graph.data.hooks'
import { useEdgeManagementStore } from '../model/graph.edge.store'
import { useGraphKeyboard } from '../model/graph.keyboard.hooks'
import { easeOutCubic, useAnimatedLayout } from '../model/graph.layout.hooks'
import { useLayoutHistory } from '../model/graph.layout-history.store'
import { useNodeSelection } from '../model/graph.selection.hooks'
import {
  layoutEvent,
  useFilters,
  useFocusMode,
  useGraphUI,
  useNodeSpacing,
  useViewMode
} from '../model/graph.store'
import { useDebouncedZoom } from '../model/graph.zoom.hooks'
import { EdgeEditPopover } from './edge-edit-popover'
import { EdgeTypeSelector } from './edge-type-selector'
import { GraphToolbar } from './graph-toolbar'
import { KnowledgeEdge } from './knowledge-edge'
import { KnowledgeNode } from './knowledge-node'
import { NodeDrawer } from './node-drawer'
import { ViewControlsPanel } from './view-controls-panel'

const nodeTypes = {
  knowledgeNode: KnowledgeNode
}

const edgeTypes = {
  knowledgeEdge: KnowledgeEdge
}

interface GraphVisualizationProps {
  mapId: string
  className?: string
  interactive?: boolean
  initialData?: FullMap
  /** Render prop for connections panel - injected by widget to avoid cross-feature import */
  renderConnectionsPanel?: (
    node: Node,
    edges: Edge[],
    allNodes: Node[],
    onOpenNode?: (id: string) => void,
    onPanToNode?: (id: string) => void,
    onEditEdge?: (edge: Edge) => void,
    onDeleteEdge?: (edgeId: string) => void
  ) => React.ReactNode
}

const GraphVisualizationContent = ({
  mapId,
  className,
  interactive = true,
  initialData,
  renderConnectionsPanel
}: GraphVisualizationProps) => {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  // Always use React Query for reactivity - initialData is for SSR hydration
  const { data: fullMap, isLoading, isError } = useFullMap(mapId, { initialData })
  const { selectedElements, handleSelectionChange, clearSelection, selectedNodeId, selectNode } =
    useNodeSelection()
  const { controls, toggleFullscreen } = useGraphControls()
  const layoutAppliedRef = useRef(false)

  // PERFORMANCE: Cache edge translations to avoid calling t() in each edge component
  const edgeTranslations = useMemo<EdgeTranslations>(
    () => getEdgeTranslations(t, i18n.language),
    [t, i18n.language]
  )

  // Ref for stable callback to avoid re-renders
  const handleNodeClickRef = useRef<(nodeId: string) => void>(() => {})

  // Mutations for persisting positions to DB
  const updatePositionMutation = useUpdateNodePosition(mapId)
  const updatePositionsMutation = useUpdateNodePositions(mapId)
  useCreateEdge(mapId)
  const deleteEdgeMutation = useDeleteEdge(mapId)

  // Edge management store (needed early for handleEditEdge)
  const { pendingEdge, startEdgeCreation, cancelEdgeCreation, startEdgeEditing } =
    useEdgeManagementStore()

  const { zoomIn, zoomOut, fitView, setCenter, getNode, screenToFlowPosition, getViewport } =
    useReactFlow()

  // PERFORMANCE: Debounced zoom for node/edge data updates
  // Updates only after interaction stops, preventing cascade re-renders during pan/zoom
  const {
    zoom: debouncedZoom,
    rawZoom: viewportZoom,
    isInteracting
  } = useDebouncedZoom({
    debounceMs: 100,
    skipDuringInteraction: true
  })

  // Pan to a specific node with optional zoom override
  const handlePanToNode = useCallback(
    (nodeId: string, zoomOverride?: number) => {
      const node = getNode(nodeId)
      if (node) {
        const x = node.position.x + (node.measured?.width ?? 200) / 2
        const y = node.position.y + (node.measured?.height ?? 100) / 2
        const targetZoom = zoomOverride ?? viewportZoom
        setCenter(x, y, { zoom: targetZoom, duration: layoutParamsRef.current.animationDuration })
      }
    },
    [getNode, setCenter, viewportZoom]
  )

  // Store hooks for view settings
  const { viewMode } = useViewMode()
  const { focusedNodeId, focusDepth, focusNode } = useFocusMode()

  // Pan to node and zoom in (for connections panel eye icon)
  // Does NOT enable focus mode - just centers on the node
  const handlePanToNodeWithZoom = useCallback(
    (nodeId: string) => {
      handlePanToNode(nodeId, 1) // Zoom to 100%
    },
    [handlePanToNode]
  )

  // Edit edge from connections panel - opens EdgeEditPopover
  const handleEditEdge = useCallback(
    (edge: Edge) => {
      // Position popover at center of viewport
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      startEdgeEditing(edge, { x: centerX, y: centerY })
    },
    [startEdgeEditing]
  )

  // Delete edge from connections panel
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      deleteEdgeMutation.mutate(edgeId)
    },
    [deleteEdgeMutation]
  )

  const { visibleNodeTypes, visibleEdgeTypes, connectionRange } = useFilters()
  const { showMinimap } = useGraphUI()
  const { nodeSpacing, directionStrength, animationDuration } = useNodeSpacing()
  const { animateToPositions } = useAnimatedLayout()
  const { saveSnapshot, undo, redo } = useLayoutHistory()

  // Track dark mode for theme-aware styling
  const isDark = useDarkMode()

  // Use refs for layout params to avoid stale closures when triggerLayout fires
  const layoutParamsRef = useRef({
    nodeSpacing,
    viewMode,
    focusedNodeId,
    directionStrength,
    animationDuration
  })
  layoutParamsRef.current = {
    nodeSpacing,
    viewMode,
    focusedNodeId,
    directionStrength,
    animationDuration
  }

  // Get filtered data and counts using extracted hook
  const { filteredData, nodeCountsByType, edgeCountsByType, connectionStats } =
    useFilteredGraphData({
      fullMap,
      visibleNodeTypes,
      visibleEdgeTypes,
      connectionRange,
      viewMode,
      focusedNodeId,
      focusDepth
    })

  // Handle node click:
  // - In focus mode → focus on clicked node (change focus target)
  // - In overview mode → just open drawer
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (viewMode === 'focus') {
        focusNode(nodeId)
      }
      selectNode(nodeId)
    },
    [viewMode, focusNode, selectNode]
  )

  // Keep ref updated for stable callback in useMemo
  handleNodeClickRef.current = handleNodeClick

  // Stable callback wrapper that doesn't change reference
  const stableHandleNodeClick = useCallback((nodeId: string) => {
    handleNodeClickRef.current(nodeId)
  }, [])

  // PERFORMANCE: Stable callback ref for edge editing to avoid re-renders
  const handleEdgeStartEditingRef = useRef<
    (edge: Edge, position: { x: number; y: number }) => void
  >(() => {})
  handleEdgeStartEditingRef.current = startEdgeEditing

  const stableHandleEdgeStartEditing = useCallback(
    (edge: Edge, position: { x: number; y: number }) => {
      handleEdgeStartEditingRef.current(edge, position)
    },
    []
  )

  // Transform nodes for XYFlow - use stable callback to avoid re-renders
  // PERFORMANCE: Pass debounced zoom via data prop to avoid useViewport() in each node
  const initialNodes = useMemo(() => {
    return transformNodesToFlow(filteredData.nodes, {
      selectedNodeIds: selectedElements.nodes,
      onSelect: stableHandleNodeClick,
      focusedNodeId,
      zoom: debouncedZoom
    })
  }, [
    filteredData.nodes,
    selectedElements.nodes,
    stableHandleNodeClick,
    focusedNodeId,
    debouncedZoom
  ])

  // Transform edges for XYFlow
  // PERFORMANCE: Pass debounced zoom, translations, and callback via data prop
  const initialEdges = useMemo(() => {
    return transformEdgesToFlow(filteredData.edges, {
      selectedEdgeIds: selectedElements.edges,
      zoom: debouncedZoom,
      translations: edgeTranslations,
      onStartEditing: stableHandleEdgeStartEditing
    })
  }, [
    filteredData.edges,
    selectedElements.edges,
    debouncedZoom,
    edgeTranslations,
    stableHandleEdgeStartEditing
  ])

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Ref to access current nodes without causing re-renders
  const reactFlowNodesRef = useRef(reactFlowNodes)
  reactFlowNodesRef.current = reactFlowNodes

  // Cache ALL node positions (including hidden nodes) to preserve layout when depth changes
  const positionCacheRef = useRef<Map<string, { x: number; y: number }>>(new Map())

  // Find the node closest to the viewport center
  const getClosestNodeToViewportCenter = useCallback(() => {
    if (reactFlowNodes.length === 0) {
      return null
    }

    // Get viewport center in screen coordinates and convert to flow coordinates
    const centerScreenX = window.innerWidth / 2
    const centerScreenY = window.innerHeight / 2
    const centerInFlow = screenToFlowPosition({ x: centerScreenX, y: centerScreenY })

    let closestNodeId: string | null = null
    let minDist = Infinity

    for (const node of reactFlowNodes) {
      const nodeCenterX = node.position.x + (node.measured?.width ?? 200) / 2
      const nodeCenterY = node.position.y + (node.measured?.height ?? 100) / 2
      const dist = Math.hypot(centerInFlow.x - nodeCenterX, centerInFlow.y - nodeCenterY)
      if (dist < minDist) {
        minDist = dist
        closestNodeId = node.id
      }
    }

    return closestNodeId
  }, [reactFlowNodes, screenToFlowPosition])

  // Get the appropriate anchor node based on current view mode
  const getAnchorNodeId = useCallback(() => {
    // TODO: Consider anchoring to focused node in focus mode
    // Currently disabled because user might explore far from focused node,
    // and layout changes would jump camera back unexpectedly
    // const params = layoutParamsRef.current
    // if (params.viewMode === 'focus' && params.focusedNodeId) {
    //   return params.focusedNodeId
    // }

    // Always anchor to the node closest to viewport center
    return getClosestNodeToViewportCenter()
  }, [getClosestNodeToViewportCenter])

  // Apply auto-layout function - uses ref to get latest params when triggered by store events
  const doApplyLayout = useCallback(
    (shouldFitView = true, anchorNodeId?: string | null, animated = false) => {
      if (reactFlowNodes.length === 0) {
        return
      }

      // Save snapshot before layout change (for undo)
      const currentPositions = new Map<string, { x: number; y: number }>()
      for (const node of reactFlowNodes) {
        currentPositions.set(node.id, { x: node.position.x, y: node.position.y })
      }
      saveSnapshot(currentPositions)

      const params = layoutParamsRef.current
      const result = applyLayout(reactFlowNodes, reactFlowEdges, {
        viewMode: params.viewMode,
        focusedNodeId: params.focusedNodeId,
        spacingPercent: params.nodeSpacing,
        directionStrength: params.directionStrength
      })

      // Update position cache with new layout
      for (const node of result.nodes) {
        positionCacheRef.current.set(node.id, { ...node.position })
      }

      // Persist all new positions to DB (batch update)
      const positionUpdates = result.nodes.map(n => ({
        id: n.id,
        position: { x: Math.round(n.position.x), y: Math.round(n.position.y) }
      }))
      updatePositionsMutation.mutate(positionUpdates)

      if (animated) {
        // Smooth animation with synchronized camera
        const duration = layoutParamsRef.current.animationDuration
        animateToPositions(reactFlowNodes, result.nodes, anchorNodeId ?? null, {
          duration,
          easing: easeOutCubic
        })
        // If no anchor but need to fit view, do it after animation completes
        if (!anchorNodeId && shouldFitView) {
          setTimeout(() => fitView({ padding: 0.2, duration }), duration + 50)
        }
      } else {
        // Instant update
        setNodes(result.nodes)
        const instantDuration = params.animationDuration
        if (anchorNodeId) {
          const anchorNode = result.nodes.find(n => n.id === anchorNodeId)
          if (anchorNode) {
            const x = anchorNode.position.x + (anchorNode.measured?.width ?? 200) / 2
            const y = anchorNode.position.y + (anchorNode.measured?.height ?? 100) / 2
            setCenter(x, y, { zoom: viewportZoom, duration: instantDuration })
          }
        } else if (shouldFitView) {
          fitView({ padding: 0.2, duration: instantDuration })
        }
      }
    },
    [
      reactFlowNodes,
      reactFlowEdges,
      setNodes,
      fitView,
      setCenter,
      viewportZoom,
      animateToPositions,
      updatePositionsMutation,
      saveSnapshot
    ]
  )

  // Apply initial layout when nodes are first loaded
  // TODO: When real backend exists, check if positions are valid and skip layout
  useEffect(() => {
    if (!layoutAppliedRef.current && initialNodes.length > 0 && fullMap) {
      layoutAppliedRef.current = true

      // Check if nodes already have valid spread positions from backend
      const hasValidPositions =
        initialNodes.some(n => n.position.x !== 0 || n.position.y !== 0) &&
        (() => {
          let minX = Infinity,
            maxX = -Infinity
          let minY = Infinity,
            maxY = -Infinity
          for (const n of initialNodes) {
            minX = Math.min(minX, n.position.x)
            maxX = Math.max(maxX, n.position.x)
            minY = Math.min(minY, n.position.y)
            maxY = Math.max(maxY, n.position.y)
          }
          const width = maxX - minX
          const height = maxY - minY
          // Valid if spread is reasonable and not too vertical (aspect ratio < 5)
          return Math.max(width, height) > 100 && (width === 0 || height / width < 5)
        })()

      if (hasValidPositions) {
        // Use saved positions from backend
        for (const node of initialNodes) {
          positionCacheRef.current.set(node.id, { ...node.position })
        }
        setNodes(initialNodes)
        // Fit view on initial load only
        setTimeout(() => fitView({ padding: 0.2, duration: 0 }), 0)
      } else {
        // Apply fresh layout and save to backend (ignore broken positions)
        const result = applyLayout(initialNodes, initialEdges, {
          viewMode,
          focusedNodeId,
          spacingPercent: nodeSpacing,
          directionStrength,
          ignoreExistingPositions: true
        })
        // Populate position cache with initial layout
        for (const node of result.nodes) {
          positionCacheRef.current.set(node.id, { ...node.position })
        }
        setNodes(result.nodes)

        // Persist calculated positions to backend (bulk update)
        const positionUpdates = result.nodes.map(n => ({
          id: n.id,
          position: { x: Math.round(n.position.x), y: Math.round(n.position.y) }
        }))
        updatePositionsMutation.mutate(positionUpdates)

        // Fit view on initial load only
        setTimeout(() => fitView({ padding: 0.2, duration: 0 }), 0)
      }
    }
  }, [
    initialNodes.length,
    fullMap,
    initialNodes,
    initialEdges,
    viewMode,
    focusedNodeId,
    nodeSpacing,
    directionStrength,
    setNodes,
    updatePositionsMutation,
    fitView
  ])

  // Listen for layout events from the store
  useEffect(() => {
    const handleLayoutEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        fitView?: boolean
        useAnchor?: boolean
        animated?: boolean
      }>
      const shouldFitView = customEvent.detail?.fitView ?? true
      const useAnchor = customEvent.detail?.useAnchor ?? false
      const animated = customEvent.detail?.animated ?? false

      // Use smart anchor selection (focus mode = focused node, overview = closest to center)
      const anchorNodeId = useAnchor ? getAnchorNodeId() : null
      doApplyLayout(shouldFitView, anchorNodeId, animated)
    }

    layoutEvent.addEventListener('layout', handleLayoutEvent)
    return () => layoutEvent.removeEventListener('layout', handleLayoutEvent)
  }, [doApplyLayout, getAnchorNodeId])

  // Sync nodes when filtered data changes (including node properties like label, type, etc.)
  const prevNodeHashRef = useRef<string>('')
  useEffect(() => {
    // Create hash from node IDs AND their data properties
    const nodeHash = initialNodes
      .map(n => {
        const data = n.data || {}
        return `${n.id}:${data.label}:${data.type}:${data.description}:${JSON.stringify(data.metadata?.tags)}`
      })
      .sort()
      .join('|')
    if (prevNodeHashRef.current !== nodeHash) {
      // Always update cache with current visible node positions before any changes
      for (const node of reactFlowNodes) {
        positionCacheRef.current.set(node.id, { ...node.position })
      }

      // Always preserve positions from cache when nodes change (mode switch, filter change, etc.)
      // Only apply fresh layout via explicit re-layout button
      const mergedNodes = initialNodes.map(node => ({
        ...node,
        position: positionCacheRef.current.get(node.id) ?? node.position
      }))
      setNodes(mergedNodes)
      prevNodeHashRef.current = nodeHash
    }
  }, [initialNodes, reactFlowNodes, setNodes])

  // Sync edges when data changes (including edge properties like relationType, label, etc.)
  const prevEdgeHashRef = useRef<string>('')
  useEffect(() => {
    // Create hash from edge IDs AND their data properties
    const edgeHash = initialEdges
      .map(e => {
        const data = e.data || {}
        return `${e.id}:${data.relationType}:${data.label}:${data.strength}:${data.bidirectional}`
      })
      .sort()
      .join('|')
    if (prevEdgeHashRef.current !== edgeHash) {
      setEdges(initialEdges)
    }
    prevEdgeHashRef.current = edgeHash
  }, [initialEdges, setEdges])

  // Handle node changes
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (!interactive) {
        return
      }
      onNodesChange(changes)
    },
    [onNodesChange, interactive]
  )

  // Handle edge changes
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (!interactive) {
        return
      }
      onEdgesChange(changes)
    },
    [onEdgesChange, interactive]
  )

  // Handle new connections - show type selector instead of creating immediately
  const onConnect = useCallback(
    (params: Connection) => {
      if (!interactive || !params.source || !params.target) {
        return
      }

      // Find nodes to get labels
      const sourceNode = fullMap?.nodes.find(n => n.id === params.source)
      const targetNode = fullMap?.nodes.find(n => n.id === params.target)

      if (!sourceNode || !targetNode) {
        return
      }

      // Find flow nodes to calculate position
      const sourceFlowNode = reactFlowNodes.find(n => n.id === params.source)
      const targetFlowNode = reactFlowNodes.find(n => n.id === params.target)

      if (!sourceFlowNode || !targetFlowNode) {
        return
      }

      // Optimistic update - show temporary edge with full data structure
      const tempEdgeId = `temp-${Date.now()}`
      setEdges(eds =>
        addEdge(
          {
            ...params,
            id: tempEdgeId,
            type: 'knowledgeEdge',
            data: {
              selected: false,
              id: tempEdgeId,
              mapId,
              sourceNodeId: params.source,
              targetNodeId: params.target,
              relationType: 'related-to' as const,
              strength: 1,
              bidirectional: false,
              metadata: { confidence: 0.5, createdBy: 'user' as const },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          },
          eds
        )
      )

      // Calculate midpoint for selector position (in flow coordinates)
      const midX = (sourceFlowNode.position.x + targetFlowNode.position.x) / 2 + 110
      const midY = (sourceFlowNode.position.y + targetFlowNode.position.y) / 2 + 40

      // Convert flow coordinates to screen coordinates
      const viewportTopLeft = screenToFlowPosition({ x: 0, y: 0 })
      const screenPosition = {
        x: (midX - viewportTopLeft.x) * viewportZoom,
        y: (midY - viewportTopLeft.y) * viewportZoom
      }

      // Open type selector
      startEdgeCreation({
        sourceId: params.source,
        targetId: params.target,
        sourceLabel: sourceNode.label,
        targetLabel: targetNode.label,
        position: screenPosition
      })
    },
    [
      setEdges,
      interactive,
      fullMap,
      reactFlowNodes,
      screenToFlowPosition,
      viewportZoom,
      startEdgeCreation,
      mapId
    ]
  )

  // Handle edge creation cancel - remove optimistic edge
  const handleEdgeCreationCancel = useCallback(() => {
    if (pendingEdge) {
      setEdges(eds =>
        eds.filter(e => !(e.source === pendingEdge.sourceId && e.target === pendingEdge.targetId))
      )
    }
  }, [pendingEdge, setEdges])

  // Handle edge creation complete
  const handleEdgeCreationComplete = useCallback(() => {
    // Refetch to get the real edge data
    queryClient.invalidateQueries({ queryKey: mapKeys.fullMap(mapId) })
  }, [queryClient, mapId])

  // Helper to get current positions as Map - uses ref for stable callback
  const getCurrentPositionsMap = useCallback(() => {
    const positions = new Map<string, { x: number; y: number }>()
    for (const node of reactFlowNodesRef.current) {
      positions.set(node.id, { x: node.position.x, y: node.position.y })
    }
    return positions
  }, [])

  // Save position to DB after drag ends
  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: { id: string; position: { x: number; y: number } }) => {
      if (!interactive) {
        return
      }
      // Save snapshot before the drag (for undo)
      saveSnapshot(getCurrentPositionsMap())

      // Persist position to DB (fire-and-forget, optimistic)
      updatePositionMutation.mutate({
        id: node.id,
        position: { x: Math.round(node.position.x), y: Math.round(node.position.y) }
      })
    },
    [interactive, updatePositionMutation, saveSnapshot, getCurrentPositionsMap]
  )

  // Undo handler - restore previous layout snapshot
  const handleUndo = useCallback(() => {
    const snapshot = undo()
    if (snapshot) {
      setNodes(nodes =>
        nodes.map(node => {
          const pos = snapshot.positions.get(node.id)
          return pos ? { ...node, position: pos } : node
        })
      )
      // Persist restored positions to DB
      const updates = Array.from(snapshot.positions.entries()).map(([id, position]) => ({
        id,
        position: { x: Math.round(position.x), y: Math.round(position.y) }
      }))
      updatePositionsMutation.mutate(updates)
    }
  }, [undo, setNodes, updatePositionsMutation])

  // Redo handler - restore next layout snapshot
  const handleRedo = useCallback(() => {
    const snapshot = redo()
    if (snapshot) {
      setNodes(nodes =>
        nodes.map(node => {
          const pos = snapshot.positions.get(node.id)
          return pos ? { ...node, position: pos } : node
        })
      )
      // Persist restored positions to DB
      const updates = Array.from(snapshot.positions.entries()).map(([id, position]) => ({
        id,
        position: { x: Math.round(position.x), y: Math.round(position.y) }
      }))
      updatePositionsMutation.mutate(updates)
    }
  }, [redo, setNodes, updatePositionsMutation])

  // Keyboard shortcuts (must be after handlers are defined)
  useGraphKeyboard({
    selectedNodeId,
    onFitView: () => fitView({ padding: 0.2, duration: layoutParamsRef.current.animationDuration }),
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    onUndo: handleUndo,
    onRedo: handleRedo,
    enabled: interactive
  })

  // Zoom handlers - use ReactFlow's built-in zoom
  const handleZoomIn = useCallback(() => {
    zoomIn()
  }, [zoomIn])

  const handleZoomOut = useCallback(() => {
    zoomOut()
  }, [zoomOut])

  const handleCenter = useCallback(() => {
    const duration = layoutParamsRef.current.animationDuration
    if (reactFlowNodes.length === 0) {
      fitView({ padding: 0.2, duration })
      return
    }

    // Calculate geometric center of all nodes (canvas center)
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity
    for (const node of reactFlowNodes) {
      const w = node.measured?.width ?? 200
      const h = node.measured?.height ?? 100
      minX = Math.min(minX, node.position.x)
      maxX = Math.max(maxX, node.position.x + w)
      minY = Math.min(minY, node.position.y)
      maxY = Math.max(maxY, node.position.y + h)
    }
    const canvasCenterX = (minX + maxX) / 2
    const canvasCenterY = (minY + maxY) / 2

    // Find node closest to canvas center
    let closestNodeId: string | null = null
    let minDist = Infinity
    for (const node of reactFlowNodes) {
      const nodeCenterX = node.position.x + (node.measured?.width ?? 200) / 2
      const nodeCenterY = node.position.y + (node.measured?.height ?? 100) / 2
      const dist = Math.hypot(canvasCenterX - nodeCenterX, canvasCenterY - nodeCenterY)
      if (dist < minDist) {
        minDist = dist
        closestNodeId = node.id
      }
    }

    if (closestNodeId) {
      const node = getNode(closestNodeId)
      if (node) {
        const x = node.position.x + (node.measured?.width ?? 200) / 2
        const y = node.position.y + (node.measured?.height ?? 100) / 2
        setCenter(x, y, { zoom: viewportZoom, duration })
        return
      }
    }

    fitView({ padding: 0.2, duration })
  }, [reactFlowNodes, getNode, setCenter, viewportZoom, fitView])

  // Show loading only when fetching client-side (no initialData)
  if (!initialData && isLoading) {
    return (
      <div className={cn('flex items-center justify-center h-[600px]', className)}>
        <div className='text-center space-y-3'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto text-primary' />
          <p className='text-sm text-muted-foreground'>{t('graph.loading')}</p>
        </div>
      </div>
    )
  }

  if (!initialData && (isError || !fullMap)) {
    return (
      <div className={cn('flex items-center justify-center h-[600px]', className)}>
        <Card className='p-8 text-center'>
          <p className='text-lg font-semibold text-destructive mb-2'>{t('graph.loadingError')}</p>
          <p className='text-muted-foreground'>{t('graph.loadingErrorMessage')}</p>
        </Card>
      </div>
    )
  }

  // At this point fullMap is guaranteed to be defined (either from initialData or fetchedMap)
  if (!fullMap) {
    return null
  }

  const selectedNode = fullMap.nodes.find(n => n.id === selectedNodeId) || null

  return (
    <div
      className={cn(
        'relative bg-background',
        controls.isFullscreen ? 'fixed inset-0 z-50 !w-screen !h-screen' : 'h-full w-full',
        className
      )}
    >
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onSelectionChange={handleSelectionChange}
        onNodeClick={(_event, node) => handleNodeClick(node.id)}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitViewOptions={{ padding: 0.2 }}
        className={cn('bg-background', isInteracting && 'interacting')}
        nodesDraggable={interactive}
        nodesConnectable={interactive}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        snapToGrid={interactive}
        snapGrid={[15, 15]}
        minZoom={0.01}
        maxZoom={5}
        defaultViewport={{ x: 0, y: 0, zoom: 2.5 }}
        onlyRenderVisibleElements={true}
        proOptions={{ hideAttribution: true }}
      >
        <Background color={cssVarToHex('canvas-grid')} size={1} />

        {showMinimap && (
          <MiniMap
            nodeColor={node => getNodeColorHex(node.data?.type ?? 'concept')}
            className='!bg-background border border-border'
            maskColor={`oklch(var(--${isDark ? 'overlay' : 'overlay-light'}))`}
            pannable
            zoomable
            onClick={(_event, position) =>
              setCenter(position.x, position.y, {
                zoom: viewportZoom,
                duration: layoutParamsRef.current.animationDuration
              })
            }
          />
        )}
      </ReactFlow>

      {/* View controls panel - top left */}
      <ViewControlsPanel
        mapId={mapId}
        mapTitle={fullMap?.title}
        zoom={Math.round(viewportZoom * 100)}
        isFullscreen={controls.isFullscreen}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenter={handleCenter}
        onToggleFullscreen={toggleFullscreen}
        nodes={fullMap?.nodes}
        onNodeSelect={node => {
          selectNode(node.id)
          // Zoom to 100% when selecting from search for better visibility
          handlePanToNode(node.id, 1)
        }}
      />

      {/* Toolbar - view modes, focus controls, filters */}
      <GraphToolbar
        nodeCountsByType={nodeCountsByType}
        edgeCountsByType={edgeCountsByType}
        connectionStats={connectionStats}
        selectedNodeId={selectedNodeId}
        canEdit={interactive}
      />

      {/* Node drawer */}
      <NodeDrawer
        node={selectedNode}
        onClose={clearSelection}
        isReadOnly={!interactive}
        connectionsCount={
          selectedNode
            ? fullMap.edges.filter(
                e => e.sourceNodeId === selectedNode.id || e.targetNodeId === selectedNode.id
              ).length
            : 0
        }
        connectionsTab={
          selectedNode &&
          renderConnectionsPanel?.(
            selectedNode,
            fullMap.edges,
            fullMap.nodes,
            selectNode,
            handlePanToNodeWithZoom, // Pan to node and zoom (no focus mode)
            interactive ? handleEditEdge : undefined,
            interactive ? handleDeleteEdge : undefined
          )
        }
      />

      {/* Edge type selector - appears when creating new edge */}
      <EdgeTypeSelector
        mapId={mapId}
        onCancel={handleEdgeCreationCancel}
        onComplete={handleEdgeCreationComplete}
      />

      {/* Edge edit popover - appears when clicking on edge badge */}
      {interactive && <EdgeEditPopover mapId={mapId} />}
    </div>
  )
}

export const GraphVisualization = memo((props: GraphVisualizationProps) => {
  // Note: ReactFlowProvider should be provided by parent (e.g., MapViewPage)
  // to allow sibling components (like QuickAddDialog) to access ReactFlow context
  return <GraphVisualizationContent {...props} />
})

GraphVisualization.displayName = 'GraphVisualization'
