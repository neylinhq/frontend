'use client'

import { Stars01Icon } from '@untitledui/icons-react/outline'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'

const LABEL_INTERVAL_MS = 3000

/**
 * Thinking Indicator — animated status label for AI streaming
 *
 * Shows a sparkle icon + rotating creative verbs with crossfade animation.
 * Replaces LoadingDots when AI is thinking (streaming but no content yet).
 */
export const ThinkingIndicator = ({ className }: { className?: string }) => {
  const { t } = useTranslation()

  const labels = [
    t('ai.chat.status.thinking', 'Thinking'),
    t('ai.chat.status.analyzing', 'Analyzing'),
    t('ai.chat.status.imagining', 'Imagining'),
    t('ai.chat.status.concocting', 'Concocting'),
    t('ai.chat.status.incubating', 'Incubating'),
    t('ai.chat.status.pondering', 'Pondering'),
    t('ai.chat.status.conjuring', 'Conjuring'),
    t('ai.chat.status.composing', 'Composing')
  ]

  const [index, setIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)

      setTimeout(() => {
        setIndex(prev => (prev + 1) % labels.length)
        setIsTransitioning(false)
      }, 200)
    }, LABEL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [labels.length])

  return (
    <div
      className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}
      role='status'
      aria-label={labels[index]}
    >
      <Stars01Icon className='h-4 w-4 shrink-0 text-primary animate-pulse-subtle' />
      <span className='relative overflow-hidden'>
        <span
          className={cn(
            'inline-block transition-all duration-200 ease-out',
            isTransitioning && 'translate-y-2 opacity-0',
            !isTransitioning && 'translate-y-0 opacity-100'
          )}
        >
          {labels[index]}...
        </span>
      </span>
      <span className='inline-block w-[2px] h-4 bg-muted-foreground/60 animate-blink' />
    </div>
  )
}
