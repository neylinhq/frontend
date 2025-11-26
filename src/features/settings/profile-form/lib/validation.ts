import { z } from 'zod'

export const profileFormSchema = z.object({
  displayName: z.string().max(50, 'Display name must be 50 characters or less').optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be 30 characters or less')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .optional()
    .or(z.literal('')),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>
