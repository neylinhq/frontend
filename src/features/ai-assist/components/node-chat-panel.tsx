import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Map, Target } from 'lucide-react'
import { useMap } from '@/entities/map'
import { useNode, useUpdateNode } from '@/entities/node'
import { Button } from '@/shared/components/button'
import { toast } from '@/shared/components/toast'
import type { ChatContext, EnrichmentPreviewData, MapChatContext, NodeChatContext, PreviewCard } from '../ai-assist.types'
import { nodeIntentHandlers } from '../lib/node-intent-handlers'
import { AIChatCore } from './ai-chat-core'

type ContextMode = 'node' | 'map'

interface NodeChatPanelProps {
  nodeId: string
  mapId: string
}

export const NodeChatPanel = ({ nodeId, mapId }: NodeChatPanelProps) => {
  const { t } = useTranslation()
  const { data: node } = useNode(mapId, nodeId)
  const { data: map } = useMap(mapId)
  const updateNodeMutation = useUpdateNode(mapId, nodeId)
  const [contextMode, setContextMode] = useState<ContextMode>('node')

  const nodeContext: NodeChatContext = {
    type: 'node',
    mapId,
    nodeId,
    nodeName: node?.label || '',
    nodeType: node?.type || '',
    description: node?.content || '',
    tags: node?.metadata?.tags || [],
    relatedNodes: []
  }

  const mapContext: MapChatContext = {
    type: 'map',
    mapId,
    mapName: map?.title || '',
    nodeCount: map?.nodeCount || 0
  }

  const context: ChatContext = contextMode === 'node' ? nodeContext : mapContext

  const handleSavePreview = async (_messageId: string, previewCard: PreviewCard) => {
    if (previewCard.type === 'enrichment') {
      const data = previewCard.data as EnrichmentPreviewData
      await updateNodeMutation.mutateAsync({
        content: data.proposed
      })

      toast.success(t('ai.enrichment.saved'), {
        description: t('ai.enrichment.savedDescription')
      })
    } else if (previewCard.type === 'exercise') {
      // Exercises are already saved during generation
      toast.success(t('ai.exercises.saved'), {
        description: t('ai.exercises.savedDescription')
      })
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Context Mode Toggle */}
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
        <Button
          variant={contextMode === 'node' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs"
          onClick={() => setContextMode('node')}
        >
          <Target className="h-3 w-3" />
          {t('ai.context.node', 'Node')}
        </Button>
        <Button
          variant={contextMode === 'map' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs"
          onClick={() => setContextMode('map')}
        >
          <Map className="h-3 w-3" />
          {t('ai.context.map', 'Map (RAG)')}
        </Button>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <AIChatCore
          context={context}
          intentHandlers={contextMode === 'node' ? nodeIntentHandlers : []}
          onSavePreview={handleSavePreview}
        />
      </div>
    </div>
  )
}
