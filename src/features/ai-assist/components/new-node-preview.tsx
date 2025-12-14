import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/badge'
import type { NewNodePreviewData } from '../model/ai-assist.types'
import { ProposalCard } from './proposal-card'

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
      title={t('ai.proposal.newNode', 'Create New Node')}
      onAccept={onSave}
      onReject={onRemove}
      isLoading={isSaving}
    >
      <div className='space-y-2'>
        <div>
          <span className='text-xs text-muted-foreground'>Label:</span>
          <p className='font-medium'>{data.label}</p>
        </div>

        <div>
          <span className='text-xs text-muted-foreground'>Type:</span>
          <Badge variant='secondary' className='ml-2'>
            {data.nodeType}
          </Badge>
        </div>

        <div>
          <span className='text-xs text-muted-foreground'>Description:</span>
          <p className='text-sm'>{data.description}</p>
        </div>

        {data.connectTo && data.connectTo.length > 0 && (
          <div>
            <span className='text-xs text-muted-foreground'>Will connect to:</span>
            <div className='flex flex-wrap gap-1 mt-1'>
              {data.connectTo.map((conn, i) => (
                <Badge key={i} variant='outline' className='text-xs'>
                  {conn.nodeLabel} ({conn.relation})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProposalCard>
  )
}
