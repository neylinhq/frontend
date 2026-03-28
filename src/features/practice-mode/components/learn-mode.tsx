import { useReactFlow } from '@xyflow/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useNextExercise, useSubmitAnswer } from '@/entities/exercise'

import type { StabilityDelta } from '../model/practice-mode.store'
import { usePracticeModeActions, usePracticeModeSession, usePracticeModeStats } from '../model/practice-mode.store'
import { ExerciseRenderer } from './exercise-renderer'
import { LearnCheckpoint } from './learn-checkpoint'
import { LearnFeedback } from './learn-feedback'
import { LearnHeader } from './learn-header'
import { LearnSessionEnd } from './learn-session-end'

interface LearnModeProps {
  mapId: string
  nodeLabels: Map<string, string>
}

type Phase = 'exercise' | 'feedback' | 'checkpoint' | 'session_end'

const CHECKPOINT_INTERVAL = 8

export const LearnMode = ({ mapId, nodeLabels }: LearnModeProps) => {
  const { t } = useTranslation()
  const session = usePracticeModeSession()
  const stats = usePracticeModeStats()
  const {
    advanceChain,
    recordAnswer,
    insertReturnSlot,
    markOverconfident,
    endSession,
  } = usePracticeModeActions()

  const reactFlow = useReactFlow()
  const [phase, setPhase] = useState<Phase>('exercise')
  const [feedbackData, setFeedbackData] = useState<{
    isCorrect: boolean
    feedback: string
    explanation?: string
    stabilityBefore: number
    stabilityAfter: number
    overconfident: boolean
  } | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [exercisesCompleted, setExercisesCompleted] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const pendingCheckpoint = useRef(false)

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1)
    }, 1000)
    return () => {
      clearInterval(timerRef.current)
    }
  }, [])

  // Current node
  const currentNodeId = session?.nodeQueue[session.currentChainIndex]
  const currentNodeLabel = currentNodeId ? (nodeLabels.get(currentNodeId) ?? '') : ''

  // Focus graph on current node
  useEffect(() => {
    if (!currentNodeId) {
      return
    }
    const node = reactFlow.getNode(currentNodeId)
    if (node) {
      reactFlow.setCenter(node.position.x, node.position.y, { duration: 600, zoom: 1.2 })
    }
  }, [currentNodeId, reactFlow])

  // Fetch exercise for current node
  const { data: exercise, isLoading: exerciseLoading } = useNextExercise(mapId, currentNodeId ?? '', !!currentNodeId)
  const submitAnswer = useSubmitAnswer()

  // Keyboard: Enter to advance from feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && phase === 'feedback') {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  const handleSubmit = useCallback(async (answer: unknown) => {
    if (!exercise || !currentNodeId) {
      return
    }

    const result = await submitAnswer.mutateAsync({
      mapId,
      exerciseId: exercise.id,
      answer,
    })

    const delta: StabilityDelta = {
      nodeId: currentNodeId,
      nodeLabel: currentNodeLabel,
      before: result.stabilityBefore,
      after: result.stabilityAfter,
      delta: result.stabilityAfter - result.stabilityBefore,
    }

    recordAnswer(currentNodeId, result.isCorrect, delta)
    setExercisesCompleted((c) => c + 1)

    if (result.isCorrect) {
      setCorrectCount((c) => c + 1)
    } else {
      // Wrong answer → insert return slot at +3
      insertReturnSlot(currentNodeId)
    }

    if (result.overconfident) {
      markOverconfident(currentNodeId)
    }

    setFeedbackData({
      isCorrect: result.isCorrect,
      feedback: result.feedback,
      explanation: result.explanation,
      stabilityBefore: result.stabilityBefore,
      stabilityAfter: result.stabilityAfter,
      overconfident: result.overconfident ?? false,
    })
    setPhase('feedback')
  }, [exercise, currentNodeId, currentNodeLabel, mapId, submitAnswer, recordAnswer, insertReturnSlot, markOverconfident])

  const handleNext = useCallback(() => {
    if (!session) {
      return
    }

    const nextIndex = session.currentChainIndex + 1

    // Check if session is done
    if (nextIndex >= session.nodeQueue.length) {
      setPhase('session_end')
      return
    }

    // Check if checkpoint needed
    if (exercisesCompleted > 0 && exercisesCompleted % CHECKPOINT_INTERVAL === 0 && !pendingCheckpoint.current) {
      pendingCheckpoint.current = true
      setPhase('checkpoint')
      return
    }

    pendingCheckpoint.current = false
    setFeedbackData(null)
    setPhase('exercise')
    advanceChain()
  }, [session, exercisesCompleted, advanceChain])

  const handleCheckpointContinue = useCallback(() => {
    pendingCheckpoint.current = false
    setFeedbackData(null)
    setPhase('exercise')
    advanceChain()
  }, [advanceChain])

  const handleExit = useCallback(() => {
    endSession()
  }, [endSession])

  if (!session) {
    return null
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60)

  return (
    <div className='fixed inset-0 z-50 flex flex-col bg-background'>
      <LearnHeader
        completed={exercisesCompleted}
        total={session.nodeQueue.length}
        elapsedSeconds={elapsedSeconds}
        onExit={handleExit}
      />

      <div className='flex-1 flex items-center justify-center p-4 overflow-y-auto'>
        <div className='w-full max-w-lg'>
          <div className='rounded-xl border bg-card p-6 shadow-lg'>
            {/* Node label */}
            {phase !== 'session_end' && currentNodeLabel && (
              <div className='mb-4'>
                <span className='text-xs text-muted-foreground'>{currentNodeLabel}</span>
              </div>
            )}

            {/* Exercise phase */}
            {phase === 'exercise' && (
              exerciseLoading ? (
                <div className='flex items-center justify-center h-32'>
                  <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                </div>
              ) : exercise ? (
                <ExerciseRenderer
                  exercise={exercise}
                  onSubmit={handleSubmit}
                  disabled={submitAnswer.isPending}
                />
              ) : (
                <p className='text-sm text-muted-foreground text-center'>
                  {t('practice.learn.noExercise', 'No exercise available')}
                </p>
              )
            )}

            {/* Feedback phase */}
            {phase === 'feedback' && feedbackData && (
              <LearnFeedback
                isCorrect={feedbackData.isCorrect}
                feedback={feedbackData.feedback}
                explanation={feedbackData.explanation}
                stabilityBefore={feedbackData.stabilityBefore}
                stabilityAfter={feedbackData.stabilityAfter}
                overconfident={feedbackData.overconfident}
                onNext={handleNext}
              />
            )}

            {/* Checkpoint phase */}
            {phase === 'checkpoint' && (
              <LearnCheckpoint
                completed={exercisesCompleted}
                total={session.nodeQueue.length}
                correctCount={correctCount}
                elapsedMinutes={elapsedMinutes}
                onContinue={handleCheckpointContinue}
                onStop={handleExit}
              />
            )}

            {/* Session end phase */}
            {phase === 'session_end' && (
              <LearnSessionEnd
                totalExercises={exercisesCompleted}
                correctCount={correctCount}
                elapsedMinutes={elapsedMinutes}
                stabilityDeltas={session.stabilityDeltas}
                dueCountTomorrow={stats.dueCount}
                onClose={handleExit}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
