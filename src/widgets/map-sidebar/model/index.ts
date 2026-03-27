import { create } from 'zustand'

import type { ChatSession } from '@/features/ai-assist'

export type { MapSidebarTab } from '@/entities/map-ui'
export {
  SIDEBAR_MAX_WIDTH as MAP_SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MAX_WIDTH as MAP_SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH as MAP_SIDEBAR_MIN_WIDTH
} from '@/entities/map-ui'

interface ChatActionsState {
  createSession: (() => void) | null
  sessions: ChatSession[]
  activeSessionId: string | null
  selectSession: ((id: string) => void) | null
  deleteSession: ((id: string) => void) | null
}

export const useChatActionsStore = create<ChatActionsState>(() => ({
  createSession: null,
  sessions: [],
  activeSessionId: null,
  selectSession: null,
  deleteSession: null
}))
