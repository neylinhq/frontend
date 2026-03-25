'use client'

import { GraduationHat01Icon } from '@untitledui/icons-react/outline'
import { useTranslation } from 'react-i18next'

import { useMapPracticeActive, useMapUIStore } from '@/entities/map-ui'
import { Badge } from '@/shared/components/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/tooltip'
import { cn } from '@/shared/lib/cn'

import {
  usePracticeModeActions,
  usePracticeModeStats
} from '../model/practice-mode.store'

interface PracticeFabProps {
  mapId: string
  /** Called when practice mode toggles — parent can switch renderer */
  onToggle?: (isActive: boolean) => void
}

export const PracticeFab = ({ mapId, onToggle }: PracticeFabProps) => {
  const { t } = useTranslation()
  const isActive = useMapPracticeActive(mapId)
  const stats = usePracticeModeStats()
  const { enter, exit } = usePracticeModeActions()

  const hasDue = stats.dueCount > 0

  const handleClick = () => {
    if (isActive) {
      useMapUIStore.getState().setPracticeActive(mapId, false)
      exit()
      onToggle?.(false)
    } else {
      useMapUIStore.getState().setPracticeActive(mapId, true)
      useMapUIStore.getState().setActiveTab(mapId, 'practice')
      enter()
      onToggle?.(true)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          onClick={handleClick}
          aria-label={t('practice.mode.title')}
          className={cn(
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
