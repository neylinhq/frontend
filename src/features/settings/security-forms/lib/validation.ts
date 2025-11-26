import { z } from 'zod'

export const emailChangeSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type EmailChangeValues = z.infer<typeof emailChangeSchema>

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to delete your account'),
  confirmation: z.string().refine((val) => val === 'DELETE', {
    message: 'Please type DELETE to confirm',
  }),
})

export type DeleteAccountValues = z.infer<typeof deleteAccountSchema>
