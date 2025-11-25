import { create } from 'zustand'
import type { SessionState } from './session.types'

// Store теперь "глупый", он просто хранит то, что пришло с сервера (гидратация)
export const useSessionStore = create<SessionState>(set => ({
  user: null,
  isAuthenticated: false,
  setUser: user => set({ user, isAuthenticated: !!user })
}))
