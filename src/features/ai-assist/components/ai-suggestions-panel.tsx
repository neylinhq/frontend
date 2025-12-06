import { Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Separator } from '@/shared/components/separator'
import { AIChatPanel } from './ai-chat-panel'
import { SimilarNodesPanel } from './similar-nodes-panel'

interface AISuggestionsPanelProps {
  nodeId: string
  mapId: string
  onNodeClick?: (nodeId: string) => void
}

export const AISuggestionsPanel = ({ nodeId, mapId, onNodeClick }: AISuggestionsPanelProps) => {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col h-full min-h-0 w-full'>
      {/* Header */}
      <div className='flex items-center gap-2 p-4 pb-0'>
        <h3 className='font-semibold text-lg'>{t('ai.assistant')}</h3>
        <Badge variant='secondary' className='ml-auto'>
          {t('ai.beta')}
        </Badge>
      </div>

      {/* Chat Interface */}
      <div className='flex-1 min-h-0'>
        <AIChatPanel
          nodeId={nodeId}
          mapId={mapId}
          quickActions={['enrich', 'examples', 'sources', 'exercises']}
        />
      </div>

      <Separator className='my-4' />

      {/* Similar Nodes */}
      <div className='px-4'>
        <SimilarNodesPanel
          mapId={mapId}
          nodeId={nodeId}
          onNodeClick={onNodeClick}
        />
      </div>

      <Separator className='my-4' />

      {/* Start Practice Button */}
      <div className='px-4 pb-4'>
        <Button variant='default' size='sm' className='w-full' asChild>
          <RouterLink to={`/dashboard/maps/${mapId}/practice`}>
            <Zap className='w-4 h-4 mr-2' />
            {t('ai.startPractice')}
          </RouterLink>
        </Button>
      </div>
    </div>
  )
}
