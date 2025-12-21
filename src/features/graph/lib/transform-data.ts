import type { Edge, Node } from '@/entities/map'
import type { EdgeTranslations } from './edge-translations'

interface TransformNodesOptions {
  selectedNodeIds?: Set<string> | string[]
  onSelect?: (id: string) => void
  focusedNodeId?: string | null
  animated?: boolean
  /** Zoom level to pass to node components for LOD */
  zoom?: number
}

/**
 * Transform domain nodes to ReactFlow nodes format.
 *
 * PERFORMANCE: zoom is passed to each node via data prop
 * to avoid useViewport() subscription in each KnowledgeNode component.
 */
export const transformNodesToFlow = (nodes: Node[], options: TransformNodesOptions = {}) => {
  const { selectedNodeIds = [], onSelect, focusedNodeId, animated, zoom = 1 } = options

  // Convert to Set for O(1) lookup if array passed
  const selectedSet = selectedNodeIds instanceof Set ? selectedNodeIds : new Set(selectedNodeIds)

  return nodes.map(node => {
    const isFocused = focusedNodeId === node.id
    return {
      id: node.id,
      type: 'knowledgeNode',
      position: node.position,
      // Add 'focused' class to wrapper for CSS animation
      className: isFocused ? 'focused' : undefined,
      data: {
        ...node,
        selected: selectedSet.has(node.id),
        isFocused,
        onSelect,
        zoom
      },
      // Smooth transition when layout changes
      style: animated ? { transition: 'transform 0.3s ease-out' } : undefined
    }
  })
}

interface TransformEdgesOptions {
  selectedEdgeIds?: Set<string> | string[]
  /** Zoom level to pass to edge components for LOD */
  zoom?: number
  /** Pre-computed translations for edge types */
  translations?: EdgeTranslations
  /** Callback for edge editing - passed to avoid store subscription in edge component */
  onStartEditing?: (edge: Edge, position: { x: number; y: number }) => void
}

/**
 * Transform domain edges to ReactFlow edges format.
 *
 * PERFORMANCE:
 * - zoom passed via data prop (avoids useViewport() per edge)
 * - translations passed via data prop (avoids useTranslation() per edge)
 * - onStartEditing callback passed (avoids store subscription per edge)
 */
export const transformEdgesToFlow = (edges: Edge[], options: TransformEdgesOptions = {}) => {
  const { selectedEdgeIds = [], zoom = 1, translations, onStartEditing } = options

  // Convert to Set for O(1) lookup if array passed
  const selectedSet = selectedEdgeIds instanceof Set ? selectedEdgeIds : new Set(selectedEdgeIds)

  return edges.map(edge => ({
    id: edge.id,
    type: 'knowledgeEdge',
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    data: {
      ...edge,
      selected: selectedSet.has(edge.id),
      zoom,
      translatedType: translations?.[edge.relationType],
      onStartEditing
    }
  }))
}
