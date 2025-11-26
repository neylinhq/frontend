export {
  type User,
  type UserPreferences,
  type UpdateProfile,
  type ChangeEmail,
  type ChangePassword,
  UserSchema,
  UserPreferencesSchema,
  UpdateProfileSchema,
  ChangeEmailSchema,
  ChangePasswordSchema,
  defaultUserPreferences,
} from './user.schema'

export { userApi } from './user.api'

export {
  userKeys,
  useCurrentUser,
  useUpdateProfile,
  useUpdatePreferences,
  useUploadAvatar,
  useChangeEmail,
  useChangePassword,
  useDeleteAccount,
} from './user.queries'
