import type { Exercise, ExerciseType } from '@/entities/exercise'

import { ConnectConceptsExercise } from './connect-concepts-exercise'
import { ExplainToAIExercise } from './explain-to-ai-exercise'
import { FillGapsExercise } from './fill-gaps-exercise'
import { FindErrorExercise } from './find-error-exercise'
import { FlashcardExercise } from './flashcard-exercise'
import { MatchPairsExercise } from './match-pairs-exercise'
import { OpenEndedExercise } from './open-ended-exercise'
import { QuizExercise } from './quiz-exercise'
import { SequenceExercise } from './sequence-exercise'
import { TrueFalseExercise } from './true-false-exercise'

interface ExerciseRendererProps {
  exercise: Exercise
  onSubmit: (answer: unknown) => void
  disabled?: boolean
  isChallenge?: boolean
}

export function ExerciseRenderer({ exercise, onSubmit, disabled, isChallenge }: ExerciseRendererProps) {
  const options = exercise.options ?? []

  switch (exercise.type as ExerciseType) {
    case 'quiz':
      return (
        <QuizExercise
          question={exercise.question}
          options={options}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      )

    case 'flashcard':
      return (
        <FlashcardExercise
          front={exercise.question}
          back={exercise.explanation ?? ''}
          onSubmit={(recalled) => onSubmit(recalled)}
          disabled={disabled}
        />
      )

    case 'true_false':
      return (
        <TrueFalseExercise question={exercise.question} onSubmit={onSubmit} disabled={disabled} />
      )

    case 'fill_gaps':
      return (
        <FillGapsExercise question={exercise.question} onSubmit={onSubmit} disabled={disabled} />
      )

    case 'match': {
      const half = Math.ceil(options.length / 2)
      return (
        <MatchPairsExercise
          question={exercise.question}
          leftItems={options.slice(0, half)}
          rightItems={options.slice(half)}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      )
    }

    case 'sequence':
      return (
        <SequenceExercise
          question={exercise.question}
          items={options}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      )

    case 'explain_to_ai':
      return (
        <ExplainToAIExercise question={exercise.question} onSubmit={onSubmit} disabled={disabled} />
      )

    case 'connect_concepts':
      return (
        <ConnectConceptsExercise
          question={exercise.question}
          conceptA={exercise.metadata?.tags?.[0]}
          conceptB={exercise.metadata?.tags?.[1]}
          onSubmit={onSubmit}
          disabled={disabled}
        />
      )

    case 'find_error':
      return (
        <FindErrorExercise question={exercise.question} onSubmit={onSubmit} disabled={disabled} />
      )

    default:
      return (
        <OpenEndedExercise
          question={exercise.question}
          onSubmit={onSubmit}
          disabled={disabled}
          isChallenge={isChallenge}
        />
      )
  }
}
