import type { PreviewCard } from '../ai-assist.types'
import { ExercisePreview } from './exercise-preview'
import { EnrichmentPreview } from './enrichment-preview'

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
  switch (preview.type) {
    case 'exercise':
      return (
        <ExercisePreview
          data={preview.data}
          onRemove={onRemove}
          onSave={onSave}
          onEdit={onEdit}
        />
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

    case 'edge':
    case 'node':
      // TODO: Implement these preview types
      return (
        <div className='p-4 border border-border rounded-lg bg-muted/30'>
          <p className='text-sm text-muted-foreground'>
            Preview type "{preview.type}" not implemented yet
          </p>
        </div>
      )

    default:
      return null
  }
}
