import { z } from 'zod'

export const ExerciseTypeSchema = z.enum([
  'quiz',
  'flashcard',
  'fill_gaps',
  'match',
  'sequence',
  'true_false',
  'open_ended',
  'explain_to_ai',
  'create_example',
  'connect_concepts',
  'find_error',
  'prerequisite_check',
  'transfer',
])

export const ExerciseOptionSchema = z.object({
  id: z.string(),
  content: z.string()
})

export const ExerciseMetadataSchema = z.object({
  tags: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  estimated_time_seconds: z.number()
})

export const ExerciseSchema = z.object({
  id: z.string(),
  map_id: z.string(),
  node_ids: z.array(z.string()),
  type: ExerciseTypeSchema,
  difficulty: z.number().min(1).max(5),
  question: z.string(),
  options: z.array(ExerciseOptionSchema).optional(),
  explanation: z.string().optional(),
  metadata: ExerciseMetadataSchema,
  created_at: z.string()
})

export const LearningProgressSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  node_id: z.string(),
  map_id: z.string(),
  ease_factor: z.number(),
  interval_days: z.number(),
  repetitions: z.number(),
  next_review_at: z.string().nullable(),
  total_reviews: z.number(),
  correct_count: z.number(),
  incorrect_count: z.number(),
  average_time_ms: z.number(),
  last_review_at: z.string().nullable(),
  mastery_level: z.enum(['unlearned', 'learning', 'practicing', 'proficient', 'mastered']),
  accuracy: z.number(),
  created_at: z.string(),
  updated_at: z.string()
})

export const SubmitAnswerOutputSchema = z.object({
  is_correct: z.boolean(),
  explanation: z.string(),
  correct_answer: z.unknown().optional(),
  progress: LearningProgressSchema,
  mastery_change: z.enum(['improved', 'degraded', 'unchanged']).optional()
})

export type ExerciseType = z.infer<typeof ExerciseTypeSchema>
export type ExerciseOption = z.infer<typeof ExerciseOptionSchema>
export type ExerciseMetadata = z.infer<typeof ExerciseMetadataSchema>
export type Exercise = z.infer<typeof ExerciseSchema>
export type LearningProgress = z.infer<typeof LearningProgressSchema>
export type SubmitAnswerOutput = z.infer<typeof SubmitAnswerOutputSchema>

// Frontend-specific types
export interface GenerateExercisesRequest {
  nodeIds?: string[]
  types?: ExerciseType[]
  difficulty: number
  count: number
}

export interface ExerciseSessionState {
  currentExercise: Exercise | null
  completed: number
  total: number
  streak: number
  sessionStartedAt: Date | null
}
