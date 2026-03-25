'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/button'
import { RichMarkdown } from '@/shared/components/rich-markdown'
import { Textarea } from '@/shared/components/textarea'
import { cn } from '@/shared/lib/cn'

import type {
  EvaluateStepOutput,
  ExplanationChunk,
  LessonPlan,
  LessonStep
} from '../api/practice-mode.api'
import { learnSessionApi } from '../api/practice-mode.api'
import type { StabilityDelta } from '../model/practice-mode.store'
import { usePracticeModeActions } from '../model/practice-mode.store'

function GlossaryMarkdown({ children, className }: { children: string; className?: string }) {
  const processed = children.replace(
    /\{\{([^|]+)\|([^}]+)\}\}/g,
    (_, term: string, definition: string) => {
      if (glossarySeenTerms.has(term.toLowerCase())) {
        return `**${term}**`
      }
      glossarySeenTerms.add(term.toLowerCase())
      return `**${term}** _(${definition})_`
    }
  )
  return (
    <div className={className}>
      <RichMarkdown>{processed}</RichMarkdown>
    </div>
  )
}

// --- Types ---

type Phase = 'loading' | 'step' | 'feedback' | 'complete'

interface StepState {
  answer: string
  evaluation: EvaluateStepOutput | null
  chunkIndex: number // for explanation step — which chunk we're on
  chunkAnswer: string | null // answer to current chunk's check question
}

// --- Component ---

interface LearnSessionViewProps {
  mapId: string
  nodeId: string
  nodeLabel: string
  className?: string
}

export function LearnSessionView({ mapId, nodeId, nodeLabel, className }: LearnSessionViewProps) {
  const { t } = useTranslation()
  const { recordAnswer, setView } = usePracticeModeActions()

  const [phase, setPhase] = useState<Phase>('loading')
  const [lesson, setLesson] = useState<LessonPlan | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [stepState, setStepState] = useState<StepState>({
    answer: '',
    evaluation: null,
    chunkIndex: 0,
    chunkAnswer: null
  })
  const [error, setError] = useState<string | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  // Load lesson on mount
  useEffect(() => {
    let cancelled = false
    setPhase('loading')
    setError(null)

    learnSessionApi
      .startLesson(mapId, nodeId)
      .then(plan => {
        if (!cancelled) {
          setLesson(plan)
          setPhase('step')
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message || t('practice.noExercises'))
          setPhase('step')
        }
      })

    return () => {
      cancelled = true
    }
  }, [mapId, nodeId, t])

  const currentStep = lesson?.steps[stepIndex] ?? null
  const totalSteps = lesson?.steps.length ?? 0
  const isLastStep = stepIndex >= totalSteps - 1

  const resetStepState = useCallback(() => {
    setStepState({ answer: '', evaluation: null, chunkIndex: 0, chunkAnswer: null })
  }, [])

  const handleAdvance = useCallback(() => {
    if (isLastStep) {
      setPhase('complete')
    } else {
      setStepIndex(i => i + 1)
      resetStepState()
      setPhase('step')
    }
  }, [isLastStep, resetStepState])

  const handleSubmitAnswer = useCallback(
    async (answer: string) => {
      if (!currentStep || !lesson) {
        return
      }
      setIsEvaluating(true)

      try {
        const result = await learnSessionApi.evaluateStep(mapId, {
          conceptTitle: lesson.concept,
          stepType: currentStep.type,
          question: currentStep.prompt || currentStep.question || '',
          studentAnswer: answer,
          keyIdeas: currentStep.key_ideas
        })
        setStepState(s => ({ ...s, answer, evaluation: result }))
        setPhase('feedback')
      } catch {
        // On evaluation error, just advance
        handleAdvance()
      } finally {
        setIsEvaluating(false)
      }
    },
    [currentStep, lesson, mapId, handleAdvance]
  )

  const handleSkip = useCallback(() => {
    handleSubmitAnswer('')
  }, [handleSubmitAnswer])

  const handleFinish = useCallback(() => {
    // Record as learned in store
    if (lesson) {
      const delta: StabilityDelta = {
        nodeId,
        nodeLabel,
        before: 0,
        after: 1,
        delta: 1
      }
      recordAnswer(nodeId, true, delta)
    }
    setView('session_end')
  }, [lesson, nodeId, nodeLabel, recordAnswer, setView])

  // --- Loading ---
  if (phase === 'loading') {
    return (
      <div className={cn('flex flex-col gap-4 p-4', className)}>
        <div className='flex flex-col items-center justify-center gap-3 py-16'>
          <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
          <p className='text-sm text-muted-foreground'>
            {t('practice.mode.preparingLesson', 'Preparing lesson...')}
          </p>
        </div>
      </div>
    )
  }

  // --- Error ---
  if (error || !lesson) {
    return (
      <div className={cn('flex flex-col gap-4 p-4', className)}>
        <p className='text-sm text-muted-foreground text-center py-8'>
          {error || t('practice.noExercises')}
        </p>
        <Button variant='outline' onClick={() => setView('overview')}>
          {t('practice.mode.backToOverview')}
        </Button>
      </div>
    )
  }

  // --- Complete ---
  if (phase === 'complete') {
    return (
      <div className={cn('flex flex-col gap-4 p-4', className)}>
        <div className='flex items-center gap-2 mb-2'>
          <span className='text-success text-lg'>✓</span>
          <h3 className='text-base font-semibold'>{lesson.concept}</h3>
        </div>

        {/* Takeaway card */}
        <div className='rounded-xl border-2 border-primary/20 bg-primary/5 p-4'>
          <p className='text-xs font-medium text-primary mb-2'>
            {t('practice.mode.takeaway', 'Key takeaway')}
          </p>
          <div className='prose prose-sm dark:prose-invert max-w-none'>
            <RichMarkdown>{lesson.takeaway}</RichMarkdown>
          </div>
        </div>

        <p className='text-xs text-muted-foreground'>
          {t('practice.mode.firstReview', 'First review: tomorrow')}
        </p>

        {/* Go Deeper — suggest adding foundation nodes */}
        {lesson.prerequisite_domains && lesson.prerequisite_domains.length > 0 && (
          <div className='rounded-lg border border-info/30 bg-info/5 p-3'>
            <p className='text-sm font-medium mb-1'>
              {t('practice.mode.expandKnowledge', 'Expand your knowledge?')}
            </p>
            <p className='text-xs text-muted-foreground mb-2'>
              {t(
                'practice.mode.expandDescription',
                'This lesson used concepts from {{domains}}. Adding these foundations could help.',
                {
                  domains: lesson.prerequisite_domains.join(', ')
                }
              )}
            </p>
            <Button variant='outline' size='sm' className='text-xs'>
              {t('practice.mode.addFoundations', '+ Add foundations')}
            </Button>
          </div>
        )}

        <div className='flex flex-col gap-2 mt-2'>
          <Button onClick={handleFinish}>{t('practice.mode.done')}</Button>
        </div>
      </div>
    )
  }

  // --- Step ---
  return (
    <div className={cn('flex flex-col gap-4 p-4', className)}>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <div className='flex-1 h-1.5 rounded-full bg-muted overflow-hidden'>
          <div
            className='h-full rounded-full bg-primary transition-all duration-500'
            style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <span className='text-xs tabular-nums text-muted-foreground shrink-0'>
          {stepIndex + 1}/{totalSteps}
        </span>
      </div>

      <h3 className='text-sm font-semibold'>{lesson.concept}</h3>

      {/* Step content */}
      {phase === 'feedback' && stepState.evaluation ? (
        <StepFeedback evaluation={stepState.evaluation} onNext={handleAdvance} />
      ) : (
        <StepContent
          step={currentStep!}
          stepState={stepState}
          setStepState={setStepState}
          onSubmit={handleSubmitAnswer}
          onSkip={handleSkip}
          isEvaluating={isEvaluating}
        />
      )}
    </div>
  )
}

// --- Step Content Renderer ---

function StepContent({
  step,
  stepState,
  setStepState,
  onSubmit,
  onSkip,
  isEvaluating
}: {
  step: LessonStep
  stepState: StepState
  setStepState: React.Dispatch<React.SetStateAction<StepState>>
  onSubmit: (answer: string) => void
  onSkip: () => void
  isEvaluating: boolean
}) {
  switch (step.type) {
    case 'activation':
      return (
        <ActivationStep
          prompt={step.prompt ?? ''}
          hint={step.hint}
          value={stepState.answer}
          onChange={v => setStepState(s => ({ ...s, answer: v }))}
          onSubmit={() => onSubmit(stepState.answer)}
          onSkip={onSkip}
          disabled={isEvaluating}
        />
      )

    case 'explanation':
      return (
        <ExplanationStep
          chunks={step.chunks ?? []}
          chunkIndex={stepState.chunkIndex}
          chunkAnswer={stepState.chunkAnswer}
          onChunkAnswer={id => setStepState(s => ({ ...s, chunkAnswer: id }))}
          onNextChunk={() =>
            setStepState(s => ({ ...s, chunkIndex: s.chunkIndex + 1, chunkAnswer: null }))
          }
          onComplete={() => onSubmit('explanation_complete')}
        />
      )

    case 'self_explanation':
    case 'connection':
    case 'application':
      return (
        <FreeTextStep
          prompt={step.type === 'application' ? (step.scenario ?? '') : ''}
          question={step.prompt || step.question || ''}
          relatedConcept={step.related_concept}
          value={stepState.answer}
          onChange={v => setStepState(s => ({ ...s, answer: v }))}
          onSubmit={() => onSubmit(stepState.answer)}
          disabled={isEvaluating}
        />
      )

    case 'recall':
      return (
        <FreeTextStep
          question={step.prompt || ''}
          value={stepState.answer}
          onChange={v => setStepState(s => ({ ...s, answer: v }))}
          onSubmit={() => onSubmit(stepState.answer)}
          disabled={isEvaluating}
        />
      )

    default:
      return null
  }
}

// --- Activation Step ---

function ActivationStep({
  prompt,
  hint,
  value,
  onChange,
  onSubmit,
  onSkip,
  disabled
}: {
  prompt: string
  hint?: string
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  onSkip: () => void
  disabled: boolean
}) {
  const { t } = useTranslation()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && value.trim()) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <p className='text-xs text-muted-foreground'>
        {t('practice.mode.beforeWeBegin', 'Before we begin —')}
      </p>

      <div className='prose prose-sm dark:prose-invert max-w-none'>
        <RichMarkdown>{prompt}</RichMarkdown>
      </div>

      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('practice.mode.yourThoughts', 'Your thoughts...')}
        className='min-h-[80px] text-sm'
        disabled={disabled}
        autoFocus
      />

      <div className='flex gap-2'>
        <Button onClick={onSubmit} disabled={!value.trim() || disabled} className='flex-1'>
          {t('practice.mode.submit')}
        </Button>
        <Button variant='ghost' onClick={onSkip} disabled={disabled} className='text-xs'>
          {t('practice.mode.noIdea', 'No idea')}
        </Button>
      </div>

      {hint && <p className='text-xs text-muted-foreground italic'>{hint}</p>}
    </div>
  )
}

// --- Explanation Step (chunked with micro-checks) ---

function ExplanationStep({
  chunks,
  chunkIndex,
  chunkAnswer,
  onChunkAnswer,
  onNextChunk,
  onComplete
}: {
  chunks: ExplanationChunk[]
  chunkIndex: number
  chunkAnswer: string | null
  onChunkAnswer: (id: string) => void
  onNextChunk: () => void
  onComplete: () => void
}) {
  const { t } = useTranslation()
  const chunk = chunks[chunkIndex]
  const isLast = chunkIndex >= chunks.length - 1

  if (!chunk) {
    onComplete()
    return null
  }

  const checkAnswered = chunkAnswer !== null
  const checkCorrect = chunk.check?.options.find(o => o.id === chunkAnswer)?.correct

  return (
    <div className='flex flex-col gap-4'>
      {/* Show all previous chunks as context */}
      {chunks.slice(0, chunkIndex).map(c => (
        <div
          key={c.text.slice(0, 30)}
          className='prose prose-sm dark:prose-invert max-w-none opacity-60'
        >
          <RichMarkdown>{c.text}</RichMarkdown>
        </div>
      ))}

      {/* Current chunk */}
      <div className='prose prose-sm dark:prose-invert max-w-none'>
        <RichMarkdown>{chunk.text}</RichMarkdown>
      </div>

      {/* Micro-check */}
      {chunk.check && !checkAnswered && (
        <div className='rounded-lg border bg-muted/30 p-3'>
          <p className='text-sm mb-2'>{chunk.check.question}</p>
          <div className='flex flex-col gap-1.5'>
            {chunk.check.options.map(opt => (
              <button
                key={opt.id}
                type='button'
                onClick={() => onChunkAnswer(opt.id)}
                className='rounded-lg border p-2.5 text-left text-xs transition-colors hover:border-primary/50 hover:bg-primary/5'
              >
                {opt.content}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Check result + next */}
      {checkAnswered && (
        <div
          className={cn(
            'rounded-lg border p-3 text-sm',
            checkCorrect ? 'border-success/30 bg-success/5' : 'border-amber-500/30 bg-amber-500/5'
          )}
        >
          <p className={checkCorrect ? 'text-success' : 'text-amber-600 dark:text-amber-400'}>
            {checkCorrect
              ? t('practice.mode.correct_feedback')
              : t('practice.mode.almostRight', "Almost — let's continue and it'll click.")}
          </p>
        </div>
      )}

      {/* Next chunk or complete */}
      {(checkAnswered || !chunk.check) && (
        <Button variant='outline' size='sm' onClick={isLast ? onComplete : onNextChunk}>
          {isLast ? t('practice.mode.gotIt', 'Got it') : t('practice.mode.continue', 'Continue')}
        </Button>
      )}
    </div>
  )
}

// --- Free Text Step (self_explanation, connection, application, recall) ---

function FreeTextStep({
  prompt,
  question,
  relatedConcept,
  value,
  onChange,
  onSubmit,
  disabled
}: {
  prompt?: string
  question: string
  relatedConcept?: string
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled: boolean
}) {
  const { t } = useTranslation()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && value.trim()) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      {prompt && (
        <div className='rounded-lg border bg-muted/30 p-3 prose prose-sm dark:prose-invert max-w-none'>
          <RichMarkdown>{prompt}</RichMarkdown>
        </div>
      )}

      {relatedConcept && <p className='text-xs text-muted-foreground'>🔗 {relatedConcept}</p>}

      <div className='prose prose-sm dark:prose-invert max-w-none'>
        <RichMarkdown>{question}</RichMarkdown>
      </div>

      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('practice.mode.yourAnswer')}
        className='min-h-[80px] text-sm'
        disabled={disabled}
        autoFocus
      />

      <Button onClick={onSubmit} disabled={!value.trim() || disabled}>
        {t('practice.mode.submit')}
      </Button>
    </div>
  )
}

// --- Feedback after step evaluation ---

function StepFeedback({
  evaluation,
  onNext
}: {
  evaluation: EvaluateStepOutput
  onNext: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-3'>
      {evaluation.encouragement && (
        <p className='text-sm text-success'>{evaluation.encouragement}</p>
      )}

      {evaluation.feedback && (
        <div className='rounded-lg border bg-muted/30 p-3'>
          <div className='prose prose-sm dark:prose-invert max-w-none'>
            <RichMarkdown>{evaluation.feedback}</RichMarkdown>
          </div>
        </div>
      )}

      <Button onClick={onNext} className='mt-1'>
        {t('practice.mode.continue', 'Continue')}
      </Button>
    </div>
  )
}
