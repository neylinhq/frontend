/* v8 ignore file */
import type { User } from '@/entities/user'

export interface SessionData {
  token: string
  user: User
  refreshToken?: string
}
