import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/entities/user'

interface SessionState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    set => ({
      isAuthenticated: false,
      user: null,
      token: null,
      login: (user, token) => set({ isAuthenticated: true, user, token }),
      logout: () => set({ isAuthenticated: false, user: null, token: null })
    }),
    {
      name: 'arbor-session-storage'
    }
  )
)
