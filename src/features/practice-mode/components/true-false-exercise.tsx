import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import { RichMarkdown } from '@/shared/components/rich-markdown'
import { cn } from '@/shared/lib/cn'

interface TrueFalseExerciseProps {
  question: string
  onSubmit: (answer: boolean) => void
  disabled?: boolean
}

export function TrueFalseExercise({ question, onSubmit, disabled }: TrueFalseExerciseProps) {
  const { t } = useTranslation()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key === 't' || e.key === 'T' || e.key === '1') onSubmit(true)
    if (e.key === 'f' || e.key === 'F' || e.key === '2') onSubmit(false)
  }

  return (
    <div className='flex flex-col gap-4' onKeyDown={handleKeyDown} tabIndex={-1}>
      <div className='prose prose-sm dark:prose-invert max-w-none'>
        <RichMarkdown>{question}</RichMarkdown>
      </div>

      <div className='flex gap-2'>
        <Button
          variant='outline'
          className={cn('flex-1', disabled && 'opacity-60 pointer-events-none')}
          onClick={() => onSubmit(true)}
          disabled={disabled}
        >
          <span className='mr-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium'>
            T
          </span>
          {t('practice.types.true', 'True')}
        </Button>
        <Button
          variant='outline'
          className={cn('flex-1', disabled && 'opacity-60 pointer-events-none')}
          onClick={() => onSubmit(false)}
          disabled={disabled}
        >
          <span className='mr-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium'>
            F
          </span>
          {t('practice.types.false', 'False')}
        </Button>
      </div>
    </div>
  )
}
