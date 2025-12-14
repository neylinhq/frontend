import { useTranslation } from 'react-i18next'
import type { EdgePreviewData, NodePreviewData, PreviewCard } from '../model/ai-assist.types'
import { ConnectionPreview } from './connection-preview'
import { EnrichmentPreview } from './enrichment-preview'
import { ExercisePreview } from './exercise-preview'
import { NewNodePreview } from './new-node-preview'
import { DiffLine, ProposalCard } from './proposal-card'

interface PreviewCardComponentProps {
  preview: PreviewCard
  onRemove: () => void
  onSave: () => void
  onEdit?: (data: unknown) => void
  /** Whether this preview is currently being saved (disables buttons) */
  isSaving?: boolean
}

export const PreviewCardComponent = ({
  preview,
  onRemove,
  onSave,
  onEdit,
  isSaving = false
}: PreviewCardComponentProps) => {
  const { t } = useTranslation()

  switch (preview.type) {
    case 'exercise':
      return (
        <ExercisePreview data={preview.data} onRemove={onRemove} onSave={onSave} onEdit={onEdit} isSaving={isSaving} />
      )

    case 'enrichment':
      return (
        <EnrichmentPreview
          data={preview.data}
          onRemove={onRemove}
          onSave={onSave}
          onEdit={onEdit}
          isSaving={isSaving}
        />
      )

    case 'new_node':
      return <NewNodePreview data={preview.data} onRemove={onRemove} onSave={onSave} isSaving={isSaving} />

    case 'connection':
      return <ConnectionPreview data={preview.data} onRemove={onRemove} onSave={onSave} isSaving={isSaving} />

    case 'edge': {
      const data = preview.data as EdgePreviewData
      return (
        <ProposalCard
          title={t('ai.preview.newEdge', 'New connection')}
          onAccept={onSave}
          onReject={onRemove}
          variant='compact'
          isLoading={isSaving}
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
          isLoading={isSaving}
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
