import { useTranslation } from 'react-i18next'
import type { EdgePreviewData, NodePreviewData, PreviewCard } from '../model/ai-assist.types'
import { EnrichmentPreview } from './enrichment-preview'
import { ExercisePreview } from './exercise-preview'
import { DiffLine, ProposalCard } from './proposal-card'

interface PreviewCardComponentProps {
  preview: PreviewCard
  onRemove: () => void
  onSave: () => void
  onEdit?: (data: unknown) => void
}

export const PreviewCardComponent = ({
  preview,
  onRemove,
  onSave,
  onEdit
}: PreviewCardComponentProps) => {
  const { t } = useTranslation()

  switch (preview.type) {
    case 'exercise':
      return (
        <ExercisePreview data={preview.data} onRemove={onRemove} onSave={onSave} onEdit={onEdit} />
      )

    case 'enrichment':
      return (
        <EnrichmentPreview
          data={preview.data}
          onRemove={onRemove}
          onSave={onSave}
          onEdit={onEdit}
        />
      )

    case 'edge': {
      const data = preview.data as EdgePreviewData
      return (
        <ProposalCard
          title={t('ai.preview.newEdge', 'New connection')}
          onAccept={onSave}
          onReject={onRemove}
          variant='compact'
        >
          <DiffLine type='add'>
            {data.sourceLabel || data.sourceNodeId} → {data.targetLabel || data.targetNodeId}
            <span className='text-muted-foreground ml-2'>({data.relationType})</span>
          </DiffLine>
        </ProposalCard>
      )
    }

    case 'node': {
      const data = preview.data as NodePreviewData
      return (
        <ProposalCard
          title={t('ai.preview.newNode', 'New node')}
          onAccept={onSave}
          onReject={onRemove}
          variant='compact'
        >
          <div className='space-y-1'>
            <DiffLine type='add'>{data.label}</DiffLine>
            <span className='text-xs text-muted-foreground ml-6'>{data.type}</span>
          </div>
        </ProposalCard>
      )
    }

    default:
      return null
  }
}
