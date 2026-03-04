import { useTranslation } from 'react-i18next'

import type {
  ConnectionPreviewData,
  EdgePreviewData,
  ExercisePreviewData,
  GraphFragmentPreviewData,
  NewNodePreviewData,
  NodePreviewData,
  PreviewCard
} from '../model/ai-assist.types'
import { ConnectionPreview } from './connection-preview'
import { EnrichmentPreview } from './enrichment-preview'
import { ExerciseCard } from './exercise-card'
import { GraphFragmentCard } from './graph-fragment-card'
import { NewNodePreview } from './new-node-preview'
import { DiffLine, ProposalCard } from './proposal-card'

interface PreviewCardComponentProps {
  preview: PreviewCard
  onRemove: () => void
  onSave: () => void
  onEdit?: (data: unknown) => void
  /** Whether this preview is currently being saved (disables buttons) */
  isSaving?: boolean
  /** Handler for graph_fragment apply with selected items */
  onApplyFragment?: (data: GraphFragmentPreviewData) => void
}

export const PreviewCardComponent = ({
  preview,
  onRemove,
  onSave,
  onEdit,
  isSaving = false,
  onApplyFragment
}: PreviewCardComponentProps) => {
  const { t } = useTranslation()

  switch (preview.type) {
    case 'exercise':
      // Exercises use interactive ExerciseCard - no Accept/Reject buttons
      return <ExerciseCard data={preview.data as ExercisePreviewData} />

    case 'graph_fragment': {
      const data = preview.data as GraphFragmentPreviewData
      return (
        <GraphFragmentCard
          data={data}
          status={preview.status}
          onApply={(selectedNodes, selectedEdges) => {
            // Create filtered data with only selected items
            const filteredData: GraphFragmentPreviewData = {
              ...data,
              nodes: selectedNodes,
              edges: selectedEdges
            }
            if (onApplyFragment) {
              onApplyFragment(filteredData)
            } else {
              // Fallback: just call onSave (parent will handle full data)
              onSave()
            }
          }}
          onReject={onRemove}
          isLoading={isSaving}
        />
      )
    }

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
      return (
        <NewNodePreview
          data={preview.data as NewNodePreviewData}
          onRemove={onRemove}
          onSave={onSave}
          isSaving={isSaving}
        />
      )

    case 'connection':
      return (
        <ConnectionPreview
          data={preview.data as ConnectionPreviewData}
          onRemove={onRemove}
          onSave={onSave}
          isSaving={isSaving}
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
