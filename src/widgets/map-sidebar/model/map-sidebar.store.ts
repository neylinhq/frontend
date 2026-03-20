import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MapSidebarTab = 'node' | 'chat' | 'practice' | 'settings'

interface MapSidebarState {
  /** Whether the sidebar is open */
  isOpen: boolean
  /** Current active tab */
  activeTab: MapSidebarTab
  /** Width of the sidebar in pixels */
  width: number
  /** Actions */
  open: (tab?: MapSidebarTab) => void
  close: () => void
  toggle: () => void
  setTab: (tab: MapSidebarTab) => void
  setWidth: (width: number) => void
}

const DEFAULT_WIDTH = 400
const MIN_WIDTH = 360
const MAX_WIDTH = 800

export const useMapSidebarStore = create<MapSidebarState>()(
  persist(
    set => ({
      isOpen: false,
      activeTab: 'chat',
      width: DEFAULT_WIDTH,
      open: tab =>
        set(state => ({
          isOpen: true,
          activeTab: tab ?? state.activeTab
        })),
      close: () => set({ isOpen: false }),
      toggle: () => set(state => ({ isOpen: !state.isOpen })),
      setTab: tab => set({ activeTab: tab, isOpen: true }),
      setWidth: width => set({ width: Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width)) })
    }),
    {
      name: 'map-sidebar-state',
      partialize: state => ({
        isOpen: state.isOpen,
        width: state.width,
        activeTab: state.activeTab
      })
    }
  )
)

export {
  MIN_WIDTH as MAP_SIDEBAR_MIN_WIDTH,
  MAX_WIDTH as MAP_SIDEBAR_MAX_WIDTH,
  DEFAULT_WIDTH as MAP_SIDEBAR_DEFAULT_WIDTH
}
