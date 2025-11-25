import '@xyflow/react/dist/style.css'
import {
  addEdge,
  Background,
  type Connection,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow
} from '@xyflow/react'
import { Loader2 } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useFullMap } from '@/entities/map'
import { cn } from '@/shared/lib/cn'
import { Card } from '@/shared/ui/card'
import { transformEdgesToFlow, transformNodesToFlow } from '../lib/transform-data'
import { useGraphControls } from '../model/graph-controls.hooks'
import { useNodeSelection } from '../model/node-selection.hooks'
import { NodeDrawer } from '@/features/node-drawer'
import { GraphToolbar } from './graph-toolbar'
import { KnowledgeEdge } from './knowledge-edge'
import { KnowledgeNode } from './knowledge-node'

const nodeTypes = {
  knowledgeNode: KnowledgeNode
}

const edgeTypes = {
  knowledgeEdge: KnowledgeEdge
}

interface GraphVisualizationProps {
  mapId: string
  className?: string
  showMinimap?: boolean
  interactive?: boolean
}

function GraphVisualizationContent({
  mapId,
  className,
  interactive = true
}: GraphVisualizationProps) {
  const { t } = useTranslation()
  const { data: fullMap, isLoading, isError } = useFullMap(mapId)
  const { selectedElements, handleSelectionChange, clearSelection, selectedNodeId, selectNode } =
    useNodeSelection()
  const { controls, setZoom, toggleFullscreen, toggleMinimap } = useGraphControls()

  const { zoomIn, zoomOut, fitView } = useReactFlow()

  // Преобразуем узлы для XYFlow с обработчиком выбора
  const nodes = useMemo(() => {
    if (!fullMap) return []
    return transformNodesToFlow(fullMap.nodes, selectedElements.nodes, selectNode)
  }, [fullMap, selectedElements.nodes, selectNode])

  // Преобразуем связи для XYFlow
  const edges = useMemo(() => {
    if (!fullMap) return []
    return transformEdgesToFlow(fullMap.edges, selectedElements.edges)
  }, [fullMap, selectedElements.edges])

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState(nodes)
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState(edges)

  // Синхронизируем только при изменении ID узлов (не позиций!)
  useEffect(() => {
    const currentIds = reactFlowNodes.map(n => n.id).sort().join(',')
    const newIds = nodes.map(n => n.id).sort().join(',')

    // Обновляем только если изменился состав узлов
    if (currentIds !== newIds) {
      setNodes(nodes)
    }
  }, [nodes, reactFlowNodes, setNodes])

  useEffect(() => {
    const currentIds = reactFlowEdges.map(e => e.id).sort().join(',')
    const newIds = edges.map(e => e.id).sort().join(',')

    if (currentIds !== newIds) {
      setEdges(edges)
    }
  }, [edges, reactFlowEdges, setEdges])

  // Обработчик изменения узлов
  const handleNodesChange = useCallback(
    (changes: any) => {
      if (!interactive) return
      onNodesChange(changes)
    },
    [onNodesChange, interactive]
  )

  // Обработчик изменения связей
  const handleEdgesChange = useCallback(
    (changes: any) => {
      if (!interactive) return
      onEdgesChange(changes)
    },
    [onEdgesChange, interactive]
  )

  // Обработчик новых соединений
  const onConnect = useCallback(
    (params: Connection) => {
      if (!interactive) return
      setEdges(eds => addEdge({ ...params, type: 'knowledgeEdge' }, eds))
    },
    [setEdges, interactive]
  )

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    zoomIn()
    setZoom(controls.zoom + 10)
  }, [zoomIn, setZoom, controls.zoom])

  const handleZoomOut = useCallback(() => {
    zoomOut()
    setZoom(Math.max(10, controls.zoom - 10))
  }, [zoomOut, setZoom, controls.zoom])

  const handleCenter = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 })
  }, [fitView])

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center h-[600px]', className)}>
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">{t('graph.loading')}</p>
        </div>
      </div>
    )
  }

  if (isError || !fullMap) {
    return (
      <div className={cn('flex items-center justify-center h-[600px]', className)}>
        <Card className="p-8 text-center">
          <p className="text-lg font-semibold text-destructive mb-2">{t('graph.loadingError')}</p>
          <p className="text-muted-foreground">{t('graph.loadingErrorMessage')}</p>
        </Card>
      </div>
    )
  }

  const selectedNode = fullMap.nodes.find(n => n.id === selectedNodeId) || null

  return (
    <div
      className={cn(
        'relative bg-background rounded-lg border h-full w-full',
        controls.isFullscreen && 'fixed inset-4 z-50',
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
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-background"
        nodesDraggable={interactive}
        nodesConnectable={interactive}
        elementsSelectable={interactive}
        panOnDrag={interactive}
        zoomOnScroll={interactive}
        snapToGrid={interactive}
        snapGrid={[15, 15]}
      >
        <Background color="#e2e8f0" size={1} />

        {controls.showMinimap && (
          <MiniMap
            nodeColor={node => {
              switch (node.data?.type) {
                case 'concept':
                  return '#3b82f6'
                case 'theory':
                  return '#8b5cf6'
                case 'fact':
                  return '#10b981'
                default:
                  return '#64748b'
              }
            }}
            maskColor="rgb(0, 0, 0, 0.1)"
          />
        )}
      </ReactFlow>

      {/* Toolbar внизу */}
      <GraphToolbar
        zoom={controls.zoom}
        isFullscreen={controls.isFullscreen}
        showMinimap={controls.showMinimap}
        mapId={mapId}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenter={handleCenter}
        onToggleFullscreen={toggleFullscreen}
        onToggleMinimap={toggleMinimap}
      />

      {/* Node drawer */}
      <NodeDrawer node={selectedNode} edges={fullMap.edges} nodes={fullMap.nodes} onClose={clearSelection} />
    </div>
  )
}

export const GraphVisualization = memo((props: GraphVisualizationProps) => {
  return (
    <ReactFlowProvider>
      <GraphVisualizationContent {...props} />
    </ReactFlowProvider>
  )
})

GraphVisualization.displayName = 'GraphVisualization'
