import { Brain, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNode } from '@/entities/node'
import { Badge } from '@/shared/components/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/shared/components/collapsible'
import { cn } from '@/shared/lib/cn'

interface ContextIndicatorProps {
  nodeId: string
  mapId: string
}

export const ContextIndicator = ({ nodeId, mapId }: ContextIndicatorProps) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: node } = useNode(mapId, nodeId)

  if (!node) {
    return null
  }

  const contextLabel = node.label || t('nodeEdit.untitledPlaceholder')

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <button type='button' className='flex items-center gap-2 w-full px-3 py-2 bg-muted/30 rounded-md border border-border/50 hover:bg-muted/50 transition-colors'>
          <Badge variant='secondary' className='flex items-center gap-1 text-xs'>
            <Brain className='h-3 w-3' />
            {t('ai.chat.contextLabel')}
          </Badge>
          <span className='text-xs text-muted-foreground truncate flex-1 text-left'>
            {contextLabel}
          </span>
          <ChevronDown
            className={cn(
              'h-3 w-3 text-muted-foreground transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className='mt-2'>
        <div className='p-3 bg-muted/20 rounded-md text-xs space-y-2 border border-border/30'>
          <div>
            <span className='text-muted-foreground'>Type:</span>{' '}
            <span className='font-medium'>{node.type}</span>
          </div>

          {node.tags && node.tags.length > 0 && (
            <div>
              <span className='text-muted-foreground'>Tags:</span>{' '}
              <span className='font-medium'>{node.tags.join(', ')}</span>
            </div>
          )}

          {node.content && (
            <div>
              <span className='text-muted-foreground'>Description:</span>
              <p className='mt-1 text-muted-foreground/80 line-clamp-3'>
                {node.content.substring(0, 200)}
                {node.content.length > 200 && '...'}
              </p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
