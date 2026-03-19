'use client'

import { GraduationHat01Icon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/shared/components/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/tooltip'
import { cn } from '@/shared/lib/cn'

import {
  usePracticeModeActions,
  usePracticeModeActive,
  usePracticeModeStats
} from '../model/practice-mode.store'

export const PracticeFab = () => {
  const { t } = useTranslation()
  const isActive = usePracticeModeActive()
  const stats = usePracticeModeStats()
  const { enter, exit } = usePracticeModeActions()

  const hasDue = stats.dueCount > 0

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          onClick={() => (isActive ? exit() : enter())}
          aria-label={t('practice.mode.title')}
          className={cn(
            'absolute bottom-24 right-6 z-20',
            'h-12 w-12 rounded-full',
            'flex items-center justify-center',
            'transition-all duration-300',
            'shadow-lg hover:shadow-xl',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isActive
              ? 'bg-foreground text-background hover:bg-foreground/90'
              : 'bg-background border border-border/60 text-foreground hover:bg-muted',
            hasDue && !isActive && 'animate-due-pulse'
          )}
        >
          <GraduationHat01Icon className='h-5 w-5' />

          {/* Due count badge */}
          {hasDue && !isActive && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs rounded-full'
            >
              {stats.dueCount}
            </Badge>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side='left'>
        <span>{isActive ? t('practice.mode.title') : t('practice.mode.quickSession')}</span>
      </TooltipContent>
    </Tooltip>
  )
}
