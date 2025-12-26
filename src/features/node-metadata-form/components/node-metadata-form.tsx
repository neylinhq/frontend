import { zodResolver } from '@hookform/resolvers/zod'
import { XCloseIcon } from '@untitledui/icons-react/outline'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/badge'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/shared/components/form'
import { Input } from '@/shared/components/input'
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

  return (
    <Form {...form}>
      <div className='space-y-4' data-pending={isPending}>
        {/* Type */}
        <FormField
          control={form.control}
          name='type'
          render={({ field }) => (
            <FormItem className='space-y-1.5'>
              <FormLabel className='text-xs text-muted-foreground'>
                {t('form.nodeType.label')}
              </FormLabel>
              <FormControl>
                <NodeTypeSelect
                  value={field.value ?? 'concept'}
                  onChange={value => {
                    field.onChange(value)
                    submitForm()
                  }}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name='tags'
          render={() => (
            <FormItem className='space-y-1.5'>
              <FormLabel className='text-xs text-muted-foreground'>
                {t('form.tags.label')}
              </FormLabel>
              <div className='flex flex-wrap gap-1.5'>
                {tags.map(tag => (
                  <Badge key={tag} variant='secondary' className='gap-1 text-xs py-0.5 px-2'>
                    {tag}
                    <button
                      type='button'
                      onClick={() => handleRemoveTag(tag)}
                      className='ml-0.5 rounded-xs p-0.5 hover:bg-muted-foreground/20'
                      disabled={disabled}
                    >
                      <XCloseIcon className='h-3 w-3' />
                    </button>
                  </Badge>
                ))}
                <FormControl>
                  <Input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={handleAddTag}
                    placeholder={tags.length === 0 ? t('form.tags.placeholder') : '+'}
                    className='h-6 min-w-16 max-w-32 flex-1 border-dashed text-xs px-2 rounded-sm'
                    disabled={disabled}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
}
