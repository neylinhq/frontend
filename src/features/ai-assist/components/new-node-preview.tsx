import { useTranslation } from 'react-i18next'

import { Badge } from '@/shared/components/badge'
import { cn } from '@/shared/lib/cn'

import type { NewNodePreviewData } from '../model/ai-assist.types'
import { ProposalCard } from './proposal-card'

/** Node type colors - using theme tokens from globals.css */
const NODE_TYPE_COLORS: Record<string, string> = {
  concept: 'bg-node-concept-muted text-node-concept',
  fact: 'bg-node-fact-muted text-node-fact',
  theory: 'bg-node-theory-muted text-node-theory',
  example: 'bg-node-example-muted text-node-example',
  question: 'bg-node-question-muted text-node-question',
  hypothesis: 'bg-node-hypothesis-muted text-node-hypothesis',
  person: 'bg-node-person-muted text-node-person',
  school: 'bg-node-school-muted text-node-school'
}

interface NewNodePreviewProps {
  data: NewNodePreviewData
  onRemove: () => void
  onSave: () => void
  isSaving?: boolean
}

export const NewNodePreview = ({ data, onRemove, onSave, isSaving }: NewNodePreviewProps) => {
  const { t } = useTranslation()

  return (
    <ProposalCard
      title={t('ai.preview.newNode', 'Create New Node')}
      onAccept={onSave}
      onReject={onRemove}
      isLoading={isSaving}
    >
      <div className='space-y-2'>
        <div className='flex items-center justify-between gap-2'>
          <span className='font-medium'>{data.label}</span>
          <Badge
            variant='secondary'
            className={cn('text-xs font-medium', NODE_TYPE_COLORS[data.nodeType])}
          >
            {t(`nodeTypes.${data.nodeType}`, data.nodeType)}
          </Badge>
        </div>

        {data.description && <p className='text-sm text-muted-foreground'>{data.description}</p>}

        {data.connectTo && data.connectTo.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {data.connectTo.map((conn, i) => (
              <Badge key={i} variant='outline' className='text-xs'>
                → {conn.nodeLabel} ({conn.relation})
              </Badge>
            ))}
          </div>
        )}
      </div>
    </ProposalCard>
  )
}
