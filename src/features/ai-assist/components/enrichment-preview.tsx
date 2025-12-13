import { useTranslation } from 'react-i18next'
import type { EnrichmentPreviewData } from '../model/ai-assist.types'
import { DiffBlock, ProposalCard } from './proposal-card'

interface EnrichmentPreviewProps {
  data: unknown
  onRemove: () => void
  onSave: () => void
  onEdit?: (data: unknown) => void
}

export const EnrichmentPreview = ({ data, onRemove, onSave, onEdit }: EnrichmentPreviewProps) => {
  const { t } = useTranslation()
  const enrichmentData = data as EnrichmentPreviewData

  if (!enrichmentData) {
    return null
  }

  const { field, current, proposed } = enrichmentData

  // Map field names to display labels
  const fieldLabels: Record<string, string> = {
    description: t('ai.improveDescription', 'Improve description'),
    content: t('ai.improveContent', 'Improve content'),
    examples: t('ai.generateExamples', 'Add examples'),
    sources: t('ai.findSources', 'Add sources')
  }

  const title = fieldLabels[field] || t('ai.preview.enrichment', 'Enrichment')

  return (
    <ProposalCard
      title={title}
      onAccept={onSave}
      onReject={onRemove}
      onEdit={onEdit ? () => onEdit(data) : undefined}
    >
      <DiffBlock current={current} proposed={proposed} renderHtml />
    </ProposalCard>
  )
}
