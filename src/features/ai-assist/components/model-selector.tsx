import { CheckIcon } from '@untitledui/icons-react/outline'
import { useMemo } from 'react'
import type { AIModel, AIModelTier } from '@/entities/ai'
import { Button } from '@/shared/components/button'
import { Icon, aiBrandIcons } from '@/shared/components/icon'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/popover'
import { Separator } from '@/shared/components/separator'
import { cn } from '@/shared/lib/cn'

const TIER_CONFIG: Record<AIModelTier, { label: string }> = {
  pro: { label: 'Pro' },
  fast: { label: 'Fast' },
  free: { label: 'Free' }
}

const TIER_ORDER: AIModelTier[] = ['pro', 'fast', 'free']

interface ModelSelectorProps {
  value?: string
  onChange: (modelId: string) => void
  models: AIModel[]
  disabled?: boolean
}

export const ModelSelector = ({ value, onChange, models, disabled }: ModelSelectorProps) => {
  const currentModel = models.find(m => m.id === value)

  const modelsByTier = useMemo(() => {
    const grouped: Record<AIModelTier, AIModel[]> = { pro: [], fast: [], free: [] }
    for (const model of models) {
      if (grouped[model.tier]) {
        grouped[model.tier].push(model)
      }
    }
    return grouped
  }, [models])

  const handleSelect = (modelId: string) => {
    onChange(modelId)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          disabled={disabled}
          className='h-7 px-2.5 text-[11px] gap-2 bg-muted/60 hover:bg-muted/70 data-[state=open]:bg-muted/70'
        >
          {currentModel && aiBrandIcons[currentModel.provider] && (
            <Icon data={aiBrandIcons[currentModel.provider]} size={14} />
          )}
          <span className='truncate max-w-28'>
            {currentModel?.name || 'Select model'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-60 p-0' align='start'>
        <div className='p-2'>
          {TIER_ORDER.map((tier, tierIndex) => {
            const tierModels = modelsByTier[tier]
            if (tierModels.length === 0) return null

            const config = TIER_CONFIG[tier]

            return (
              <div key={tier}>
                {tierIndex > 0 && <div className='h-1.5' />}
              <div className='text-[10px] uppercase tracking-wider text-muted-foreground px-2 mb-0.5 font-medium'>
                {config.label}
              </div>
                <div className='flex flex-col gap-0.5'>
                {tierModels.map(model => (
                  <button
                    key={model.id}
                    type='button'
                    onClick={() => handleSelect(model.id)}
                    className={cn(
                      'flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-sm',
                      'hover:bg-[var(--surface-hover)] hover:text-foreground',
                      'focus-visible:bg-[var(--surface-hover)] focus-visible:text-foreground focus-visible:outline-none',
                      value === model.id && 'bg-[var(--surface-hover)] text-foreground'
                    )}
                  >
                    {aiBrandIcons[model.provider] ? (
                      <Icon data={aiBrandIcons[model.provider]} size={12} className='shrink-0' />
                    ) : (
                      <div className='w-3 h-3 shrink-0' />
                    )}
                    <span className='flex-1 text-left truncate'>{model.name}</span>
                    <span className='ml-auto h-4 w-4 shrink-0 flex items-center justify-center'>
                      {value === model.id && <CheckIcon className='h-3 w-3' />}
                    </span>
                  </button>
                ))}
                </div>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
