import { Brain, Lightbulb, Link2, Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { EnrichType } from '@/entities/ai'
import { useEnrichNode } from '@/entities/ai'
import { Badge } from '@/shared/components/badge'
import { Button } from '@/shared/components/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/card'
import { Separator } from '@/shared/components/separator'
import { SimilarNodesPanel } from './similar-nodes-panel'

interface AISuggestionsPanelProps {
  nodeId: string
  mapId: string
  onNodeClick?: (nodeId: string) => void
}

export const AISuggestionsPanel = ({ nodeId, mapId, onNodeClick }: AISuggestionsPanelProps) => {
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
    <aside className='w-80 border-l border-border bg-background'>
      <div className='sticky top-0 p-4'>
        <div className='flex items-center gap-2 mb-4'>
          <Brain className='w-5 h-5 text-primary' />
          <h3 className='font-semibold text-lg'>AI Assistant</h3>
          <Badge variant='secondary' className='ml-auto'>
            Beta
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
            Improve Description
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
            Generate Examples
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
            Find Sources
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
            Enrich Everything
          </Button>
        </div>

        <Separator className='my-6' />

        <div className='mt-6'>
          <SimilarNodesPanel mapId={mapId} nodeId={nodeId} onNodeClick={onNodeClick} />
        </div>

        <div className='mt-6'>
          <p className='text-xs text-muted-foreground mb-3'>Quick Tips</p>
          <Card>
            <CardHeader className='p-3'>
              <CardTitle className='text-sm'>Smart Suggestions</CardTitle>
            </CardHeader>
            <CardContent className='p-3 pt-0'>
              <p className='text-xs text-muted-foreground'>
                AI will analyze surrounding nodes to provide contextual improvements
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </aside>
  )
}
