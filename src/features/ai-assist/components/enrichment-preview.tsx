import { useTranslation } from 'react-i18next'
import { Check, Edit2, X } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/card'
import { Button } from '@/shared/components/button'
import type { EnrichmentPreviewData } from '../ai-assist.types'

interface EnrichmentPreviewProps {
  data: unknown
  onRemove: () => void
  onSave: () => void
  onEdit?: (data: unknown) => void
}

export const EnrichmentPreview = ({
  data,
  onRemove,
  onSave,
  onEdit
}: EnrichmentPreviewProps) => {
  const { t } = useTranslation()
  const enrichmentData = data as EnrichmentPreviewData

  if (!enrichmentData) {
    return null
  }

  const { field, current, proposed } = enrichmentData

  // Map field names to display labels
  const fieldLabels: Record<string, string> = {
    description: t('ai.improveDescription'),
    examples: t('ai.generateExamples'),
    sources: t('ai.findSources')
  }

  return (
    <Card className='border-2 border-blue-500/20 bg-blue-500/5'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-sm'>
            {fieldLabels[field] || t('ai.preview.enrichment')}
          </CardTitle>
          <Button
            size='icon'
            variant='ghost'
            className='h-7 w-7'
            onClick={onRemove}
          >
            <X className='h-3 w-3' />
          </Button>
        </div>
      </CardHeader>

      <CardContent className='space-y-3 pt-0'>
        {/* Current value */}
        <div className='space-y-1'>
          <div className='text-xs text-muted-foreground font-medium'>
            {t('ai.preview.currentValue')}:
          </div>
          <div className='p-2 rounded bg-muted/50 border border-border/50'>
            <p className='text-sm line-through opacity-60'>{current || 'None'}</p>
          </div>
        </div>

        {/* Proposed value */}
        <div className='space-y-1'>
          <div className='text-xs text-muted-foreground font-medium'>
            {t('ai.preview.proposedValue')}:
          </div>
          <div className='p-2 rounded bg-green-500/10 border border-green-500/20'>
            <p className='text-sm'>{proposed}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className='flex gap-2 pt-3'>
        {onEdit && (
          <Button
            size='sm'
            variant='outline'
            onClick={() => onEdit(data)}
          >
            <Edit2 className='h-3 w-3 mr-1' />
            {t('ai.preview.edit')}
          </Button>
        )}
        <Button
          size='sm'
          className='flex-1'
          onClick={onSave}
        >
          <Check className='h-3 w-3 mr-1' />
          {t('ai.preview.apply')}
        </Button>
      </CardFooter>
    </Card>
  )
}
