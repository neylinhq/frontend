import { BookOpen, ChevronDown, Lightbulb, Link2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/shared/components/collapsible'
import { cn } from '@/shared/lib/cn'
import type { QuickActionType } from '../ai-assist.types'

interface QuickActionBarProps {
  actions: QuickActionType[]
  onActionClick: (action: QuickActionType) => void
  disabled?: boolean
  defaultOpen?: boolean
}

const actionConfig: Record<QuickActionType, { icon: typeof Sparkles; labelKey: string }> = {
  enrich: { icon: Sparkles, labelKey: 'ai.improveDescription' },
  examples: { icon: Lightbulb, labelKey: 'ai.generateExamples' },
  sources: { icon: Link2, labelKey: 'ai.findSources' },
  exercises: { icon: BookOpen, labelKey: 'ai.generateExercises' }
}

export const QuickActionBar = ({
  actions,
  onActionClick,
  disabled = false,
  defaultOpen = false
}: QuickActionBarProps) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className='px-4 pt-2'>
        <CollapsibleTrigger asChild>
          <button type='button' className='flex items-center justify-between w-full py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors'>
            <span>{t('ai.chat.quickActions')}</span>
            <ChevronDown
              className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className='pt-2'>
          <div className='grid grid-cols-2 gap-2'>
            {actions.map(action => {
              const config = actionConfig[action]
              const Icon = config.icon

              return (
                <Button
                  key={action}
                  variant='outline'
                  size='sm'
                  className='justify-start'
                  onClick={() => onActionClick(action)}
                  disabled={disabled}
                >
                  <Icon className='w-4 h-4 mr-2' />
                  <span className='truncate'>{t(config.labelKey)}</span>
                </Button>
              )
            })}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
