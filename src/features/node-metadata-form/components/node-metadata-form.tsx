import { zodResolver } from '@hookform/resolvers/zod'
import { XCloseIcon } from '@untitledui/icons-react/outline'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/badge'
import { Input } from '@/shared/components/input'
import { Label } from '@/shared/components/label'
import { type NodeMetadataFormValues, nodeMetadataFormSchema } from '../lib/validation'
import type { NodeMetadataFormProps } from '../model/node-metadata-form.types'
import { NodeTypeSelect } from './node-type-select'

export const NodeMetadataForm = ({ node, onSubmit, isPending, disabled }: NodeMetadataFormProps) => {
  const { t } = useTranslation()
  const [tagInput, setTagInput] = useState('')

  const form = useForm<NodeMetadataFormValues>({
    resolver: zodResolver(nodeMetadataFormSchema),
    defaultValues: {
      label: node.label,
      type: node.type,
      tags: node.metadata?.tags || []
    }
  })

  const tags = form.watch('tags') || []

  // Submit form
  const submitForm = useCallback(() => {
    form.handleSubmit(onSubmit)()
  }, [form, onSubmit])

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      form.setValue('tags', [...tags, trimmed])
      setTagInput('')
      submitForm()
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue(
      'tags',
      tags.filter(t => t !== tagToRemove)
    )
    submitForm()
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  // Instant save for discrete fields (type)
  const handleFieldChange = <K extends keyof NodeMetadataFormValues>(
    field: K,
    value: NodeMetadataFormValues[K]
  ) => {
    form.setValue(field, value)
    submitForm()
  }

  return (
    <div className='space-y-4' data-pending={isPending}>
      {/* Type */}
      <div className='space-y-1.5'>
        <Label className='text-xs text-muted-foreground'>{t('form.nodeType.label')}</Label>
        <NodeTypeSelect
          value={form.watch('type') ?? 'concept'}
          onChange={value => handleFieldChange('type', value)}
          disabled={disabled}
        />
      </div>

      {/* Tags */}
      <div className='space-y-1.5'>
        <Label className='text-xs text-muted-foreground'>{t('form.tags.label')}</Label>
        <div className='flex flex-wrap gap-1.5'>
          {tags.map(tag => (
            <Badge key={tag} variant='secondary' className='gap-1 text-xs py-0.5 px-2'>
              {tag}
              <button
                type='button'
                onClick={() => handleRemoveTag(tag)}
                className='ml-0.5 rounded-full hover:bg-muted-foreground/20'
                disabled={disabled}
              >
                <XCloseIcon className='h-3 w-3' />
              </button>
            </Badge>
          ))}
          <Input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={handleAddTag}
            placeholder={tags.length === 0 ? t('form.tags.placeholder') : '+'}
            className='h-6 min-w-[60px] max-w-[120px] flex-1 border-dashed text-xs px-2'
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}
