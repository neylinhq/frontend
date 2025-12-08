import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/badge'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/select'
import { Slider } from '@/shared/components/slider'
import { useDebouncedCallback } from '@/shared/hooks'
import { COMPLEXITY_OPTIONS } from '../model/complexity.constants'
import { type NodeMetadataFormValues, nodeMetadataFormSchema } from '../lib/validation'
import type { NodeMetadataFormProps } from '../model/node-metadata-form.types'
import { NodeTypeSelect } from './node-type-select'

export const NodeMetadataForm = ({ node, onSubmit, isPending }: NodeMetadataFormProps) => {
  const { t } = useTranslation()
  const [tagInput, setTagInput] = useState('')

  const form = useForm<NodeMetadataFormValues>({
    resolver: zodResolver(nodeMetadataFormSchema),
    defaultValues: {
      label: node.label,
      type: node.type,
      tags: node.metadata?.tags || [],
      complexity: node.metadata?.complexity,
      confidence: node.metadata?.confidence
    }
  })

  const tags = form.watch('tags') || []
  const confidence = form.watch('confidence')

  // Submit form
  const submitForm = useCallback(() => {
    form.handleSubmit(onSubmit)()
  }, [form, onSubmit])

  // Debounced submit for slider (300ms delay)
  const debouncedSubmit = useDebouncedCallback(submitForm, 300)

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      form.setValue('tags', [...tags, trimmed])
      setTagInput('')
      submitForm()
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue('tags', tags.filter(t => t !== tagToRemove))
    submitForm()
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  // Instant save for discrete fields (type, complexity)
  const handleFieldChange = <K extends keyof NodeMetadataFormValues>(
    field: K,
    value: NodeMetadataFormValues[K]
  ) => {
    form.setValue(field, value)
    submitForm()
  }

  // Debounced save for continuous fields (slider)
  const handleSliderChange = (value: number) => {
    form.setValue('confidence', value)
    debouncedSubmit()
  }

  return (
    <div className="space-y-4" data-pending={isPending}>
      {/* Type */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{t('form.nodeType.label')}</Label>
        <NodeTypeSelect
          value={form.watch('type') ?? 'concept'}
          onChange={value => handleFieldChange('type', value)}
        />
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{t('form.tags.label')}</Label>
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1 text-xs py-0.5 px-2">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-0.5 rounded-full hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={handleAddTag}
            placeholder={tags.length === 0 ? t('form.tags.placeholder') : '+'}
            className="h-6 min-w-[60px] max-w-[120px] flex-1 border-dashed text-xs px-2"
          />
        </div>
      </div>

      {/* Complexity */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{t('form.complexity.label')}</Label>
        <Select
          value={form.watch('complexity') || ''}
          onValueChange={value => handleFieldChange('complexity', value as NodeMetadataFormValues['complexity'])}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder={t('form.complexity.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {COMPLEXITY_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Confidence */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">
            {t('form.confidence.label', 'Confidence')}
          </Label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {confidence ? Math.round(confidence * 100) : 0}%
          </span>
        </div>
        <Slider
          min={0}
          max={1}
          step={0.1}
          value={[confidence || 0]}
          onValueChange={values => handleSliderChange(values[0])}
          className="py-1"
        />
      </div>
    </div>
  )
}
