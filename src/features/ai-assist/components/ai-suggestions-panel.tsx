import { Brain, Lightbulb, Link2, Loader2, Sparkles, Zap } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router'
import type { EnrichType } from '@/entities/ai'
import { useEnrichNode } from '@/entities/ai'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/card'
import { Separator } from '@/shared/components/separator'
import { SimilarNodesPanel } from './similar-nodes-panel'

interface AISuggestionsPanelProps {
  nodeId: string
  mapId: string
  onNodeClick?: (nodeId: string) => void
}

export const AISuggestionsPanel = ({ nodeId, mapId, onNodeClick }: AISuggestionsPanelProps) => {
  const { t } = useTranslation()
  const { mutate: enrichNode, isPending } = useEnrichNode()
  const [activeEnrichment, setActiveEnrichment] = useState<EnrichType | null>(null)

  const handleEnrich = (enrichType: EnrichType) => {
    setActiveEnrichment(enrichType)
    enrichNode(
      { nodeId, enrichType },
      {
        onSettled: () => {
          setActiveEnrichment(null)
        }
      }
    )
  }

  const isLoading = (type: EnrichType) => isPending && activeEnrichment === type

  return (
    <div className='w-full'>
      <div className='p-0'>
        <div className='flex items-center gap-2 mb-4'>
          <Brain className='w-5 h-5 text-primary' />
          <h3 className='font-semibold text-lg'>{t('ai.assistant')}</h3>
          <Badge variant='secondary' className='ml-auto'>
            {t('ai.beta')}
          </Badge>
        </div>

        <div className='space-y-2'>
          <Button
            variant='outline'
            size='sm'
            className='w-full justify-start'
            onClick={() => handleEnrich('description')}
            disabled={isPending}
          >
            {isLoading('description') ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <Sparkles className='w-4 h-4 mr-2' />
            )}
            {t('ai.improveDescription')}
          </Button>

          <Button
            variant='outline'
            size='sm'
            className='w-full justify-start'
            onClick={() => handleEnrich('examples')}
            disabled={isPending}
          >
            {isLoading('examples') ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <Lightbulb className='w-4 h-4 mr-2' />
            )}
            {t('ai.generateExamples')}
          </Button>

          <Button
            variant='outline'
            size='sm'
            className='w-full justify-start'
            onClick={() => handleEnrich('sources')}
            disabled={isPending}
          >
            {isLoading('sources') ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <Link2 className='w-4 h-4 mr-2' />
            )}
            {t('ai.findSources')}
          </Button>

          <Separator className='my-3' />

          <Button
            variant='default'
            size='sm'
            className='w-full'
            onClick={() => handleEnrich('all')}
            disabled={isPending}
          >
            {isLoading('all') ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <Brain className='w-4 h-4 mr-2' />
            )}
            {t('ai.enrichEverything')}
          </Button>
        </div>

        <Separator className='my-6' />

        <div className='mt-6'>
          <SimilarNodesPanel mapId={mapId} nodeId={nodeId} onNodeClick={onNodeClick} />
        </div>

        <Separator className='my-6' />

        <div className='mt-6'>
          <Button variant='default' size='sm' className='w-full' asChild>
            <RouterLink to={`/dashboard/maps/${mapId}/practice`}>
              <Zap className='w-4 h-4 mr-2' />
              {t('ai.startPractice')}
            </RouterLink>
          </Button>
        </div>

        <div className='mt-6'>
          <p className='text-xs text-muted-foreground mb-3'>{t('ai.quickTips')}</p>
          <Card>
            <CardHeader className='p-3'>
              <CardTitle className='text-sm'>{t('ai.smartSuggestions')}</CardTitle>
            </CardHeader>
            <CardContent className='p-3 pt-0'>
              <p className='text-xs text-muted-foreground'>
                {t('ai.smartSuggestionsDescription')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
