import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { setCookie } from '../lib/cookies'

interface DashboardSidebarState {
  isExpanded: boolean
  toggleSidebar: () => void
}

export const SIDEBAR_STORAGE_KEY = 'neylin-sidebar-expanded'

export const useDashboardSidebarStore = create<DashboardSidebarState>()(set => ({
  isExpanded: false,
  toggleSidebar: () =>
    set(state => {
      const next = !state.isExpanded
      setCookie(SIDEBAR_STORAGE_KEY, String(next))
      return { isExpanded: next }
    })
}))
