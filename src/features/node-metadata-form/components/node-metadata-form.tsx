import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Slider } from '@/shared/ui/slider'
import { type NodeMetadataFormValues, nodeMetadataFormSchema } from '../lib/validation'
import type { NodeMetadataFormProps } from '../model/node-metadata-form.types'
import { NodeComplexitySelector } from './node-complexity-selector'
import { NodeTagsInput } from './node-tags-input'
import { NodeTypeSelector } from './node-type-selector'

export function NodeMetadataForm({ node, onSubmit, isPending }: NodeMetadataFormProps) {
  const { t } = useTranslation()
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='label'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('form.metadata.label')}</FormLabel>
              <FormControl>
                <Input placeholder={t('form.metadata.labelPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='type'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <NodeTypeSelector value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='tags'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <NodeTagsInput value={field.value || []} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='complexity'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <NodeComplexitySelector value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='confidence'
          render={({ field }) => (
            <FormItem>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <FormLabel>{t('form.confidence.label', 'Confidence')}</FormLabel>
                  <span className='text-sm text-muted-foreground'>
                    {field.value ? Math.round(field.value * 100) : 0}%
                  </span>
                </div>
                <FormControl>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={[field.value || 0]}
                    onValueChange={values => field.onChange(values[0])}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={isPending} className='w-full'>
          {isPending ? t('form.metadata.saving') : t('form.metadata.save')}
        </Button>
      </form>
    </Form>
  )
}
