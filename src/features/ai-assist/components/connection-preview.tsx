import { ArrowRightIcon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/badge'
import type { ConnectionPreviewData } from '../model/ai-assist.types'
import { ProposalCard } from './proposal-card'

interface ConnectionPreviewProps {
  data: ConnectionPreviewData
  onRemove: () => void
  onSave: () => void
  isSaving?: boolean
}

export const ConnectionPreview = ({ data, onRemove, onSave, isSaving }: ConnectionPreviewProps) => {
  const { t } = useTranslation()

  return (
    <ProposalCard
      title={t('ai.proposal.connection', 'Create Connection')}
      onAccept={onSave}
      onReject={onRemove}
      isLoading={isSaving}
    >
      <div className='space-y-3'>
        <div className='flex items-center gap-2 text-sm'>
          <span className='font-medium'>{data.fromLabel}</span>
          <ArrowRightIcon className='h-4 w-4 text-muted-foreground' />
          <Badge variant='secondary'>{t(`graph.edgeTypes.${data.relation}`, data.relation)}</Badge>
          <ArrowRightIcon className='h-4 w-4 text-muted-foreground' />
          <span className='font-medium'>{data.toLabel}</span>
        </div>

        {data.reasoning && (
          <div>
            <span className='text-xs text-muted-foreground'>{t('ai.reasoning', 'Reasoning')}:</span>
            <p className='text-sm mt-1'>{data.reasoning}</p>
          </div>
        )}
      </div>
    </ProposalCard>
  )
}
