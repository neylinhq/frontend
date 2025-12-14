import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/badge'
import { cn } from '@/shared/lib/cn'
import type { NewNodePreviewData } from '../model/ai-assist.types'
import { ProposalCard } from './proposal-card'

/** Node type colors - same as node-edit-page.tsx */
const NODE_TYPE_COLORS: Record<string, string> = {
  concept: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  fact: 'bg-green-500/10 text-green-600 dark:text-green-400',
  theory: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  example: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  question: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  hypothesis: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  person: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  school: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
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

        {data.description && (
          <p className='text-sm text-muted-foreground'>{data.description}</p>
        )}

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
