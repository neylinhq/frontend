import type { User } from '@/entities/user'

export interface SessionData {
  token: string
  user: User
  refreshToken?: string
}

export interface SessionState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  login: (user: User, token: string) => void
  logout: () => void
}
