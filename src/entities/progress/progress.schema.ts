import { z } from 'zod'

// =====================
// USER NODE PROGRESS
// =====================

export const MasteryLevelEnum = z.enum([
  'unlearned',
  'learning',
  'practicing',
  'proficient',
  'mastered',
])

export type MasteryLevel = z.infer<typeof MasteryLevelEnum>

export const UserNodeProgressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  nodeId: z.string(),

  // Learning metrics
  confidence: z.number().min(0).max(1).default(0),
  masteryLevel: MasteryLevelEnum.default('unlearned'),

  // Spaced repetition
  lastReviewedAt: z.string().nullable().optional(),
  nextReviewAt: z.string().nullable().optional(),
  reviewCount: z.number().default(0),
  correctStreak: z.number().default(0),

  // FSRS-6 state
  fsrsDifficulty: z.number().min(1).max(10).default(5),
  fsrsStability: z.number().min(0).default(0),
  fsrsLastReview: z.string().nullable().optional(),
  effectiveStability: z.number().min(0).default(0),
  prereqsStable: z.boolean().default(true),

  // Personal data
  notes: z.string().nullable().optional(),
  isBookmarked: z.boolean().default(false),

  // Timestamps
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type UserNodeProgress = z.infer<typeof UserNodeProgressSchema>

// Default progress for nodes without explicit progress
export const DEFAULT_NODE_PROGRESS: Omit<
  UserNodeProgress,
  'id' | 'userId' | 'nodeId' | 'createdAt' | 'updatedAt'
> = {
  confidence: 0,
  masteryLevel: 'unlearned',
  lastReviewedAt: null,
  nextReviewAt: null,
  reviewCount: 0,
  correctStreak: 0,
  fsrsDifficulty: 5,
  fsrsStability: 0,
  fsrsLastReview: null,
  effectiveStability: 0,
  prereqsStable: true,
  notes: null,
  isBookmarked: false,
}

// =====================
// USER MAP PROGRESS
// =====================

export const ViewportSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  zoom: z.number().default(1)
})

export type Viewport = z.infer<typeof ViewportSchema>

export const UserMapProgressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  mapId: z.string(),

  // Viewport state
  viewport: ViewportSchema.default({ x: 0, y: 0, zoom: 1 }),

  // User preferences
  isFavorite: z.boolean().default(false),

  // Aggregated progress
  overallProgress: z.number().min(0).max(1).default(0),
  nodesMastered: z.number().default(0),
  nodesLearning: z.number().default(0),
  nodesTotal: z.number().default(0),

  // Study settings
  studySettings: z.record(z.unknown()).default({}),

  // Timestamps
  lastOpenedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type UserMapProgress = z.infer<typeof UserMapProgressSchema>

// =====================
// REQUEST TYPES
// =====================

export type UpdateNodeProgressRequest = Partial<
  Pick<
    UserNodeProgress,
    'confidence' | 'masteryLevel' | 'notes' | 'isBookmarked' | 'reviewCount' | 'correctStreak'
  >
>

export type UpdateMapProgressRequest = Partial<
  Pick<UserMapProgress, 'viewport' | 'isFavorite' | 'studySettings'>
>

// Mark node as reviewed (updates spaced repetition data)
export type ReviewNodeRequest = {
  correct: boolean
}
