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

export const NodeResultEntrySchema = z.object({
  nodeId: z.string(),
  stabilityBefore: z.number(),
  stabilityAfter: z.number(),
  retrievability: z.number(),
  masteryLevel: z.enum(['unlearned', 'learning', 'practicing', 'proficient', 'mastered']),
  nextReviewDays: z.number(),
})

export const SubmitAnswerOutputSchema = z.object({
  isCorrect: z.boolean(),
  feedback: z.string(),
  explanation: z.string().optional(),
  correctAnswer: z.unknown().optional(),
  masteryChange: z.string().optional(),
  stabilityBefore: z.number(),
  stabilityAfter: z.number(),
  nextReviewDays: z.number(),
  retrievability: z.number(),
  overconfident: z.boolean().optional(),
  nodeResults: z.array(NodeResultEntrySchema).optional(),
})

export type ExerciseType = z.infer<typeof ExerciseTypeSchema>
export type ExerciseOption = z.infer<typeof ExerciseOptionSchema>
export type ExerciseMetadata = z.infer<typeof ExerciseMetadataSchema>
export type Exercise = z.infer<typeof ExerciseSchema>
export type NodeResultEntry = z.infer<typeof NodeResultEntrySchema>
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
