'use client'

import { GraduationHat01Icon, XCloseIcon } from '@untitledui/icons-react/outline'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useMapUIStore } from '@/entities/map-ui'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/shared/components/alert-dialog'
import { Badge } from '@/shared/components/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/tooltip'
import { cn } from '@/shared/lib/cn'

import {
  usePracticeModeActions,
  usePracticeModeSession,
  usePracticeModeStats
} from '../model/practice-mode.store'

interface PracticeFabProps {
  mapId: string
}

export const PracticeFab = ({ mapId }: PracticeFabProps) => {
  const { t } = useTranslation()
  const session = usePracticeModeSession()
  const stats = usePracticeModeStats()
  const { endSession } = usePracticeModeActions()
  const [showConfirm, setShowConfirm] = useState(false)

  const hasSession = session !== null
  const hasDue = stats.dueCount > 0

  const handleClick = () => {
    if (hasSession) {
      setShowConfirm(true)
    } else {
      // Open practice tab
      useMapUIStore.getState().setActiveTab(mapId, 'practice')
      useMapUIStore.getState().setSidebarOpen(true)
    }
  }

  const handleEndSession = () => {
    endSession()
    setShowConfirm(false)
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type='button'
            onClick={handleClick}
            aria-label={t('practice.mode.title')}
            className={cn(
              'relative',
              'h-12 w-12 rounded-full',
              'flex items-center justify-center',
              'transition-all duration-300',
              'shadow-lg hover:shadow-xl',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              hasSession
                ? 'bg-foreground text-background hover:bg-foreground/90'
                : 'bg-background border border-border/60 text-foreground hover:bg-muted',
              hasDue && !hasSession && 'animate-due-pulse'
            )}
          >
            {hasSession ? (
              <XCloseIcon className='h-5 w-5' />
            ) : (
              <GraduationHat01Icon className='h-5 w-5' />
            )}

            {hasDue && !hasSession && (
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
          <span>{hasSession ? t('practice.mode.endSessionTitle') : t('practice.mode.title')}</span>
        </TooltipContent>
      </Tooltip>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('practice.mode.endSessionTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('practice.mode.endSessionDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndSession}>
              {t('practice.mode.endSessionConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
