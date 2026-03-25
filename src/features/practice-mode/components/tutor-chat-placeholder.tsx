'use client'

import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'

interface TutorChatPlaceholderProps {
  className?: string
}

/**
 * Placeholder for the Socratic tutor chat view.
 * Will be replaced with the full TutorChatView implementation.
 */
export function TutorChatPlaceholder({ className }: TutorChatPlaceholderProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-4 h-full', className)}>
      <p className="text-sm text-muted-foreground">
        {t('practice.mode.tutorComingSoon')}
      </p>
    </div>
  )
}
