import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage, ResolvedPreview } from '../ai-assist.types'

const MAX_MESSAGES_PER_SESSION = 100
const MAX_SESSIONS = 50
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  lastUpdated: number
}

interface ChatHistoryState {
  sessions: Record<string, ChatSession>
}

interface ChatHistoryActions {
  getMessages: (sessionId: string) => ChatMessage[]
  addMessage: (sessionId: string, message: ChatMessage) => void
  updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void
  removePreview: (sessionId: string, messageId: string, previewId: string) => void
  moveToResolved: (
    sessionId: string,
    messageId: string,
    previewId: string,
    status: 'approved' | 'rejected',
    undoData?: ResolvedPreview['undoData']
  ) => void
  undoResolved: (sessionId: string, messageId: string, previewId: string) => void
  truncateFromMessage: (sessionId: string, messageId: string) => void
  clearSession: (sessionId: string) => void
  clearOldSessions: () => void
}

// Custom storage to handle Date serialization
const customStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name)
    if (!str) return null
    try {
      const parsed = JSON.parse(str)
      // Revive Date objects in messages
      if (parsed.state?.sessions) {
        for (const session of Object.values(parsed.state.sessions) as ChatSession[]) {
          for (const msg of session.messages) {
            if (msg.timestamp) {
              msg.timestamp = new Date(msg.timestamp)
            }
            if (msg.resolvedPreviews) {
              for (const rp of msg.resolvedPreviews) {
                if (rp.resolvedAt) {
                  rp.resolvedAt = new Date(rp.resolvedAt)
                }
              }
            }
          }
        }
      }
      return parsed
    } catch {
      return null
    }
  },
  setItem: (name: string, value: unknown) => {
    localStorage.setItem(name, JSON.stringify(value))
  },
  removeItem: (name: string) => localStorage.removeItem(name)
}

export const useChatHistoryStore = create<ChatHistoryState & ChatHistoryActions>()(
  persist(
    (set, get) => ({
      sessions: {},

      getMessages: (sessionId: string) => {
        const session = get().sessions[sessionId]
        return session?.messages || []
      },

      addMessage: (sessionId: string, message: ChatMessage) => {
        set(state => {
          const session = state.sessions[sessionId] || {
            id: sessionId,
            messages: [],
            lastUpdated: Date.now()
          }

          const newMessages = [...session.messages, message].slice(-MAX_MESSAGES_PER_SESSION)

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: newMessages,
                lastUpdated: Date.now()
              }
            }
          }
        })
      },

      updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => {
        set(state => {
          const session = state.sessions[sessionId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: session.messages.map(msg =>
                  msg.id === messageId ? { ...msg, ...updates } : msg
                ),
                lastUpdated: Date.now()
              }
            }
          }
        })
      },

      removePreview: (sessionId: string, messageId: string, previewId: string) => {
        set(state => {
          const session = state.sessions[sessionId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: session.messages.map(msg => {
                  if (msg.id !== messageId) return msg
                  return {
                    ...msg,
                    preview: msg.preview?.filter(p => p.id !== previewId)
                  }
                }),
                lastUpdated: Date.now()
              }
            }
          }
        })
      },

      moveToResolved: (
        sessionId: string,
        messageId: string,
        previewId: string,
        status: 'approved' | 'rejected',
        undoData?: ResolvedPreview['undoData']
      ) => {
        set(state => {
          const session = state.sessions[sessionId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: session.messages.map(msg => {
                  if (msg.id !== messageId || !msg.preview) return msg

                  const preview = msg.preview.find(p => p.id === previewId)
                  if (!preview) return msg

                  const resolvedPreview: ResolvedPreview = {
                    ...preview,
                    status,
                    resolvedAt: new Date(),
                    undoData
                  }

                  return {
                    ...msg,
                    preview: msg.preview.filter(p => p.id !== previewId),
                    resolvedPreviews: [...(msg.resolvedPreviews || []), resolvedPreview]
                  }
                }),
                lastUpdated: Date.now()
              }
            }
          }
        })
      },

      undoResolved: (sessionId: string, messageId: string, previewId: string) => {
        set(state => {
          const session = state.sessions[sessionId]
          if (!session) return state

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: session.messages.map(msg => {
                  if (msg.id !== messageId || !msg.resolvedPreviews) return msg

                  const resolved = msg.resolvedPreviews.find(p => p.id === previewId)
                  if (!resolved) return msg

                  // Move back to pending
                  const pendingPreview = {
                    id: resolved.id,
                    type: resolved.type,
                    data: resolved.data,
                    status: 'pending' as const
                  }

                  return {
                    ...msg,
                    preview: [...(msg.preview || []), pendingPreview],
                    resolvedPreviews: msg.resolvedPreviews.filter(p => p.id !== previewId)
                  }
                }),
                lastUpdated: Date.now()
              }
            }
          }
        })
      },

      truncateFromMessage: (sessionId: string, messageId: string) => {
        set(state => {
          const session = state.sessions[sessionId]
          if (!session) return state

          const messageIndex = session.messages.findIndex(m => m.id === messageId)
          if (messageIndex === -1) return state

          // Remove this message and all subsequent messages
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: session.messages.slice(0, messageIndex),
                lastUpdated: Date.now()
              }
            }
          }
        })
      },

      clearSession: (sessionId: string) => {
        set(state => {
          const { [sessionId]: _, ...rest } = state.sessions
          return { sessions: rest }
        })
      },

      clearOldSessions: () => {
        const now = Date.now()
        set(state => {
          const entries = Object.entries(state.sessions)
            .filter(([, session]) => now - session.lastUpdated < SESSION_MAX_AGE_MS)
            .sort((a, b) => b[1].lastUpdated - a[1].lastUpdated)
            .slice(0, MAX_SESSIONS)

          return { sessions: Object.fromEntries(entries) }
        })
      }
    }),
    {
      name: 'neylin:chat-history-v1',
      storage: customStorage,
      partialize: state => ({
        sessions: state.sessions
      })
    }
  )
)

// Utility to generate session ID
export const getChatSessionId = (mapId: string, nodeId?: string): string =>
  nodeId ? `${mapId}:node:${nodeId}` : `${mapId}:map`

// Selector hooks
export const useChatHistory = (sessionId: string) => {
  const messages = useChatHistoryStore(s => s.getMessages(sessionId))
  const addMessage = useChatHistoryStore(s => s.addMessage)
  const updateMessage = useChatHistoryStore(s => s.updateMessage)
  const removePreview = useChatHistoryStore(s => s.removePreview)
  const moveToResolved = useChatHistoryStore(s => s.moveToResolved)
  const undoResolved = useChatHistoryStore(s => s.undoResolved)
  const clearSession = useChatHistoryStore(s => s.clearSession)

  return {
    messages,
    addMessage: (msg: ChatMessage) => addMessage(sessionId, msg),
    updateMessage: (msgId: string, updates: Partial<ChatMessage>) =>
      updateMessage(sessionId, msgId, updates),
    removePreview: (msgId: string, previewId: string) =>
      removePreview(sessionId, msgId, previewId),
    moveToResolved: (
      msgId: string,
      previewId: string,
      status: 'approved' | 'rejected',
      undoData?: ResolvedPreview['undoData']
    ) => moveToResolved(sessionId, msgId, previewId, status, undoData),
    undoResolved: (msgId: string, previewId: string) =>
      undoResolved(sessionId, msgId, previewId),
    clearSession: () => clearSession(sessionId)
  }
}
