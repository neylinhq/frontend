import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['admin', 'user', 'viewer']).default('user'),
  avatarUrl: z.string().url().optional(),
  createdAt: z.string().datetime()
})

export type User = z.infer<typeof UserSchema>
