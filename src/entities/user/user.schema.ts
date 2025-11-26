import { z } from 'zod'

// User Preferences schema
export const UserPreferencesSchema = z.object({
  notifications: z.object({
    email: z.boolean().default(true),
    marketing: z.boolean().default(false),
    updates: z.boolean().default(true),
  }),
  interface: z.object({
    density: z.enum(['compact', 'comfortable', 'spacious']).default('comfortable'),
    animations: z.boolean().default(true),
    sound: z.boolean().default(false),
  }),
})

export type UserPreferences = z.infer<typeof UserPreferencesSchema>

// Default preferences
export const defaultUserPreferences: UserPreferences = {
  notifications: {
    email: true,
    marketing: false,
    updates: true,
  },
  interface: {
    density: 'comfortable',
    animations: true,
    sound: false,
  },
}

// Extended User schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['admin', 'user', 'viewer']).default('user'),
  avatarUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
  // Profile fields
  displayName: z.string().max(50).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  bio: z.string().max(500).optional(),
  // Preferences
  preferences: UserPreferencesSchema.optional(),
})

export type User = z.infer<typeof UserSchema>

// Update schemas for mutations
export const UpdateProfileSchema = z.object({
  displayName: z.string().max(50).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  bio: z.string().max(500).optional(),
})

export type UpdateProfile = z.infer<typeof UpdateProfileSchema>

export const ChangeEmailSchema = z.object({
  newEmail: z.string().email(),
  password: z.string().min(1),
})

export type ChangeEmail = z.infer<typeof ChangeEmailSchema>

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type ChangePassword = z.infer<typeof ChangePasswordSchema>
