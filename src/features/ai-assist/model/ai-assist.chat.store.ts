import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage, PreviewCard } from './ai-assist.types'

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
  setMessages: (sessionId: string, messages: ChatMessage[]) => void
  addMessage: (sessionId: string, message: ChatMessage) => void
  updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void
  removePreview: (sessionId: string, messageId: string, previewId: string) => void
  /** Update preview status in place (approve/reject without moving to separate list) */
  resolvePreview: (
    sessionId: string,
    messageId: string,
    previewId: string,
    status: 'approved' | 'rejected',
    undoData?: PreviewCard['undoData']
  ) => void
  /** Revert a resolved preview back to pending */
  unresolvePreview: (sessionId: string, messageId: string, previewId: string) => void
  /** @deprecated Use resolvePreview instead */
  moveToResolved: (
    sessionId: string,
    messageId: string,
    previewId: string,
    status: 'approved' | 'rejected',
    undoData?: PreviewCard['undoData']
  ) => void
  /** @deprecated Use unresolvePreview instead */
  undoResolved: (sessionId: string, messageId: string, previewId: string) => void
  truncateFromMessage: (sessionId: string, messageId: string) => void
  clearSession: (sessionId: string) => void
  clearOldSessions: () => void
}

// Custom storage to handle Date serialization
const customStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name)
    if (!str) {
      return null
    }
    try {
      const parsed = JSON.parse(str)
      // Revive Date objects in messages
      if (parsed.state?.sessions) {
        for (const session of Object.values(parsed.state.sessions) as ChatSession[]) {
          for (const msg of session.messages) {
            if (msg.timestamp) {
              msg.timestamp = new Date(msg.timestamp)
            }
            // Handle resolvedAt in preview cards
            if (msg.preview) {
              for (const p of msg.preview) {
                if (p.resolvedAt) {
                  p.resolvedAt = new Date(p.resolvedAt)
                }
              }
            }
            // Legacy: handle resolvedPreviews for backwards compatibility
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

      setMessages: (sessionId: string, messages: ChatMessage[]) => {
        set(state => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              id: sessionId,
              messages: messages.slice(-MAX_MESSAGES_PER_SESSION),
              lastUpdated: Date.now()
            }
          }
        }))
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
          if (!session) {
            return state
          }

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
          if (!session) {
            return state
          }

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: session.messages.map(msg => {
                  if (msg.id !== messageId) {
                    return msg
                  }
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

      // New unified approach: update status in place
      resolvePreview: (
        sessionId: string,
        messageId: string,
        previewId: string,
        status: 'approved' | 'rejected',
        undoData?: PreviewCard['undoData']
      ) => {
        set(state => {
          const session = state.sessions[sessionId]
          if (!session) {
            return state
          }

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: session.messages.map(msg => {
                  if (msg.id !== messageId || !msg.preview) {
                    return msg
                  }

                  return {
                    ...msg,
                    preview: msg.preview.map(p =>
                      p.id === previewId
                        ? { ...p, status, resolvedAt: new Date(), undoData }
                        : p
                    )
                  }
                }),
                lastUpdated: Date.now()
              }
            }
          }
        })
      },

      unresolvePreview: (sessionId: string, messageId: string, previewId: string) => {
        set(state => {
          const session = state.sessions[sessionId]
          if (!session) {
            return state
          }

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: session.messages.map(msg => {
                  if (msg.id !== messageId || !msg.preview) {
                    return msg
                  }

                  return {
                    ...msg,
                    preview: msg.preview.map(p => {
                      if (p.id !== previewId) {
                        return p
                      }

                      // Preserve applied entity IDs in data for duplicate prevention
                      let dataWithAppliedIds = p.data
                      if (p.undoData?.previousState) {
                        const previousState = p.undoData.previousState as {
                          createdNodeId?: string
                          createdEdgeIds?: string[]
                          createdEdgeId?: string
                          tempIdMapping?: Record<string, string>
                        }
                        if (p.type === 'new_node' && previousState.createdNodeId) {
                          dataWithAppliedIds = {
                            ...p.data,
                            appliedNodeId: previousState.createdNodeId,
                            appliedEdgeIds: previousState.createdEdgeIds
                          }
                        } else if (p.type === 'connection' && previousState.createdEdgeId) {
                          dataWithAppliedIds = {
                            ...p.data,
                            appliedEdgeId: previousState.createdEdgeId
                          }
                        } else if (p.type === 'graph_fragment' && (previousState.tempIdMapping || previousState.createdEdgeIds)) {
                          const fragmentData = p.data as import('./ai-assist.types').GraphFragmentPreviewData
                          const updatedNodes = fragmentData.nodes.map(node => {
                            const realId = previousState.tempIdMapping?.[node.tempId]
                            return realId ? { ...node, appliedNodeId: realId } : node
                          })
                          const updatedEdges = fragmentData.edges.map((edge, idx) => {
                            const edgeId = previousState.createdEdgeIds?.[idx]
                            return edgeId ? { ...edge, appliedEdgeId: edgeId } : edge
                          })
                          dataWithAppliedIds = {
                            ...fragmentData,
                            nodes: updatedNodes,
                            edges: updatedEdges
                          }
                        }
                      }

                      return {
                        ...p,
                        data: dataWithAppliedIds,
                        status: 'pending' as const,
                        resolvedAt: undefined,
                        undoData: undefined
                      }
                    })
                  }
                }),
                lastUpdated: Date.now()
              }
            }
          }
        })
      },

      // Legacy methods - delegate to new ones for backwards compatibility
      moveToResolved: (
        sessionId: string,
        messageId: string,
        previewId: string,
        status: 'approved' | 'rejected',
        undoData?: PreviewCard['undoData']
      ) => {
        get().resolvePreview(sessionId, messageId, previewId, status, undoData)
      },

      undoResolved: (sessionId: string, messageId: string, previewId: string) => {
        get().unresolvePreview(sessionId, messageId, previewId)
      },

      truncateFromMessage: (sessionId: string, messageId: string) => {
        set(state => {
          const session = state.sessions[sessionId]
          if (!session) {
            return state
          }

          const messageIndex = session.messages.findIndex(m => m.id === messageId)
          if (messageIndex === -1) {
            return state
          }

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
  const resolvePreview = useChatHistoryStore(s => s.resolvePreview)
  const unresolvePreview = useChatHistoryStore(s => s.unresolvePreview)
  const moveToResolved = useChatHistoryStore(s => s.moveToResolved)
  const undoResolved = useChatHistoryStore(s => s.undoResolved)
  const clearSession = useChatHistoryStore(s => s.clearSession)

  return {
    messages,
    addMessage: (msg: ChatMessage) => addMessage(sessionId, msg),
    updateMessage: (msgId: string, updates: Partial<ChatMessage>) =>
      updateMessage(sessionId, msgId, updates),
    removePreview: (msgId: string, previewId: string) => removePreview(sessionId, msgId, previewId),
    resolvePreview: (
      msgId: string,
      previewId: string,
      status: 'approved' | 'rejected',
      undoData?: PreviewCard['undoData']
    ) => resolvePreview(sessionId, msgId, previewId, status, undoData),
    unresolvePreview: (msgId: string, previewId: string) => unresolvePreview(sessionId, msgId, previewId),
    /** @deprecated Use resolvePreview instead */
    moveToResolved: (
      msgId: string,
      previewId: string,
      status: 'approved' | 'rejected',
      undoData?: PreviewCard['undoData']
    ) => moveToResolved(sessionId, msgId, previewId, status, undoData),
    /** @deprecated Use unresolvePreview instead */
    undoResolved: (msgId: string, previewId: string) => undoResolved(sessionId, msgId, previewId),
    clearSession: () => clearSession(sessionId)
  }
}
